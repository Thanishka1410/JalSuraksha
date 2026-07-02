const mongoose = require('mongoose');
const { PIPELINE_MATERIALS, PIPELINE_STATUSES } = require('../config/constants');

const LeakReportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['reported', 'verified', 'fixed'],
    default: 'reported'
  }
}, { _id: true });

const PipelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pipeline name is required'],
    trim: true
  },
  pipelineId: {
    type: String,
    unique: true,
    required: [true, 'Pipeline ID is required']
  },
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  length: {
    type: Number,
    min: [0, 'Length cannot be negative']
  },
  diameter: {
    type: Number,
    min: [0, 'Diameter cannot be negative']
  },
  material: {
    type: String,
    enum: PIPELINE_MATERIALS,
    required: [true, 'Pipeline material is required']
  },
  status: {
    type: String,
    enum: PIPELINE_STATUSES,
    default: 'good'
  },
  leakReports: [LeakReportSchema],
  installationDate: {
    type: Date
  },
  coordinates: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]],
      default: []
    }
  }
}, {
  timestamps: true
});

PipelineSchema.index({ village: 1 });
PipelineSchema.index({ pipelineId: 1 });

module.exports = mongoose.model('Pipeline', PipelineSchema);
