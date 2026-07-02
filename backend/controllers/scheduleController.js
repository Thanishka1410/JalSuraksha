const WaterSchedule = require('../models/WaterSchedule');

const getSchedules = async (req, res) => {
  try {
    const { village } = req.query;
    const query = {};
    if (village) query.village = village;

    const schedules = await WaterSchedule.find(query)
      .populate('village', 'name code')
      .populate('createdBy', 'name')
      .sort({ dayOfWeek: 1 });

    res.status(200).json({ success: true, data: { schedules } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching schedules', error: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const { village, dayOfWeek, slots, notes } = req.body;

    // Calculate durations
    const processedSlots = (slots || []).map(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
      return { ...s, durationMinutes: durationMinutes > 0 ? durationMinutes : 0 };
    });

    const schedule = await WaterSchedule.create({
      village,
      dayOfWeek,
      slots: processedSlots,
      notes,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Schedule created successfully', data: { schedule } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating schedule', error: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { slots, ...rest } = req.body;
    const updateData = { ...rest };

    if (slots) {
      updateData.slots = slots.map(s => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
        return { ...s, durationMinutes: durationMinutes > 0 ? durationMinutes : 0 };
      });
    }

    const schedule = await WaterSchedule.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    res.status(200).json({ success: true, message: 'Schedule updated', data: { schedule } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating schedule', error: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await WaterSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.status(200).json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting schedule', error: error.message });
  }
};

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };
