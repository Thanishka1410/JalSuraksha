const WaterQuality = require('../models/WaterQuality');
const Alert = require('../models/Alert');
const User = require('../models/User');
const Village = require('../models/Village');
const { calculateWaterQualityStatus } = require('../utils/helpers');
const { WATER_QUALITY_THRESHOLDS } = require('../config/constants');
const { sendWaterQualityAlertEmail } = require('../utils/emailService');

const createWaterQuality = async (req, res) => {
  try {
    const { village, parameters, location, sampleDate } = req.body;

    const overallStatus = calculateWaterQualityStatus(parameters);
    const recommendations = generateRecommendations(parameters, overallStatus);

    const waterQuality = await WaterQuality.create({
      village,
      recordedBy: req.user.id,
      parameters,
      location,
      sampleDate: sampleDate || new Date(),
      overallStatus,
      recommendations
    });

    if (overallStatus === 'unsafe') {
      await Alert.create({
        village,
        type: 'water_quality_risk',
        severity: 'high',
        title: 'Unsafe Water Quality Detected',
        message: `Water quality test on ${new Date(sampleDate).toLocaleDateString()} showed unsafe levels. Immediate action required.`,
        relatedEntity: { model: 'WaterQuality', id: waterQuality._id }
      });
      // Notify GP admin (non-blocking)
      Village.findById(village).populate('gpAdmin', 'name email').then(vil => {
        if (vil && vil.gpAdmin && vil.gpAdmin.email) {
          sendWaterQualityAlertEmail(vil.gpAdmin.email, vil.gpAdmin.name, waterQuality, vil.name);
        }
      }).catch(() => {});
    } else if (overallStatus === 'needs_inspection') {
      await Alert.create({
        village,
        type: 'water_quality_risk',
        severity: 'medium',
        title: 'Water Quality Needs Inspection',
        message: `Water quality test on ${new Date(sampleDate).toLocaleDateString()} shows parameters near threshold. Inspection recommended.`,
        relatedEntity: { model: 'WaterQuality', id: waterQuality._id }
      });
      // Notify GP admin (non-blocking)
      Village.findById(village).populate('gpAdmin', 'name email').then(vil => {
        if (vil && vil.gpAdmin && vil.gpAdmin.email) {
          sendWaterQualityAlertEmail(vil.gpAdmin.email, vil.gpAdmin.name, waterQuality, vil.name);
        }
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Water quality record created successfully',
      data: { waterQuality }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating water quality record',
      error: error.message
    });
  }
};

const getWaterQualityRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, status, startDate, endDate } = req.query;
    const query = {};

    if (village) query.village = village;
    if (status) query.overallStatus = status;
    if (startDate || endDate) {
      query.sampleDate = {};
      if (startDate) query.sampleDate.$gte = new Date(startDate);
      if (endDate) query.sampleDate.$lte = new Date(endDate);
    }

    const total = await WaterQuality.countDocuments(query);
    const records = await WaterQuality.find(query)
      .populate('village', 'name code')
      .populate('recordedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ sampleDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching water quality records',
      error: error.message
    });
  }
};

const getWaterQualityRecord = async (req, res) => {
  try {
    const record = await WaterQuality.findById(req.params.id)
      .populate('village', 'name code district')
      .populate('recordedBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Water quality record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { record }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching water quality record',
      error: error.message
    });
  }
};

const updateWaterQuality = async (req, res) => {
  try {
    const { parameters } = req.body;
    let updateData = { ...req.body };

    if (parameters) {
      updateData.overallStatus = calculateWaterQualityStatus(parameters);
      updateData.recommendations = generateRecommendations(parameters, updateData.overallStatus);
    }

    const record = await WaterQuality.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Water quality record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water quality record updated successfully',
      data: { record }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating water quality record',
      error: error.message
    });
  }
};

const deleteWaterQuality = async (req, res) => {
  try {
    const record = await WaterQuality.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Water quality record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water quality record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting water quality record',
      error: error.message
    });
  }
};

