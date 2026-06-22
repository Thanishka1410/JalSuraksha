const Pipeline = require('../models/Pipeline');
const Alert = require('../models/Alert');

const createPipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Pipeline created successfully',
      data: { pipeline }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pipeline',
      error: error.message
    });
  }
};

const getPipelines = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, status, material } = req.query;
    const query = {};

    if (village) query.village = village;
    if (status) query.status = status;
    if (material) query.material = material;

    const total = await Pipeline.countDocuments(query);
    const pipelines = await Pipeline.find(query)
      .populate('village', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        pipelines,
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
      message: 'Error fetching pipelines',
      error: error.message
    });
  }
};

const getPipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id)
      .populate('village', 'name code district')
      .populate('leakReports.reportedBy', 'name email');

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { pipeline }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pipeline',
      error: error.message
    });
  }
};

const updatePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pipeline updated successfully',
      data: { pipeline }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pipeline',
      error: error.message
    });
  }
};

const deletePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndDelete(req.params.id);

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pipeline deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pipeline',
      error: error.message
    });
  }
};

const reportLeak = async (req, res) => {
  try {
    const { description } = req.body;

    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    pipeline.leakReports.push({
      reportedBy: req.user.id,
      description,
      status: 'reported',
      reportedAt: new Date()
    });

    if (pipeline.status === 'good') {
      pipeline.status = 'fair';
    } else if (pipeline.status === 'fair') {
      pipeline.status = 'poor';
    }

    await pipeline.save();

    await Alert.create({
      village: pipeline.village,
      type: 'leak_detected',
      severity: 'high',
      title: `Leak Reported in ${pipeline.name}`,
      message: `A leak has been reported in pipeline ${pipeline.name}. ${description}`,
      relatedEntity: { model: 'Pipeline', id: pipeline._id }
    });

    res.status(200).json({
      success: true,
      message: 'Leak reported successfully',
      data: { pipeline }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reporting leak',
      error: error.message
    });
  }
};

const getPipelineStats = async (req, res) => {
  try {
    const { village } = req.query;
    const query = village ? { village } : {};

    const pipelines = await Pipeline.find(query);

    const stats = {
      total: pipelines.length,
      totalLength: pipelines.reduce((sum, p) => sum + (p.length || 0), 0),
      byStatus: {
        good: pipelines.filter(p => p.status === 'good').length,
        fair: pipelines.filter(p => p.status === 'fair').length,
        poor: pipelines.filter(p => p.status === 'poor').length,
        damaged: pipelines.filter(p => p.status === 'damaged').length
      },
      byMaterial: {
        PVC: pipelines.filter(p => p.material === 'PVC').length,
        HDPE: pipelines.filter(p => p.material === 'HDPE').length,
        GI: pipelines.filter(p => p.material === 'GI').length,
        cast_iron: pipelines.filter(p => p.material === 'cast_iron').length
      },
      totalLeakReports: pipelines.reduce((sum, p) => sum + p.leakReports.length, 0),
      activeLeaks: pipelines.reduce((sum, p) =>
        sum + p.leakReports.filter(lr => lr.status === 'reported' || lr.status === 'verified').length, 0
      )
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pipeline stats',
      error: error.message
    });
  }
};

module.exports = {
  createPipeline,
  getPipelines,
  getPipeline,
  updatePipeline,
  deletePipeline,
  reportLeak,
  getPipelineStats
};
