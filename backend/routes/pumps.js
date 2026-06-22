const express = require('express');
const router = express.Router();
const { createPump, getPumps, getPump, updatePump, deletePump, getPumpStats, updatePumpStatus, getMaintenanceSchedule } = require('../controllers/pumpController');
const { authenticate, authorize } = require('../middleware/auth');
const { createPumpValidation } = require('../middleware/validate');

router.get('/', authenticate, getPumps);
router.get('/stats', authenticate, getPumpStats);
router.get('/maintenance-schedule', authenticate, getMaintenanceSchedule);
router.get('/:id', authenticate, getPump);
router.post('/', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), createPumpValidation, createPump);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), updatePump);
router.put('/:id/status', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), updatePumpStatus);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deletePump);

module.exports = router;
