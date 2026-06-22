const Valve = require('../models/Valve');

const createValve = async (req, res) => {
  try {
    const valve = await Valve.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Valve created successfully',
      data: { valve }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating valve',
      error: error.message
    });
  }
};

const getValves = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, status, type, pipeline } = req.query;
    const query = {};

    if (village) query.village = village;
    if (status) query.status = status;
    if (type) query.type = type;
    if (pipeline) query.pipeline = pipeline;

    const total = await Valve.countDocuments(query);
    const valves = await Valve.find(query)
      .populate('village', 'name code')
      .populate('pipeline', 'name pipelineId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        valves,
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
      message: 'Error fetching valves',
      error: error.message
    });
  }
};

const getValve = async (req, res) => {
  try {
    const valve = await Valve.findById(req.params.id)
      .populate('village', 'name code district')
      .populate('pipeline', 'name pipelineId');

    if (!valve) {
      return res.status(404).json({
        success: false,
        message: 'Valve not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { valve }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching valve',
      error: error.message
    });
  }
};

const updateValve = async (req, res) => {
  try {
    const valve = await Valve.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!valve) {
      return res.status(404).json({
        success: false,
        message: 'Valve not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Valve updated successfully',
      data: { valve }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating valve',
      error: error.message
    });
  }
};

const deleteValve = async (req, res) => {
  try {
    const valve = await Valve.findByIdAndDelete(req.params.id);

    if (!valve) {
      return res.status(404).json({
        success: false,
        message: 'Valve not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Valve deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting valve',
      error: error.message
    });
  }
};

const toggleValve = async (req, res) => {
  try {
    const valve = await Valve.findById(req.params.id);

    if (!valve) {
      return res.status(404).json({
        success: false,
        message: 'Valve not found'
      });
    }

    if (valve.status === 'open') {
      valve.status = 'closed';
    } else if (valve.status === 'closed') {
      valve.status = 'open';
    } else {
      valve.status = 'closed';
    }

    valve.lastChecked = new Date();
    await valve.save();

    res.status(200).json({
      success: true,
      message: `Valve ${valve.status === 'open' ? 'opened' : 'closed'} successfully`,
      data: { valve }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling valve',
      error: error.message
    });
  }
};

module.exports = {
  createValve,
  getValves,
  getValve,
  updateValve,
  deleteValve,
  toggleValve
};
