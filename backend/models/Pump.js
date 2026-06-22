const mongoose = require('mongoose');
const { PUMP_TYPES, PUMP_STATUSES } = require('../config/constants');

const PumpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pump name is required'],
    trim: true
  },
  pumpId: {
    type: String,
    unique: true,
    required: [true, 'Pump ID is required']
  },
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  type: {
    type: String,
    enum: PUMP_TYPES,
    required: [true, 'Pump type is required']
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity cannot be negative']
  },
  runningHours: {
    type: Number,
    default: 0,
    min: [0, 'Running hours cannot be negative']
  },
  powerConsumption: {
    type: Number,
    default: 0,
    min: [0, 'Power consumption cannot be negative']
  },
  efficiencyScore: {
    type: Number,
    default: 100,
    min: [0, 'Efficiency cannot be negative'],
    max: [100, 'Efficiency cannot exceed 100']
  },
  voltage: {
    type: Number
  },
  temperature: {
    type: Number
  },
  status: {
    type: String,
    enum: PUMP_STATUSES,
    default: 'stopped'
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  installedDate: {
    type: Date
  }
}, {
  timestamps: true
});

PumpSchema.index({ village: 1 });
PumpSchema.index({ status: 1 });
PumpSchema.index({ pumpId: 1 });
PumpSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pump', PumpSchema);
