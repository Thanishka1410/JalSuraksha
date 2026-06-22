const Pump = require('../models/Pump');
const MaintenanceLog = require('../models/MaintenanceLog');
const Alert = require('../models/Alert');
const { calculatePumpHealth } = require('../utils/helpers');

const createPump = async (req, res) => {
  try {
    const pump = await Pump.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Pump created successfully',
      data: { pump }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pump',
      error: error.message
    });
  }
};

const getPumps = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, status, type } = req.query;
    const query = {};

    if (village) query.village = village;
    if (status) query.status = status;
    if (type) query.type = type;

    const total = await Pump.countDocuments(query);
    const pumps = await Pump.find(query)
      .populate('village', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        pumps,
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
      message: 'Error fetching pumps',
      error: error.message
    });
  }
};

const getPump = async (req, res) => {
  try {
    const pump = await Pump.findById(req.params.id)
      .populate('village', 'name code district');

    if (!pump) {
      return res.status(404).json({
        success: false,
        message: 'Pump not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { pump }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pump',
      error: error.message
    });
  }
};

const updatePump = async (req, res) => {
  try {
    const pump = await Pump.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pump) {
      return res.status(404).json({
        success: false,
        message: 'Pump not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pump updated successfully',
      data: { pump }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pump',
      error: error.message
    });
  }
};

const deletePump = async (req, res) => {
  try {
    const pump = await Pump.findByIdAndDelete(req.params.id);

    if (!pump) {
      return res.status(404).json({
        success: false,
        message: 'Pump not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pump deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pump',
      error: error.message
    });
  }
};

const getPumpStats = async (req, res) => {
  try {
    const { village } = req.query;
    const query = village ? { village } : {};

    const pumps = await Pump.find(query);

    const stats = {
      total: pumps.length,
      byStatus: {
        running: pumps.filter(p => p.status === 'running').length,
        stopped: pumps.filter(p => p.status === 'stopped').length,
        maintenance: pumps.filter(p => p.status === 'maintenance').length,
        failed: pumps.filter(p => p.status === 'failed').length
      },
      byType: {
        submersible: pumps.filter(p => p.type === 'submersible').length,
        centrifugal: pumps.filter(p => p.type === 'centrifugal').length,
        booster: pumps.filter(p => p.type === 'booster').length,
        jet: pumps.filter(p => p.type === 'jet').length
      },
      totalCapacity: pumps.reduce((sum, p) => sum + (p.capacity || 0), 0),
      avgEfficiency: pumps.length > 0
        ? Math.round(pumps.reduce((sum, p) => sum + p.efficiencyScore, 0) / pumps.length)
        : 0,
      totalRunningHours: pumps.reduce((sum, p) => sum + p.runningHours, 0),
      totalPowerConsumption: pumps.reduce((sum, p) => sum + p.powerConsumption, 0)
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pump stats',
      error: error.message
    });
  }
};

const updatePumpStatus = async (req, res) => {
  try {
    const { runningHours, powerConsumption, voltage, temperature, status } = req.body;

    const pump = await Pump.findById(req.params.id);
    if (!pump) {
      return res.status(404).json({
        success: false,
        message: 'Pump not found'
      });
    }

    if (runningHours !== undefined) pump.runningHours = runningHours;
    if (powerConsumption !== undefined) pump.powerConsumption = powerConsumption;
    if (voltage !== undefined) pump.voltage = voltage;
    if (temperature !== undefined) pump.temperature = temperature;
    if (status) pump.status = status;

    pump.efficiencyScore = calculatePumpHealth(pump);

    if (pump.efficiencyScore < 30 && pump.status !== 'failed') {
      await Alert.create({
        village: pump.village,
        type: 'pump_failure',
        severity: 'high',
        title: `Pump ${pump.name} Health Critical`,
        message: `Pump ${pump.name} health score has dropped to ${pump.efficiencyScore}. Immediate attention required.`,
        relatedEntity: { model: 'Pump', id: pump._id }
      });
    }

    await pump.save();

    res.status(200).json({
      success: true,
      message: 'Pump status updated successfully',
      data: { pump }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pump status',
      error: error.message
    });
  }
};

const getMaintenanceSchedule = async (req, res) => {
  try {
    const { village } = req.query;
    const query = {
      nextMaintenance: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    };

    if (village) query.village = village;

    const pumps = await Pump.find(query)
      .populate('village', 'name code')
      .sort({ nextMaintenance: 1 });

    res.status(200).json({
      success: true,
      data: { pumps }
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
  createPump,
  getPumps,
  getPump,
  updatePump,
  deletePump,
  getPumpStats,
  updatePumpStatus,
  getMaintenanceSchedule
};
