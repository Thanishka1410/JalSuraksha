const mongoose = require('mongoose');
const { ALERT_TYPES, SEVERITY_LEVELS } = require('../config/constants');

const AlertSchema = new mongoose.Schema({
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  type: {
    type: String,
    enum: Object.values(ALERT_TYPES),
    required: [true, 'Alert type is required']
  },
  severity: {
    type: String,
    enum: SEVERITY_LEVELS,
    required: [true, 'Severity is required']
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Alert message is required']
  },
  relatedEntity: {
    model: {
      type: String
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

AlertSchema.index({ village: 1 });
AlertSchema.index({ type: 1 });
AlertSchema.index({ severity: 1 });
AlertSchema.index({ isRead: 1 });
AlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
