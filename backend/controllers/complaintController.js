const Complaint = require('../models/Complaint');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendComplaintAssignmentEmail, sendComplaintStatusUpdateEmail } = require('../utils/emailService');

const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      complainant: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Complaint filed successfully',
      data: { complaint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error filing complaint',
      error: error.message
    });
  }
};

const getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, village, status, category, priority } = req.query;
    const query = {};

    if (village) query.village = village;
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('complainant', 'name email phone')
      .populate('village', 'name code')
      .populate('assignedTo', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('complainant', 'name email phone')
      .populate('village', 'name code district')
      .populate('assignedTo', 'name email phone')
      .populate('timeline.updatedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { complaint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: { complaint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};

const assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.assignedTo = assignedTo;
    complaint.status = 'assigned';
    complaint.timeline.push({
      status: 'assigned',
      updatedBy: req.user.id,
      note: `Complaint assigned to user`,
      timestamp: new Date()
    });

    await complaint.save();

    // Send email notification to assigned technician (non-blocking)
    User.findById(assignedTo).then(tech => {
      if (tech && tech.email) {
        sendComplaintAssignmentEmail(tech.email, tech.name, complaint);
      }
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: { complaint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning complaint',
      error: error.message
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = status;
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      if (note) complaint.resolutionNotes = note;
    }

    complaint.timeline.push({
      status,
      updatedBy: req.user.id,
      note: note || `Status updated to ${status}`,
      timestamp: new Date()
    });

    await complaint.save();

    // Send email notification to complainant (non-blocking)
    const notifyStatuses = ['assigned', 'in_progress', 'resolved', 'closed'];
    if (notifyStatuses.includes(status)) {
      Complaint.findById(complaint._id).populate('complainant', 'name email').then(populated => {
        const citizen = populated?.complainant;
        if (citizen && citizen.email) {
          sendComplaintStatusUpdateEmail(citizen.email, citizen.name, complaint, status);
        }
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: { complaint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status',
      error: error.message
    });
  }
};

const getComplaintStats = async (req, res) => {
  try {
    const { village, startDate, endDate } = req.query;
    const query = {};

    if (village) query.village = village;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(query);

    const stats = {
      total: complaints.length,
      byStatus: {
        pending: complaints.filter(c => c.status === 'pending').length,
        assigned: complaints.filter(c => c.status === 'assigned').length,
        in_progress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        closed: complaints.filter(c => c.status === 'closed').length
      },
      byCategory: {
        leakage: complaints.filter(c => c.category === 'leakage').length,
        no_water: complaints.filter(c => c.category === 'no_water').length,
        dirty_water: complaints.filter(c => c.category === 'dirty_water').length,
        low_pressure: complaints.filter(c => c.category === 'low_pressure').length,
        other: complaints.filter(c => c.category === 'other').length
      },
      byPriority: {
        low: complaints.filter(c => c.priority === 'low').length,
        medium: complaints.filter(c => c.priority === 'medium').length,
        high: complaints.filter(c => c.priority === 'high').length,
        urgent: complaints.filter(c => c.priority === 'urgent').length
      },
      resolutionRate: complaints.length > 0
        ? Math.round((complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length / complaints.length) * 100)
        : 0,
      avgResolutionTime: calculateAvgResolutionTime(complaints.filter(c => c.resolvedAt))
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint stats',
      error: error.message
    });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { complainant: req.user.id };

    if (status) query.status = status;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('village', 'name code')
      .populate('assignedTo', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your complaints',
      error: error.message
    });
  }
};

function calculateAvgResolutionTime(resolvedComplaints) {
  if (resolvedComplaints.length === 0) return 0;

  const totalTime = resolvedComplaints.reduce((sum, c) => {
    return sum + (c.resolvedAt - c.createdAt);
  }, 0);

  return Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24));
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  assignComplaint,
  updateComplaintStatus,
  getComplaintStats,
  getMyComplaints
};
