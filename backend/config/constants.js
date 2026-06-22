const ROLES = {
  SUPER_ADMIN: 'super_admin',
  GP_ADMIN: 'gp_admin',
  VWSC_MEMBER: 'vWSC_member',
  CITIZEN: 'citizen',
  DISTRICT_OFFICER: 'district_officer'
};

const COMPLAINT_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

const ALERT_TYPES = {
  PUMP_FAILURE: 'pump_failure',
  WATER_QUALITY_RISK: 'water_quality_risk',
  TANK_OVERFLOW: 'tank_overflow',
  TANK_LOW: 'tank_low',
  LEAK_DETECTED: 'leak_detected',
  MAINTENANCE_DUE: 'maintenance_due'
};

const WATER_QUALITY_THRESHOLDS = {
  pH: { min: 6.5, max: 8.5 },
  TDS: { min: 0, max: 500 },
  turbidity: { min: 0, max: 5 },
  chlorine: { min: 0.2, max: 1.0 },
  fluoride: { min: 0, max: 1.5 },
  iron: { min: 0, max: 0.3 },
  nitrate: { min: 0, max: 45 },
  coliform: { min: 0, max: 0 }
};

const PUMP_TYPES = ['submersible', 'centrifugal', 'booster', 'jet'];
const PUMP_STATUSES = ['running', 'stopped', 'maintenance', 'failed'];
const TANK_TYPES = ['overhead', 'underground', 'ground'];
const TANK_STATUSES = ['full', 'normal', 'low', 'empty', 'overflow'];
const VALVE_TYPES = ['gate', 'globe', 'ball', 'butterfly', 'check'];
const VALVE_STATUSES = ['open', 'closed', 'partially_open'];
const PIPELINE_MATERIALS = ['PVC', 'HDPE', 'GI', 'cast_iron'];
const PIPELINE_STATUSES = ['good', 'fair', 'poor', 'damaged'];
const COMPLAINT_CATEGORIES = ['leakage', 'no_water', 'dirty_water', 'low_pressure', 'other'];
const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];
const MAINTENANCE_TYPES = ['preventive', 'corrective', 'emergency'];
const MAINTENANCE_STATUSES = ['scheduled', 'in_progress', 'completed'];
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const AI_REPORT_TYPES = ['leak_detection', 'predictive_maintenance', 'water_quality', 'consumption_forecast'];

module.exports = {
  ROLES,
  COMPLAINT_STATUSES,
  ALERT_TYPES,
  WATER_QUALITY_THRESHOLDS,
  PUMP_TYPES,
  PUMP_STATUSES,
  TANK_TYPES,
  TANK_STATUSES,
  VALVE_TYPES,
  VALVE_STATUSES,
  PIPELINE_MATERIALS,
  PIPELINE_STATUSES,
  COMPLAINT_CATEGORIES,
  PRIORITY_LEVELS,
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUSES,
  SEVERITY_LEVELS,
  AI_REPORT_TYPES
};