const analyzeQuality = async (req, res) => {
  try {
    const { parameters } = req.body;

    const status = calculateWaterQualityStatus(parameters);
    const recommendations = generateRecommendations(parameters, status);
    const detailedAnalysis = analyzeParameters(parameters);

    res.status(200).json({
      success: true,
      data: {
        status,
        recommendations,
        analysis: detailedAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing water quality',
      error: error.message
    });
  }
};

const getQualityTrends = async (req, res) => {
  try {
    const { village, parameter, days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const records = await WaterQuality.find({
      village,
      sampleDate: { $gte: startDate }
    })
      .select('parameters sampleDate overallStatus')
      .sort({ sampleDate: 1 });

    const trends = records.map(record => ({
      date: record.sampleDate,
      parameters: record.parameters,
      status: record.overallStatus
    }));

    res.status(200).json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality trends',
      error: error.message
    });
  }
};

const getQualityAlerts = async (req, res) => {
  try {
    const { village, page = 1, limit = 10 } = req.query;
    const query = { overallStatus: { $in: ['unsafe', 'needs_inspection'] } };

    if (village) query.village = village;

    const total = await WaterQuality.countDocuments(query);
    const records = await WaterQuality.find(query)
      .populate('village', 'name code')
      .populate('recordedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ sampleDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality alerts',
      error: error.message
    });
  }
};

function generateRecommendations(parameters, status) {
  const recommendations = [];

  if (parameters.pH !== undefined) {
    if (parameters.pH < WATER_QUALITY_THRESHOLDS.pH.min) {
      recommendations.push('pH level is too low. Consider adding lime or soda ash.');
    } else if (parameters.pH > WATER_QUALITY_THRESHOLDS.pH.max) {
      recommendations.push('pH level is too high. Consider adding acid or carbon dioxide.');
    }
  }

  if (parameters.TDS !== undefined && parameters.TDS > WATER_QUALITY_THRESHOLDS.TDS.max) {
    recommendations.push('TDS level exceeds safe limits. Consider reverse osmosis or distillation.');
  }

  if (parameters.turbidity !== undefined && parameters.turbidity > WATER_QUALITY_THRESHOLDS.turbidity.max) {
    recommendations.push('Turbidity is high. Consider filtration or sedimentation treatment.');
  }

  if (parameters.chlorine !== undefined) {
    if (parameters.chlorine < WATER_QUALITY_THRESHOLDS.chlorine.min) {
      recommendations.push('Chlorine level is low. Re-chlorination recommended.');
    } else if (parameters.chlorine > WATER_QUALITY_THRESHOLDS.chlorine.max) {
      recommendations.push('Chlorine level is high. Allow time for dissipation before use.');
    }
  }

  if (parameters.fluoride !== undefined && parameters.fluoride > WATER_QUALITY_THRESHOLDS.fluoride.max) {
    recommendations.push('Fluoride level exceeds safe limits. Defluoridation treatment required.');
  }

  if (status === 'unsafe') {
    recommendations.push('Water is not safe for drinking. Boil water before use or use alternative source.');
  }

  return recommendations;
}

function analyzeParameters(parameters) {
  const analysis = {};

  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && WATER_QUALITY_THRESHOLDS[key]) {
      const threshold = WATER_QUALITY_THRESHOLDS[key];
      let status = 'normal';

      if (key === 'pH' || key === 'chlorine') {
        if (value < threshold.min || value > threshold.max) {
          status = 'critical';
        } else if (value < threshold.min + (threshold.max - threshold.min) * 0.15 ||
                   value > threshold.max - (threshold.max - threshold.min) * 0.15) {
          status = 'warning';
        }
      } else {
        if (value > threshold.max) {
          status = 'critical';
        } else if (value > threshold.max * 0.8) {
          status = 'warning';
        }
      }

      analysis[key] = { value, threshold, status };
    }
  }

  return analysis;
}

module.exports = {
  createWaterQuality,
  getWaterQualityRecords,
  getWaterQualityRecord,
  updateWaterQuality,
  deleteWaterQuality,
  analyzeQuality,
  getQualityTrends,
  getQualityAlerts
};
