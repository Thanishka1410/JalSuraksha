const express = require('express');
const router = express.Router();
const { getWaterConsumptionAnalytics, getPumpEfficiencyAnalytics, getQualityTrendsAnalytics, getComplaintAnalytics, getMaintenanceCostAnalytics, generateReport, getVillageHealthScores } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

const Pump = require('../models/Pump');
const WaterTank = require('../models/WaterTank');
const WaterQuality = require('../models/WaterQuality');
const Complaint = require('../models/Complaint');
const MaintenanceLog = require('../models/MaintenanceLog');
const Alert = require('../models/Alert');

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [pumps, tanks, qualityRecords, complaints, maintenanceLogs, alerts] = await Promise.all([
      Pump.find({}),
      WaterTank.find({}),
      WaterQuality.find({}).sort({ sampleDate: -1 }),
      Complaint.find({}),
      MaintenanceLog.find({}),
      Alert.find({}).sort({ createdAt: -1 }).limit(10).populate('village', 'name'),
    ]);

    const totalPumps = pumps.length;
    const activePumps = pumps.filter(p => p.status === 'running').length;
    const totalTanks = tanks.length;
    const tankLevels = tanks.map(t => ({
      name: t.name,
      level: t.capacity > 0 ? Math.round((t.currentLevel / t.capacity) * 100) : 0,
      capacity: t.capacity,
    }));
    const waterQualityStatus = qualityRecords.length > 0 ? qualityRecords[0].overallStatus : 'safe';
    const leakAlerts = alerts.filter(a => a.type === 'leak_detected').length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    const maintenanceTasks = maintenanceLogs.filter(l => l.status === 'in_progress' || l.status === 'scheduled').length;

    const totalDailyConsumption = tanks.reduce((sum, t) => sum + (t.dailyConsumption || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalPumps,
        activePumps,
        totalTanks,
        tankLevels,
        waterQualityStatus,
        leakAlerts,
        pendingComplaints,
        maintenanceTasks,
        waterUsage: {
          today: totalDailyConsumption,
          week: totalDailyConsumption * 7,
          month: totalDailyConsumption * 30,
          trend: 5.2,
        },
        recentAlerts: alerts.map(a => ({
          _id: a._id,
          type: a.type,
          severity: a.severity,
          title: a.title,
          message: a.message,
          village: a.village,
          isRead: a.isRead,
          isAcknowledged: !!a.acknowledgedBy,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        })),
        recentComplaints: complaints.slice(0, 5).map(c => ({
          _id: c._id,
          user: c.complainant,
          village: c.village,
          category: c.category,
          description: c.description,
          status: c.status,
          priority: c.priority,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

router.get('/consumption', authenticate, getWaterConsumptionAnalytics);
router.get('/pump-efficiency', authenticate, getPumpEfficiencyAnalytics);
router.get('/quality-trends', authenticate, getQualityTrendsAnalytics);
router.get('/complaints', authenticate, getComplaintAnalytics);
router.get('/maintenance-cost', authenticate, getMaintenanceCostAnalytics);
router.get('/report', authenticate, generateReport);
router.get('/village-health-scores', authenticate, getVillageHealthScores);

module.exports = router;
