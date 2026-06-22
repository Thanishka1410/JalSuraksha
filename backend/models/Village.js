const mongoose = require('mongoose');

const VillageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Village name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  code: {
    type: String,
    unique: true,
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  population: {
    type: Number,
    min: [0, 'Population cannot be negative']
  },
  totalHouseholds: {
    type: Number,
    min: [0, 'Total households cannot be negative']
  },
  waterSources: [{
    type: String,
    trim: true
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
  gpAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vWSC: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

VillageSchema.index({ location: '2dsphere' });
VillageSchema.index({ district: 1 });
VillageSchema.index({ state: 1 });
VillageSchema.index({ code: 1 });

module.exports = mongoose.model('Village', VillageSchema);
