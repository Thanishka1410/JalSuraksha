const mongoose = require('mongoose');
const { AI_REPORT_TYPES } = require('../config/constants');

const InputSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
}, { _id: false });

const OutputSchema = new mongoose.Schema({
  prediction: {
    type: mongoose.Schema.Types.Mixed
  },
  confidence: {
    type: Number,
    min: [0, 'Confidence cannot be negative'],
    max: [1, 'Confidence cannot exceed 1']
  },
  recommendation: {
    type: String
  }
}, { _id: false });

const AIReportSchema = new mongoose.Schema({
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  reportType: {
    type: String,
    enum: AI_REPORT_TYPES,
    required: [true, 'Report type is required']
  },
  input: [InputSchema],
  output: OutputSchema,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: String,
    enum: ['system', 'user'],
    default: 'system'
  }
}, {
  timestamps: true
});

AIReportSchema.index({ village: 1 });
AIReportSchema.index({ reportType: 1 });
AIReportSchema.index({ generatedAt: -1 });

module.exports = mongoose.model('AIReport', AIReportSchema);
