const mongoose = require('mongoose');
const { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES, PRIORITY_LEVELS } = require('../config/constants');

const TimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const ComplaintSchema = new mongoose.Schema({
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Complainant is required']
  },
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  category: {
    type: String,
    enum: COMPLAINT_CATEGORIES,
    required: [true, 'Complaint category is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    type: String
  }],
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
  status: {
    type: String,
    enum: Object.values(COMPLAINT_STATUSES),
    default: COMPLAINT_STATUSES.PENDING
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: PRIORITY_LEVELS,
    default: 'medium'
  },
  resolutionNotes: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  timeline: [TimelineSchema]
}, {
  timestamps: true
});

ComplaintSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({
      status: this.status,
      updatedBy: this.complainant,
      note: 'Complaint filed',
      timestamp: new Date()
    });
  }
  next();
});

ComplaintSchema.index({ complainant: 1 });
ComplaintSchema.index({ village: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ priority: 1 });
ComplaintSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Complaint', ComplaintSchema);
