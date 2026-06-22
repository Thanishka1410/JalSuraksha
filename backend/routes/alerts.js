const express = require('express');
const router = express.Router();
const { getAlerts, markAsRead, acknowledgeAlert, resolveAlert, getAlertStats } = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getAlerts);
router.get('/stats', authenticate, getAlertStats);
router.put('/:id/read', authenticate, markAsRead);
router.put('/:id/acknowledge', authenticate, acknowledgeAlert);
router.put('/:id/resolve', authenticate, resolveAlert);

module.exports = router;
