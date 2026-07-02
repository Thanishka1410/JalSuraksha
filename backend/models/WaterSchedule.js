const mongoose = require('mongoose');

const ScheduleSlotSchema = new mongoose.Schema({
  zone: { type: String, required: true, trim: true },
  startTime: { type: String, required: true }, // e.g. "06:00"
  endTime: { type: String, required: true },   // e.g. "08:00"
  durationMinutes: { type: Number },
}, { _id: false });

const WaterScheduleSchema = new mongoose.Schema({
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: [true, 'Village is required'],
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily'],
    required: [true, 'Day of week is required'],
  },
  slots: [ScheduleSlotSchema],
  notes: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

WaterScheduleSchema.index({ village: 1, dayOfWeek: 1 });

module.exports = mongoose.model('WaterSchedule', WaterScheduleSchema);
