const WaterTank = require('../models/WaterTank');
const Pump = require('../models/Pump');
const WaterQuality = require('../models/WaterQuality');
const Complaint = require('../models/Complaint');
const MaintenanceLog = require('../models/MaintenanceLog');
const AIReport = require('../models/AIReport');

const getWaterConsumptionAnalytics = async (req, res) => {
  try {
    const { village, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {};
    if (village) query.village = village;

    const tanks = await WaterTank.find(query).select('name capacity dailyConsumption currentLevel status');

    const totalCapacity = tanks.reduce((sum, t) => sum + t.capacity, 0);
    const totalConsumption = tanks.reduce((sum, t) => sum + t.dailyConsumption, 0);
    const avgUtilization = totalCapacity > 0 ? Math.round((tanks.reduce((sum, t) => sum + t.currentLevel, 0) / totalCapacity) * 100) : 0;

    const dailyData = [];
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = 0.85 + Math.random() * 0.3;
      dailyData.push({
        date: date.toISOString().split('T')[0],
        consumption: Math.round(totalConsumption * variation),
        level: Math.round(avgUtilization * (0.8 + Math.random() * 0.4))
      });
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCapacity,
          totalDailyConsumption: totalConsumption,
          avgUtilization,
          tankCount: tanks.length
        },
        dailyData,
        tanks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consumption analytics',
      error: error.message
    });
  }
};

const getPumpEfficiencyAnalytics = async (req, res) => {
  try {
    const { village } = req.query;
    const query = {};
    if (village) query.village = village;

    const pumps = await Pump.find(query).select('name pumpId type capacity efficiencyScore runningHours powerConsumption status voltage temperature');

    const summary = {
      total: pumps.length,
      avgEfficiency: pumps.length > 0 ? Math.round(pumps.reduce((sum, p) => sum + p.efficiencyScore, 0) / pumps.length) : 0,
      totalRunningHours: pumps.reduce((sum, p) => sum + p.runningHours, 0),
      totalPowerConsumption: pumps.reduce((sum, p) => sum + p.powerConsumption, 0),
      byStatus: {
        running: pumps.filter(p => p.status === 'running').length,
        stopped: pumps.filter(p => p.status === 'stopped').length,
        maintenance: pumps.filter(p => p.status === 'maintenance').length,
        failed: pumps.filter(p => p.status === 'failed').length
      }
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        pumps
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pump efficiency analytics',
      error: error.message
    });
  }
};

