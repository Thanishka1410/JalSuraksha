const express = require('express');
const router = express.Router();
const { createTank, getTanks, getTank, updateTank, deleteTank, updateWaterLevel, getTankStats } = require('../controllers/tankController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getTanks);
router.get('/stats', authenticate, getTankStats);
router.get('/:id', authenticate, getTank);
router.post('/', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), createTank);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), updateTank);
router.put('/:id/water-level', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), updateWaterLevel);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deleteTank);

module.exports = router;
