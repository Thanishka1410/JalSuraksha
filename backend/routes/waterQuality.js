const express = require('express');
const router = express.Router();
const { createWaterQuality, getWaterQualityRecords, getWaterQualityRecord, updateWaterQuality, deleteWaterQuality, analyzeQuality, getQualityTrends, getQualityAlerts } = require('../controllers/waterQualityController');
const { authenticate, authorize } = require('../middleware/auth');
const { createWaterQualityValidation } = require('../middleware/validate');

router.get('/', authenticate, getWaterQualityRecords);
router.get('/trends', authenticate, getQualityTrends);
router.get('/alerts', authenticate, getQualityAlerts);
router.post('/analyze', authenticate, analyzeQuality);
router.get('/:id', authenticate, getWaterQualityRecord);
router.post('/', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), createWaterQualityValidation, createWaterQuality);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'vWSC_member', 'district_officer'), updateWaterQuality);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deleteWaterQuality);

module.exports = router;
