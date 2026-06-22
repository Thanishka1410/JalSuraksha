const express = require('express');
const router = express.Router();
const { detectLeak, predictMaintenance, analyzeWaterQuality, chatAssistant } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.post('/leak-detection', authenticate, detectLeak);
router.post('/predictive-maintenance', authenticate, predictMaintenance);
router.post('/water-quality-analysis', authenticate, analyzeWaterQuality);
router.post('/chat', authenticate, chatAssistant);

module.exports = router;