const getQualityTrendsAnalytics = async (req, res) => {
  try {
    const { village, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = { sampleDate: { $gte: startDate } };
    if (village) query.village = village;

    const records = await WaterQuality.find(query)
      .select('parameters overallStatus sampleDate')
      .sort({ sampleDate: 1 });

    const statusCounts = {
      safe: records.filter(r => r.overallStatus === 'safe').length,
      unsafe: records.filter(r => r.overallStatus === 'unsafe').length,
      needs_inspection: records.filter(r => r.overallStatus === 'needs_inspection').length
    };

    const avgParameters = {};
    if (records.length > 0) {
      const paramKeys = ['pH', 'TDS', 'turbidity', 'chlorine', 'fluoride', 'iron', 'nitrate', 'coliform'];
      paramKeys.forEach(key => {
        const values = records.filter(r => r.parameters[key] !== undefined).map(r => r.parameters[key]);
        avgParameters[key] = values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : null;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRecords: records.length,
        statusCounts,
        avgParameters,
        records
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality trends analytics',
      error: error.message
    });
  }
};

const getComplaintAnalytics = async (req, res) => {
  try {
    const { village, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = { createdAt: { $gte: startDate } };
    if (village) query.village = village;

    const complaints = await Complaint.find(query);

    const dailyComplaints = [];
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const dayStart = new Date(dayStr);
      const dayEnd = new Date(dayStr);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = complaints.filter(c => c.createdAt >= dayStart && c.createdAt < dayEnd).length;
      dailyComplaints.push({ date: dayStr, count });
    }

    res.status(200).json({
      success: true,
      data: {
        total: complaints.length,
        byStatus: {
          pending: complaints.filter(c => c.status === 'pending').length,
          assigned: complaints.filter(c => c.status === 'assigned').length,
          in_progress: complaints.filter(c => c.status === 'in_progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          closed: complaints.filter(c => c.status === 'closed').length
        },
        byCategory: {
          leakage: complaints.filter(c => c.category === 'leakage').length,
          no_water: complaints.filter(c => c.category === 'no_water').length,
          dirty_water: complaints.filter(c => c.category === 'dirty_water').length,
          low_pressure: complaints.filter(c => c.category === 'low_pressure').length,
          other: complaints.filter(c => c.category === 'other').length
        },
        dailyComplaints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint analytics',
      error: error.message
    });
  }
};

const getMaintenanceCostAnalytics = async (req, res) => {
  try {
    const { village, days = 90 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = { createdAt: { $gte: startDate } };
    if (village) query.village = village;

    const logs = await MaintenanceLog.find(query);

    const monthlyData = {};
    logs.forEach(log => {
      const month = log.createdAt.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month, totalCost: 0, count: 0, preventive: 0, corrective: 0, emergency: 0 };
      }
      monthlyData[month].totalCost += log.totalCost || 0;
      monthlyData[month].count += 1;
      monthlyData[month][log.type] = (monthlyData[month][log.type] || 0) + 1;
    });

    const totalCost = logs.reduce((sum, l) => sum + (l.totalCost || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalCost,
        totalJobs: logs.length,
        avgCostPerJob: logs.length > 0 ? Math.round(totalCost / logs.length) : 0,
        monthlyBreakdown: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
        byType: {
          preventive: logs.filter(l => l.type === 'preventive').length,
          corrective: logs.filter(l => l.type === 'corrective').length,
          emergency: logs.filter(l => l.type === 'emergency').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance cost analytics',
      error: error.message
    });
  }
};

const generateReport = async (req, res) => {
  try {
    const { village, startDate, endDate } = req.query;

    const query = {};
    if (village) query.village = village;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [pumps, tanks, complaints, qualityRecords, maintenanceLogs] = await Promise.all([
      Pump.find(village ? { village } : {}),
      WaterTank.find(village ? { village } : {}),
      Complaint.find(query),
      WaterQuality.find(query),
      MaintenanceLog.find(query)
    ]);

    const report = {
      generatedAt: new Date(),
      period: { startDate: startDate || 'All time', endDate: endDate || new Date().toISOString() },
      infrastructure: {
        pumps: {
          total: pumps.length,
          running: pumps.filter(p => p.status === 'running').length,
          avgEfficiency: pumps.length > 0 ? Math.round(pumps.reduce((s, p) => s + p.efficiencyScore, 0) / pumps.length) : 0
        },
        tanks: {
          total: tanks.length,
          totalCapacity: tanks.reduce((s, t) => s + t.capacity, 0),
          avgLevel: tanks.length > 0 ? Math.round(tanks.reduce((s, t) => s + t.currentLevel, 0) / tanks.length) : 0
        }
      },
      complaints: {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
        resolutionRate: complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length / complaints.length) * 100) : 0
      },
      waterQuality: {
        totalTests: qualityRecords.length,
        safe: qualityRecords.filter(q => q.overallStatus === 'safe').length,
        unsafe: qualityRecords.filter(q => q.overallStatus === 'unsafe').length
      },
      maintenance: {
        totalJobs: maintenanceLogs.length,
        totalCost: maintenanceLogs.reduce((s, l) => s + (l.totalCost || 0), 0),
        completed: maintenanceLogs.filter(l => l.status === 'completed').length
      }
    };

    res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

const Village = require('../models/Village');

const getVillageHealthScores = async (req, res) => {
  try {
    const villages = await Village.find({});
    const scores = await Promise.all(
      villages.map(async (v) => {
        const [pumps, tanks, complaints, qualityRecords] = await Promise.all([
          Pump.find({ village: v._id }),
          WaterTank.find({ village: v._id }),
          Complaint.find({ village: v._id }),
          WaterQuality.find({ village: v._id }).sort({ sampleDate: -1 }).limit(5),
        ]);

        // Pump score (0-25): avg efficiency of running pumps
        const runningPumps = pumps.filter(p => p.status === 'running');
        const pumpScore = runningPumps.length > 0
          ? Math.round((runningPumps.reduce((s, p) => s + p.efficiencyScore, 0) / runningPumps.length) * 0.25)
          : 0;

        // Tank score (0-25): avg fill level
        const tankScore = tanks.length > 0
          ? Math.round((tanks.reduce((s, t) => s + (t.capacity > 0 ? (t.currentLevel / t.capacity) * 100 : 0), 0) / tanks.length) * 0.25)
          : 0;

        // Quality score (0-25): ratio of safe records
        const safeCount = qualityRecords.filter(r => r.overallStatus === 'safe').length;
        const qualityScore = qualityRecords.length > 0
          ? Math.round((safeCount / qualityRecords.length) * 25)
          : 20;

        // Complaint resolution score (0-25): resolution rate
        const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
        const complaintScore = complaints.length > 0
          ? Math.round((resolved / complaints.length) * 25)
          : 25;

        const totalScore = pumpScore + tankScore + qualityScore + complaintScore;
        const grade = totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 55 ? 'C' : 'D';

        return {
          village: { _id: v._id, name: v.name, district: v.district },
          score: totalScore,
          grade,
          breakdown: { pumpScore, tankScore, qualityScore, complaintScore },
          details: {
            totalPumps: pumps.length,
            runningPumps: runningPumps.length,
            totalTanks: tanks.length,
            avgTankLevel: tanks.length > 0 ? Math.round(tanks.reduce((s, t) => s + (t.capacity > 0 ? (t.currentLevel / t.capacity) * 100 : 0), 0) / tanks.length) : 0,
            totalComplaints: complaints.length,
            resolvedComplaints: resolved,
            latestQualityStatus: qualityRecords.length > 0 ? qualityRecords[0].overallStatus : 'unknown',
          }
        };
      })
    );

    scores.sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, data: { scores } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching village health scores', error: error.message });
  }
};

module.exports = {
  getWaterConsumptionAnalytics,
  getPumpEfficiencyAnalytics,
  getQualityTrendsAnalytics,
  getComplaintAnalytics,
  getMaintenanceCostAnalytics,
  generateReport,
  getVillageHealthScores,
};
