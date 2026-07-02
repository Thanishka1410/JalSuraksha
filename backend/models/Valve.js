const mongoose = require('mongoose');
const { VALVE_TYPES, VALVE_STATUSES } = require('../config/constants');

const ValveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Valve name is required'],
    trim: true
  },
  valveId: {
    type: String,
    unique: true,
    required: [true, 'Valve ID is required']
  },
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  pipeline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline'
  },
  status: {
    type: String,
    enum: VALVE_STATUSES,
    default: 'open'
  },
  type: {
    type: String,
    enum: VALVE_TYPES,
    required: [true, 'Valve type is required']
  },
  lastChecked: {
    type: Date
  },
  lastOperated: {
    type: Date
  },
  diameter: {
    type: Number,
    min: [0, 'Diameter cannot be negative']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, {
  timestamps: true
});

ValveSchema.index({ village: 1 });
ValveSchema.index({ valveId: 1 });
ValveSchema.index({ pipeline: 1 });

module.exports = mongoose.model('Valve', ValveSchema);
