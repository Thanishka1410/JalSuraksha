const MaintenanceLog = require('../models/MaintenanceLog');
const Pump = require('../models/Pump');
const WaterTank = require('../models/WaterTank');
const Pipeline = require('../models/Pipeline');
const Valve = require('../models/Valve');

const createMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.create({
      ...req.body,
      performedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance log created successfully',
      data: { log }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance log',
      error: error.message
    });
  }
};

const getMaintenanceLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, status, type, assetType } = req.query;
    const query = {};

    if (village) query.village = village;
    if (status) query.status = status;
    if (type) query.type = type;
    if (assetType === 'pump') query.pump = { $exists: true, $ne: null };
    else if (assetType === 'tank') query.tank = { $exists: true, $ne: null };
    else if (assetType === 'pipeline') query.pipeline = { $exists: true, $ne: null };
    else if (assetType === 'valve') query.valve = { $exists: true, $ne: null };

    const total = await MaintenanceLog.countDocuments(query);
    const logs = await MaintenanceLog.find(query)
      .populate('village', 'name code')
      .populate('performedBy', 'name email')
      .populate('pump', 'name pumpId')
      .populate('tank', 'name tankId')
      .populate('pipeline', 'name pipelineId')
      .populate('valve', 'name valveId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        logs,
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
      message: 'Error fetching maintenance logs',
      error: error.message
    });
  }
};

const getMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id)
      .populate('village', 'name code district')
      .populate('performedBy', 'name email phone')
      .populate('pump', 'name pumpId status')
      .populate('tank', 'name tankId status')
      .populate('pipeline', 'name pipelineId status')
      .populate('valve', 'name valveId status');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { log }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance log',
      error: error.message
    });
  }
};

const updateMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance log updated successfully',
      data: { log }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance log',
      error: error.message
    });
  }
};

const deleteMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance log deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance log',
      error: error.message
    });
  }
};

const scheduleMaintenance = async (req, res) => {
  try {
    const log = await MaintenanceLog.create({
      ...req.body,
      performedBy: req.user.id,
      status: 'scheduled'
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance scheduled successfully',
      data: { log }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling maintenance',
      error: error.message
    });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const { description, partsReplaced, totalCost, endTime } = req.body;

    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found'
      });
    }

    log.status = 'completed';
    log.endTime = endTime || new Date();
    if (description) log.description = description;
    if (partsReplaced) log.partsReplaced = partsReplaced;
    if (totalCost !== undefined) log.totalCost = totalCost;

    if (log.pump) {
      await Pump.findByIdAndUpdate(log.pump, {
        lastMaintenance: new Date(),
        nextMaintenance: log.nextMaintenanceDate,
        status: 'running'
      });
    }
    if (log.tank) {
      await WaterTank.findByIdAndUpdate(log.tank, { lastRefilled: new Date() });
    }
    if (log.pipeline) {
      await Pipeline.findByIdAndUpdate(log.pipeline, { status: 'good' });
    }
    if (log.valve) {
      await Valve.findByIdAndUpdate(log.valve, { lastChecked: new Date() });
    }

    await log.save();

    res.status(200).json({
      success: true,
      message: 'Maintenance completed successfully',
      data: { log }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing maintenance',
      error: error.message
    });
  }
};

const getMaintenanceSchedule = async (req, res) => {
  try {
    const { village, days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const query = {
      nextMaintenanceDate: { $lte: futureDate, $gte: new Date() }
    };
    if (village) query.village = village;

    const scheduled = await MaintenanceLog.find(query)
      .populate('village', 'name code')
      .populate('performedBy', 'name email')
      .populate('pump', 'name pumpId')
      .populate('tank', 'name tankId')
      .populate('pipeline', 'name pipelineId')
      .populate('valve', 'name valveId')
      .sort({ nextMaintenanceDate: 1 });

    const upcomingPumps = await Pump.find({
      nextMaintenance: { $lte: futureDate, $gte: new Date() },
      ...(village ? { village } : {})
    }).populate('village', 'name code');

    res.status(200).json({
      success: true,
      data: {
        scheduledLogs: scheduled,
        upcomingPumpMaintenance: upcomingPumps
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance schedule',
      error: error.message
    });
  }
};

module.exports = {
  createMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  scheduleMaintenance,
  completeMaintenance,
  getMaintenanceSchedule
};
