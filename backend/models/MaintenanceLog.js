const mongoose = require('mongoose');
const { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } = require('../config/constants');

const PartsReplacedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  }
}, { _id: true });

const MaintenanceLogSchema = new mongoose.Schema({
  pump: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pump'
  },
  tank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterTank'
  },
  pipeline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline'
  },
  valve: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Valve'
  },
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performed by user is required']
  },
  type: {
    type: String,
    enum: MAINTENANCE_TYPES,
    required: [true, 'Maintenance type is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  partsReplaced: [PartsReplacedSchema],
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'Total cost cannot be negative']
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: MAINTENANCE_STATUSES,
    default: 'scheduled'
  },
  nextMaintenanceDate: {
    type: Date
  }
}, {
  timestamps: true
});

MaintenanceLogSchema.index({ village: 1 });
MaintenanceLogSchema.index({ pump: 1 });
MaintenanceLogSchema.index({ tank: 1 });
MaintenanceLogSchema.index({ status: 1 });
MaintenanceLogSchema.index({ nextMaintenanceDate: 1 });

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
