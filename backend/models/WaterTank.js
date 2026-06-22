const mongoose = require('mongoose');
const { TANK_TYPES, TANK_STATUSES } = require('../config/constants');

const WaterTankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tank name is required'],
    trim: true
  },
  tankId: {
    type: String,
    unique: true,
    required: [true, 'Tank ID is required']
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
  capacity: {
    type: Number,
    required: [true, 'Tank capacity is required'],
    min: [0, 'Capacity cannot be negative']
  },
  currentLevel: {
    type: Number,
    default: 0,
    min: [0, 'Current level cannot be negative']
  },
  dailyConsumption: {
    type: Number,
    default: 0,
    min: [0, 'Daily consumption cannot be negative']
  },
  type: {
    type: String,
    enum: TANK_TYPES,
    required: [true, 'Tank type is required']
  },
  status: {
    type: String,
    enum: TANK_STATUSES,
    default: 'normal'
  },
  lastRefilled: {
    type: Date
  }
}, {
  timestamps: true
});

WaterTankSchema.index({ village: 1 });
WaterTankSchema.index({ tankId: 1 });
WaterTankSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('WaterTank', WaterTankSchema);
