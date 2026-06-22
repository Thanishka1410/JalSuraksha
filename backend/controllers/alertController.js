const Alert = require('../models/Alert');

const getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, type, severity, isRead } = req.query;
    const query = {};

    if (village) query.village = village;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .populate('village', 'name code')
      .populate('acknowledgedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        alerts,
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
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert marked as read',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking alert as read',
      error: error.message
    });
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.acknowledgedBy = req.user.id;
    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message
    });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.resolvedAt = new Date();
    alert.isRead = true;
    if (!alert.acknowledgedBy) {
      alert.acknowledgedBy = req.user.id;
    }
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
};

const getAlertStats = async (req, res) => {
  try {
    const { village } = req.query;
    const query = {};
    if (village) query.village = village;

    const alerts = await Alert.find(query);

    const stats = {
      total: alerts.length,
      unread: alerts.filter(a => !a.isRead).length,
      unresolved: alerts.filter(a => !a.resolvedAt).length,
      byType: {
        pump_failure: alerts.filter(a => a.type === 'pump_failure').length,
        water_quality_risk: alerts.filter(a => a.type === 'water_quality_risk').length,
        tank_overflow: alerts.filter(a => a.type === 'tank_overflow').length,
        tank_low: alerts.filter(a => a.type === 'tank_low').length,
        leak_detected: alerts.filter(a => a.type === 'leak_detected').length,
        maintenance_due: alerts.filter(a => a.type === 'maintenance_due').length
      },
      bySeverity: {
        low: alerts.filter(a => a.severity === 'low').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        high: alerts.filter(a => a.severity === 'high').length,
        critical: alerts.filter(a => a.severity === 'critical').length
      }
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert stats',
      error: error.message
    });
  }
};

module.exports = {
  getAlerts,
  markAsRead,
  acknowledgeAlert,
  resolveAlert,
  getAlertStats
};
