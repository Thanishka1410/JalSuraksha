const WaterTank = require('../models/WaterTank');
const Alert = require('../models/Alert');

const createTank = async (req, res) => {
  try {
    const tank = await WaterTank.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Water tank created successfully',
      data: { tank }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating water tank',
      error: error.message
    });
  }
};

const getTanks = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, status, type } = req.query;
    const query = {};

    if (village) query.village = village;
    if (status) query.status = status;
    if (type) query.type = type;

    const total = await WaterTank.countDocuments(query);
    const tanks = await WaterTank.find(query)
      .populate('village', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tanks,
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
      message: 'Error fetching water tanks',
      error: error.message
    });
  }
};

const getTank = async (req, res) => {
  try {
    const tank = await WaterTank.findById(req.params.id)
      .populate('village', 'name code district');

    if (!tank) {
      return res.status(404).json({
        success: false,
        message: 'Water tank not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { tank }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching water tank',
      error: error.message
    });
  }
};

const updateTank = async (req, res) => {
  try {
    const tank = await WaterTank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tank) {
      return res.status(404).json({
        success: false,
        message: 'Water tank not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water tank updated successfully',
      data: { tank }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating water tank',
      error: error.message
    });
  }
};

const deleteTank = async (req, res) => {
  try {
    const tank = await WaterTank.findByIdAndDelete(req.params.id);

    if (!tank) {
      return res.status(404).json({
        success: false,
        message: 'Water tank not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water tank deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting water tank',
      error: error.message
    });
  }
};

const updateWaterLevel = async (req, res) => {
  try {
    const { currentLevel, dailyConsumption } = req.body;

    const tank = await WaterTank.findById(req.params.id);
    if (!tank) {
      return res.status(404).json({
        success: false,
        message: 'Water tank not found'
      });
    }

    if (currentLevel !== undefined) {
      tank.currentLevel = Math.min(currentLevel, tank.capacity);
    }
    if (dailyConsumption !== undefined) {
      tank.dailyConsumption = dailyConsumption;
    }

    const levelPercentage = (tank.currentLevel / tank.capacity) * 100;

    if (levelPercentage >= 95) {
      tank.status = 'overflow';
      if (tank.status !== 'full' && tank.status !== 'overflow') {
        await Alert.create({
          village: tank.village,
          type: 'tank_overflow',
          severity: 'high',
          title: `Tank ${tank.name} Overflow Risk`,
          message: `Tank ${tank.name} is at ${Math.round(levelPercentage)}% capacity. Risk of overflow.`,
          relatedEntity: { model: 'WaterTank', id: tank._id }
        });
      }
    } else if (levelPercentage >= 75) {
      tank.status = 'full';
    } else if (levelPercentage >= 25) {
      tank.status = 'normal';
    } else if (levelPercentage > 0) {
      tank.status = 'low';
      if (tank.status !== 'low' && tank.status !== 'empty') {
        await Alert.create({
          village: tank.village,
          type: 'tank_low',
          severity: 'medium',
          title: `Tank ${tank.name} Low Level`,
          message: `Tank ${tank.name} is at ${Math.round(levelPercentage)}% capacity. Refill needed.`,
          relatedEntity: { model: 'WaterTank', id: tank._id }
        });
      }
    } else {
      tank.status = 'empty';
      await Alert.create({
        village: tank.village,
        type: 'tank_low',
        severity: 'critical',
        title: `Tank ${tank.name} Empty`,
        message: `Tank ${tank.name} is empty. Immediate refill required.`,
        relatedEntity: { model: 'WaterTank', id: tank._id }
      });
    }

    await tank.save();

    res.status(200).json({
      success: true,
      message: 'Water level updated successfully',
      data: { tank }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating water level',
      error: error.message
    });
  }
};

const getTankStats = async (req, res) => {
  try {
    const { village } = req.query;
    const query = village ? { village } : {};

    const tanks = await WaterTank.find(query);

    const stats = {
      total: tanks.length,
      totalCapacity: tanks.reduce((sum, t) => sum + t.capacity, 0),
      currentTotal: tanks.reduce((sum, t) => sum + t.currentLevel, 0),
      avgLevel: tanks.length > 0
        ? Math.round(tanks.reduce((sum, t) => sum + (t.currentLevel / t.capacity) * 100, 0) / tanks.length)
        : 0,
      byStatus: {
        full: tanks.filter(t => t.status === 'full').length,
        normal: tanks.filter(t => t.status === 'normal').length,
        low: tanks.filter(t => t.status === 'low').length,
        empty: tanks.filter(t => t.status === 'empty').length,
        overflow: tanks.filter(t => t.status === 'overflow').length
      },
      byType: {
        overhead: tanks.filter(t => t.type === 'overhead').length,
        underground: tanks.filter(t => t.type === 'underground').length,
        ground: tanks.filter(t => t.type === 'ground').length
      },
      totalDailyConsumption: tanks.reduce((sum, t) => sum + t.dailyConsumption, 0)
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tank stats',
      error: error.message
    });
  }
};

module.exports = {
  createTank,
  getTanks,
  getTank,
  updateTank,
  deleteTank,
  updateWaterLevel,
  getTankStats
};
