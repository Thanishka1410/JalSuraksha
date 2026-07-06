const Village = require('../models/Village');
const Pump = require('../models/Pump');
const WaterTank = require('../models/WaterTank');
const Complaint = require('../models/Complaint');
const WaterQuality = require('../models/WaterQuality');

const createVillage = async (req, res) => {
  try {
    const { name, code, district, state, population, totalHouseholds } = req.body;
    const village = await Village.create({ name, code, district, state, population, totalHouseholds });
    res.status(201).json({
      success: true,
      message: 'Village created successfully',
      data: { village }
    });
  } catch (error) {
    console.error('Village create error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating village'
    });
  }
};

const getVillages = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, district, state } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (district) query.district = district;
    if (state) query.state = state;

    const total = await Village.countDocuments(query);
    const villages = await Village.find(query)
      .populate('gpAdmin', 'name email')
      .populate('vWSC', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        villages,
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
      message: 'Error fetching villages',
      error: error.message
    });
  }
};

const getVillage = async (req, res) => {
  try {
    const village = await Village.findById(req.params.id)
      .populate('gpAdmin', 'name email phone')
      .populate('vWSC', 'name email phone');

    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { village }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching village',
      error: error.message
    });
  }
};

const updateVillage = async (req, res) => {
  try {
    const village = await Village.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Village updated successfully',
      data: { village }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating village',
      error: error.message
    });
  }
};

const deleteVillage = async (req, res) => {
  try {
    const village = await Village.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Village deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting village',
      error: error.message
    });
  }
};

const getVillageStats = async (req, res) => {
  try {
    const villageId = req.params.id;

    const village = await Village.findById(villageId);
    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    const [pumps, tanks, complaints, qualityRecords] = await Promise.all([
      Pump.find({ village: villageId }),
      WaterTank.find({ village: villageId }),
      Complaint.find({ village: villageId }),
      WaterQuality.find({ village: villageId }).sort({ sampleDate: -1 }).limit(10)
    ]);

    const pumpStats = {
      total: pumps.length,
      running: pumps.filter(p => p.status === 'running').length,
      stopped: pumps.filter(p => p.status === 'stopped').length,
      maintenance: pumps.filter(p => p.status === 'maintenance').length,
      failed: pumps.filter(p => p.status === 'failed').length,
      avgEfficiency: pumps.length > 0
        ? Math.round(pumps.reduce((sum, p) => sum + p.efficiencyScore, 0) / pumps.length)
        : 0
    };

    const tankStats = {
      total: tanks.length,
      totalCapacity: tanks.reduce((sum, t) => sum + t.capacity, 0),
      currentTotal: tanks.reduce((sum, t) => sum + t.currentLevel, 0),
      avgLevel: tanks.length > 0
        ? Math.round(tanks.reduce((sum, t) => sum + (t.currentLevel / t.capacity) * 100, 0) / tanks.length)
        : 0,
      full: tanks.filter(t => t.status === 'full').length,
      normal: tanks.filter(t => t.status === 'normal').length,
      low: tanks.filter(t => t.status === 'low').length,
      empty: tanks.filter(t => t.status === 'empty').length
    };

    const complaintStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      assigned: complaints.filter(c => c.status === 'assigned').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      closed: complaints.filter(c => c.status === 'closed').length
    };

    const qualityStats = {
      totalRecords: qualityRecords.length,
      latestStatus: qualityRecords.length > 0 ? qualityRecords[0].overallStatus : 'N/A',
      safe: qualityRecords.filter(q => q.overallStatus === 'safe').length,
      unsafe: qualityRecords.filter(q => q.overallStatus === 'unsafe').length,
      needsInspection: qualityRecords.filter(q => q.overallStatus === 'needs_inspection').length
    };

    res.status(200).json({
      success: true,
      data: {
        village,
        pumps: pumpStats,
        tanks: tankStats,
        complaints: complaintStats,
        waterQuality: qualityStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching village stats',
      error: error.message
    });
  }
};

module.exports = {
  createVillage,
  getVillages,
  getVillage,
  updateVillage,
  deleteVillage,
  getVillageStats
};
