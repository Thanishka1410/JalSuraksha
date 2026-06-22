const mongoose = require('mongoose');

const WaterQualitySchema = new mongoose.Schema({
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recorded by user is required']
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
  parameters: {
    pH: { type: Number },
    TDS: { type: Number },
    turbidity: { type: Number },
    chlorine: { type: Number },
    fluoride: { type: Number },
    iron: { type: Number },
    nitrate: { type: Number },
    coliform: { type: Number }
  },
  overallStatus: {
    type: String,
    enum: ['safe', 'unsafe', 'needs_inspection'],
    default: 'needs_inspection'
  },
  recommendations: [{
    type: String
  }],
  sampleDate: {
    type: Date,
    default: Date.now
  },
  reportImage: {
    type: String
  }
}, {
  timestamps: true
});

WaterQualitySchema.index({ village: 1 });
WaterQualitySchema.index({ sampleDate: -1 });
WaterQualitySchema.index({ overallStatus: 1 });
WaterQualitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('WaterQuality', WaterQualitySchema);
