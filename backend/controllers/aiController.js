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

  if (lowerMessage.includes('water quality') || lowerMessage.includes('purity')) {
    return {
      message: 'I can help you with water quality analysis. You can submit water quality parameters through the Water Quality section, and I will analyze them against WHO/BIS standards. Would you like to know about specific parameters?',
      suggestions: ['Analyze pH levels', 'Check TDS levels', 'View quality trends']
    };
  }

  if (lowerMessage.includes('pump') || lowerMessage.includes('motor')) {
    return {
      message: 'For pump-related queries, I can help with status monitoring, efficiency analysis, and maintenance predictions. You can check individual pump health or view overall pump statistics.',
      suggestions: ['Check pump health', 'Predict maintenance needs', 'View pump statistics']
    };
  }

  if (lowerMessage.includes('leak') || lowerMessage.includes('pipeline')) {
    return {
      message: 'I can assist with leak detection in pipelines. You can report a leak or use our AI-based leak detection system that analyzes flow rate and pressure data to identify potential leaks.',
      suggestions: ['Report a leak', 'Run leak detection', 'View pipeline status']
    };
  }

  if (lowerMessage.includes('complaint') || lowerMessage.includes('issue')) {
    return {
      message: 'For complaints, you can file a new complaint through the Complaints section. Track existing complaints and their resolution status from your dashboard.',
      suggestions: ['File new complaint', 'Track my complaints', 'View complaint stats']
    };
  }

  if (lowerMessage.includes('maintenance')) {
    return {
      message: 'I can help with maintenance scheduling and tracking. View upcoming maintenance tasks, schedule new ones, or mark tasks as complete.',
      suggestions: ['View schedule', 'Schedule maintenance', 'Complete a task']
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
