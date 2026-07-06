const express = require('express');
const router = express.Router();
const { createVillage, getVillages, getVillage, updateVillage, deleteVillage, getVillageStats } = require('../controllers/villageController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getVillages);
router.get('/:id', authenticate, getVillage);
router.get('/:id/stats', authenticate, getVillageStats);
router.post('/', authenticate, createVillage);
router.put('/:id', authenticate, updateVillage);
router.delete('/:id', authenticate, deleteVillage);

module.exports = router;
