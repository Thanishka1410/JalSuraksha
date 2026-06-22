const express = require('express');
const router = express.Router();
const { createMaintenanceLog, getMaintenanceLogs, getMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog, scheduleMaintenance, completeMaintenance, getMaintenanceSchedule } = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getMaintenanceLogs);
router.get('/schedule', authenticate, getMaintenanceSchedule);
router.get('/:id', authenticate, getMaintenanceLog);
router.post('/', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), createMaintenanceLog);
router.post('/schedule', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), scheduleMaintenance);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), updateMaintenanceLog);
router.put('/:id/complete', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), completeMaintenance);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deleteMaintenanceLog);

module.exports = router;
