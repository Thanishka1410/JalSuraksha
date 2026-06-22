const { WATER_QUALITY_THRESHOLDS } = require('../config/constants');

const calculateWaterQualityStatus = (params) => {
  const { pH, TDS, turbidity, chlorine, fluoride } = params;

  let unsafeCount = 0;
  let needsInspectionCount = 0;

  if (pH !== undefined) {
    if (pH < WATER_QUALITY_THRESHOLDS.pH.min || pH > WATER_QUALITY_THRESHOLDS.pH.max) {
      unsafeCount++;
    } else if (pH < WATER_QUALITY_THRESHOLDS.pH.min + 0.5 || pH > WATER_QUALITY_THRESHOLDS.pH.max - 0.5) {
      needsInspectionCount++;
    }
  }

  if (TDS !== undefined) {
    if (TDS > WATER_QUALITY_THRESHOLDS.TDS.max) {
      unsafeCount++;
    } else if (TDS > WATER_QUALITY_THRESHOLDS.TDS.max * 0.8) {
      needsInspectionCount++;
    }
  }

  if (turbidity !== undefined) {
    if (turbidity > WATER_QUALITY_THRESHOLDS.turbidity.max) {
      unsafeCount++;
    } else if (turbidity > WATER_QUALITY_THRESHOLDS.turbidity.max * 0.7) {
      needsInspectionCount++;
    }
  }

  if (chlorine !== undefined) {
    if (chlorine < WATER_QUALITY_THRESHOLDS.chlorine.min || chlorine > WATER_QUALITY_THRESHOLDS.chlorine.max) {
      unsafeCount++;
    } else if (chlorine < WATER_QUALITY_THRESHOLDS.chlorine.min + 0.1 || chlorine > WATER_QUALITY_THRESHOLDS.chlorine.max - 0.1) {
      needsInspectionCount++;
    }
  }

  if (fluoride !== undefined) {
    if (fluoride > WATER_QUALITY_THRESHOLDS.fluoride.max) {
      unsafeCount++;
    } else if (fluoride > WATER_QUALITY_THRESHOLDS.fluoride.max * 0.8) {
      needsInspectionCount++;
    }
  }

  if (unsafeCount > 0) return 'unsafe';
  if (needsInspectionCount > 0) return 'needs_inspection';
  return 'safe';
};

const calculatePumpHealth = (pump) => {
  let score = 100;

  if (pump.runningHours > 10000) {
    score -= 20;
  } else if (pump.runningHours > 5000) {
    score -= 10;
  }

  if (pump.voltage) {
    if (pump.voltage < 180 || pump.voltage > 260) {
      score -= 25;
    } else if (pump.voltage < 200 || pump.voltage > 240) {
      score -= 10;
    }
  }

  if (pump.temperature) {
    if (pump.temperature > 80) {
      score -= 30;
    } else if (pump.temperature > 60) {
      score -= 15;
    }
  }

  if (pump.powerConsumption > 0 && pump.capacity > 0) {
    const expectedEfficiency = (pump.capacity * 0.746) / pump.powerConsumption * 100;
    if (expectedEfficiency < 50) {
      score -= 20;
    } else if (expectedEfficiency < 70) {
      score -= 10;
    }
  }

  if (pump.lastMaintenance) {
    const daysSinceMaintenance = Math.floor((Date.now() - pump.lastMaintenance) / (1000 * 60 * 60 * 24));
    if (daysSinceMaintenance > 180) {
      score -= 15;
    } else if (daysSinceMaintenance > 90) {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
};

const detectLeak = (flowRate, pressure, consumption) => {
  let probability = 0;

  if (flowRate && consumption) {
    const flowDifference = Math.abs(flowRate - consumption);
    const normalDifference = consumption * 0.1;
    if (flowDifference > normalDifference) {
      probability += (flowDifference / consumption) * 50;
    }
  }

  if (pressure) {
    if (pressure < 10) {
      probability += 30;
    } else if (pressure < 20) {
      probability += 15;
    }
  }

  if (flowRate && pressure) {
    const expectedFlow = pressure * 2;
    if (flowRate > expectedFlow * 1.5) {
      probability += 20;
    }
  }

  probability = Math.min(100, Math.max(0, probability));

  return {
    leakDetected: probability > 50,
    probability: Math.round(probability * 100) / 100
  };
};

const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

module.exports = {
  calculateWaterQualityStatus,
  calculatePumpHealth,
  detectLeak,
  paginate
};
