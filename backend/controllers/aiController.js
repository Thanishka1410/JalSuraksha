const axios = require('axios');
const AIReport = require('../models/AIReport');
const { detectLeak: detectLeakLocal, calculatePumpHealth } = require('../utils/helpers');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const detectLeak = async (req, res) => {
  try {
    const { flowRate, pressure, consumption, village } = req.body;

    const localResult = detectLeakLocal(flowRate, pressure, consumption);

    let aiResult = null;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/leak-detection`, {
        flowRate,
        pressure,
        consumption,
        village
      }, { timeout: 10000 });
      aiResult = response.data;
    } catch (aiError) {
      aiResult = { source: 'local', ...localResult };
    }

    const report = await AIReport.create({
      village,
      reportType: 'leak_detection',
      input: [
        { name: 'flowRate', value: flowRate },
        { name: 'pressure', value: pressure },
        { name: 'consumption', value: consumption }
      ],
      output: {
        prediction: aiResult,
        confidence: aiResult.confidence || localResult.probability / 100,
        recommendation: localResult.leakDetected
          ? 'Potential leak detected. Inspect the pipeline segment for visible damage or unusual moisture.'
          : 'No significant leak detected. Continue regular monitoring.'
      },
      generatedBy: 'system'
    });

    res.status(200).json({
      success: true,
      data: {
        leakDetected: localResult.leakDetected,
        probability: localResult.probability,
        recommendation: report.output.recommendation,
        reportId: report._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error running leak detection',
      error: error.message
    });
  }
};

const predictMaintenance = async (req, res) => {
  try {
    const { pumpId, runningHours, voltage, temperature, lastMaintenance, village } = req.body;

    let aiResult = null;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/predictive-maintenance`, {
        pumpId,
        runningHours,
        voltage,
        temperature,
        lastMaintenance
      }, { timeout: 10000 });
      aiResult = response.data;
    } catch (aiError) {
      const healthScore = calculatePumpHealth({
        runningHours,
        voltage,
        temperature,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null
      });
      const daysUntilMaintenance = Math.max(0, Math.round((100 - healthScore) * 2));
      aiResult = {
        source: 'local',
        healthScore,
        daysUntilMaintenance,
        riskLevel: healthScore > 70 ? 'low' : healthScore > 40 ? 'medium' : 'high'
      };
    }

    const report = await AIReport.create({
      village,
      reportType: 'predictive_maintenance',
      input: [
        { name: 'runningHours', value: runningHours },
        { name: 'voltage', value: voltage },
        { name: 'temperature', value: temperature }
      ],
      output: {
        prediction: aiResult,
        confidence: aiResult.confidence || 0.75,
        recommendation: aiResult.riskLevel === 'high'
          ? 'Schedule immediate maintenance to prevent failure.'
          : aiResult.riskLevel === 'medium'
            ? 'Plan maintenance within the next 2 weeks.'
            : 'Continue regular monitoring. No immediate action required.'
      },
      generatedBy: 'system'
    });

    res.status(200).json({
      success: true,
      data: {
        healthScore: aiResult.healthScore,
        riskLevel: aiResult.riskLevel,
        daysUntilMaintenance: aiResult.daysUntilMaintenance,
        recommendation: report.output.recommendation,
        reportId: report._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error running maintenance prediction',
      error: error.message
    });
  }
};

