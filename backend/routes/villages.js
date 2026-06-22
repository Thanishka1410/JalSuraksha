const express = require('express');
const router = express.Router();
const { createVillage, getVillages, getVillage, updateVillage, deleteVillage, getVillageStats } = require('../controllers/villageController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getVillages);
router.get('/:id', authenticate, getVillage);
router.get('/:id/stats', authenticate, getVillageStats);
router.post('/', authenticate, authorize('super_admin', 'district_officer'), createVillage);
router.put('/:id', authenticate, authorize('super_admin', 'district_officer', 'gp_admin'), updateVillage);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deleteVillage);

module.exports = router;
