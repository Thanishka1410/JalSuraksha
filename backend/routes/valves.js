const express = require('express');
const router = express.Router();
const { createValve, getValves, getValve, updateValve, deleteValve, toggleValve } = require('../controllers/valveController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getValves);
router.get('/:id', authenticate, getValve);
router.post('/', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), createValve);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), updateValve);
router.put('/:id/toggle', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), toggleValve);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deleteValve);

module.exports = router;