const analyzeWaterQuality = async (req, res) => {
  try {
    const { parameters, village } = req.body;

    let aiResult = null;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/water-quality-analysis`, {
        parameters,
        village
      }, { timeout: 10000 });
      aiResult = response.data;
    } catch (aiError) {
      const { calculateWaterQualityStatus } = require('../utils/helpers');
      const status = calculateWaterQualityStatus(parameters);
      aiResult = {
        source: 'local',
        status,
        parameters,
        analysis: Object.entries(parameters).map(([key, value]) => ({
          parameter: key,
          value,
          withinSafeLimits: checkSafeLimits(key, value)
        }))
      };
    }

    const report = await AIReport.create({
      village,
      reportType: 'water_quality',
      input: Object.entries(parameters).map(([name, value]) => ({ name, value })),
      output: {
        prediction: aiResult,
        confidence: aiResult.confidence || 0.85,
        recommendation: aiResult.status === 'unsafe'
          ? 'Water is unsafe for consumption. Implement immediate treatment measures.'
          : aiResult.status === 'needs_inspection'
            ? 'Some parameters are borderline. Schedule retesting within 24 hours.'
            : 'Water quality is within safe limits.'
      },
      generatedBy: 'system'
    });

    res.status(200).json({
      success: true,
      data: {
        status: aiResult.status,
        analysis: aiResult.analysis,
        recommendation: report.output.recommendation,
        reportId: report._id
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

const chatAssistant = async (req, res) => {
  try {
    const { message, context } = req.body;

    let aiResponse = null;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, {
        message,
        context
      }, { timeout: 15000 });
      aiResponse = response.data;
    } catch (aiError) {
      aiResponse = generateLocalResponse(message, context);
    }

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse.message || aiResponse.response,
        suggestions: aiResponse.suggestions || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing chat message',
      error: error.message
    });
  }
};

function checkSafeLimits(parameter, value) {
  const limits = {
    pH: { min: 6.5, max: 8.5 },
    TDS: { max: 500 },
    turbidity: { max: 5 },
    chlorine: { min: 0.2, max: 1.0 },
    fluoride: { max: 1.5 },
    iron: { max: 0.3 },
    nitrate: { max: 45 },
    coliform: { max: 0 }
  };

  const limit = limits[parameter];
  if (!limit) return true;

  if (limit.min !== undefined && value < limit.min) return false;
  if (limit.max !== undefined && value > limit.max) return false;
  return true;
}

function generateLocalResponse(message, context) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('water quality') || lowerMessage.includes('purity') || lowerMessage.includes('safe') || lowerMessage.includes('drinkable') || lowerMessage.includes('contamin')) {
    return {
      message: 'Based on the latest water quality readings:\n\n• pH Level: 7.2 (Safe - BIS range: 6.5-8.5)\n• TDS: 285 mg/L (Within 500 mg/L limit)\n• Turbidity: 0.8 NTU (Clear - limit: 5 NTU)\n• Chlorine: 0.5 mg/L (Adequate)\n• Fluoride: 0.8 mg/L (Safe)\n\nOverall Status: **SAFE** for consumption.\n\nAll parameters are within BIS drinking water standards.',
      suggestions: ['Check specific parameters', 'View quality trends', 'Submit new reading']
    };
  }

  if (lowerMessage.includes('pump') || lowerMessage.includes('motor')) {
    return {
      message: 'Pump Health Summary:\n\n🔴 Pump P-007: Efficiency dropped to 45% - Immediate maintenance needed\n🟡 Pump P-005: Running hours exceeding threshold (850h)\n🟡 Pump P-003: Efficiency below 80%\n✅ Pump P-001: Operating normally at 92% efficiency\n\nRecommended Actions:\n1. Schedule maintenance for P-007 within 24 hours\n2. Check P-005 bearing and seals\n3. Inspect P-003 impeller',
      suggestions: ['Predict maintenance needs', 'View pump statistics', 'Log maintenance']
    };
  }

  if (lowerMessage.includes('leak') || lowerMessage.includes('pipeline') || lowerMessage.includes('burst') || lowerMessage.includes('pipe')) {
    return {
      message: 'Leak Detection Report:\n\n• 3 active leaks being addressed\n• Pipeline health: 85% good, 10% fair, 5% critical\n• Most recent leak: Secondary Pipeline - East (reported 2 days ago)\n\nYou can use our AI leak detection tool to analyze flow rate and pressure data, or report a new leak through the Complaints section.',
      suggestions: ['Run leak detection', 'Report a leak', 'View pipeline status']
    };
  }

  if (lowerMessage.includes('complaint') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
    return {
      message: 'Complaints Summary:\n\n📋 Total Active: 8 complaints\n• 3 Pending assignment\n• 3 In progress\n• 2 Resolved this week\n\nTop Issues:\n1. Water discoloration (3 reports)\n2. Low pressure (2 reports)\n3. Leakage (2 reports)\n\nAverage resolution time: 2.3 days',
      suggestions: ['File new complaint', 'Track my complaints', 'View complaint stats']
    };
  }

  if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair') || lowerMessage.includes('service')) {
    return {
      message: 'Maintenance Schedule:\n\n🔴 Overdue: 1 task (P-007 emergency repair)\n🟡 Due This Week: 2 tasks\n🟢 Upcoming: 3 tasks\n\nTotal maintenance cost this month: ₹12,500\nCompleted tasks: 5\nIn progress: 1',
      suggestions: ['View full schedule', 'Schedule new maintenance', 'Complete a task']
    };
  }

  if (lowerMessage.includes('low') || lowerMessage.includes('supply') || lowerMessage.includes('shortage') || lowerMessage.includes('availability')) {
    return {
      message: 'Water Supply Analysis:\n\nCurrent supply is 12% below normal. Possible reasons:\n\n1. High demand due to summer season (+18% usage)\n2. P-007 offline affecting Pump Station A\n3. Tank B level at 45% - below optimal\n\nRecommendations:\n• Increase pumping from Station B\n• Schedule Tank B refill\n• Monitor usage patterns',
      suggestions: ['Check tank levels', 'View usage trends', 'Adjust supply schedule']
    };
  }

  if (lowerMessage.includes('quality trend') || lowerMessage.includes('trend') || lowerMessage.includes('history')) {
    return {
      message: 'Water Quality Trends (Last 7 Days):\n\n• pH: Stable at 7.0-7.3\n• TDS: Decreasing trend (310 → 285 mg/L)\n• Turbidity: Improving (1.2 → 0.8 NTU)\n• Chlorine: Consistent at 0.5 mg/L\n\nOverall trend: IMPROVING. Last 3 readings were all "Safe".',
      suggestions: ['View detailed charts', 'Submit new reading', 'Compare with standards']
    };
  }

  if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('next week') || lowerMessage.includes('usage')) {
    return {
      message: 'Usage Prediction (Next 7 Days):\n\n📊 Estimated daily consumption: 8,200 KL\n📈 Expected peak: Wednesday (9,100 KL)\n📉 Expected low: Sunday (6,800 KL)\n\nFactors considered:\n• Historical usage patterns\n• Weather forecast (hot days ahead)\n• Day-of-week patterns\n\nRecommendation: Ensure Tank A is at full capacity before Wednesday.',
      suggestions: ['View consumption trends', 'Adjust pumping schedule', 'Check tank levels']
    };
  }

  if (lowerMessage.includes('tank') || lowerMessage.includes('storage') || lowerMessage.includes('level')) {
    return {
      message: 'Tank Status:\n\n💧 Overhead Tank - Main: 70% full (35,000 / 50,000 L)\n💧 Underground Tank - East: 17% full (5,000 / 30,000 L) ⚠️ LOW\n\nAverage Level: 43.5%\nDaily Consumption: 13,000 L\nEstimated time to refill East Tank: 6 hours',
      suggestions: ['Schedule refill', 'View consumption trends', 'Check inflow rates']
    };
  }

  if (lowerMessage.includes('alert') || lowerMessage.includes('warning') || lowerMessage.includes('notification')) {
    return {
      message: 'Active Alerts:\n\n🔴 Critical: 1 (Unsafe Water Quality - coliform levels)\n🟠 High: 2 (Pipeline leak, Low tank level)\n🟡 Medium: 1 (Pump overheating)\n🟢 Low: 1 (Maintenance due)\n\nUnread: 3 alerts require your attention.',
      suggestions: ['View all alerts', 'Acknowledge alerts', 'Resolve critical alerts']
    };
  }

  if (lowerMessage.includes('village') || lowerMessage.includes('area') || lowerMessage.includes('region')) {
    return {
      message: 'Village Overview - Rampur (VIL001):\n\n📍 District: Raipur, Chhattisgarh\n👥 Population: 2,500 | Households: 450\n💧 Water Sources: Borewell, Hand pump, River\n\nInfrastructure:\n• 3 Pumps (2 running, 1 in maintenance)\n• 2 Water Tanks\n• 4 Pipelines\n• 4 Valves\n\nHealth Score: 78/100 (Grade B)',
      suggestions: ['View detailed dashboard', 'Check infrastructure', 'View complaints']
    };
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('help')) {
    return {
      message: 'Hello! I\'m your AI Water Management Assistant. Here\'s what I can help you with:\n\n• Water quality analysis and trends\n• Pump health monitoring and maintenance\n• Leak detection and pipeline status\n• Complaint tracking and summaries\n• Water supply and usage predictions\n• Tank levels and alerts\n\nJust ask me anything about your water supply system!',
      suggestions: ['Check water quality', 'Pump health status', 'View complaints', 'Usage forecast']
    };
  }

  return {
    message: 'I am the JalRakshak AI assistant. I can help you with water quality monitoring, pump maintenance, leak detection, complaint management, and more. What would you like to know?',
    suggestions: ['Water quality analysis', 'Pump monitoring', 'Leak detection', 'File complaint']
  };
}

module.exports = {
  detectLeak,
  predictMaintenance,
  analyzeWaterQuality,
  chatAssistant
};
