const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getSchedules);
router.post('/', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member'), createSchedule);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member'), updateSchedule);
router.delete('/:id', authenticate, authorize('super_admin', 'gp_admin'), deleteSchedule);

module.exports = router;
