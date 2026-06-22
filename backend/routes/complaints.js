const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, getComplaint, updateComplaint, deleteComplaint, assignComplaint, updateComplaintStatus, getComplaintStats, getMyComplaints } = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');
const { createComplaintValidation } = require('../middleware/validate');

router.get('/', authenticate, getComplaints);
router.get('/stats', authenticate, getComplaintStats);
router.get('/my', authenticate, getMyComplaints);
router.get('/:id', authenticate, getComplaint);
router.post('/', authenticate, createComplaintValidation, createComplaint);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), updateComplaint);
router.put('/:id/assign', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), assignComplaint);
router.put('/:id/status', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), updateComplaintStatus);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deleteComplaint);

module.exports = router;
