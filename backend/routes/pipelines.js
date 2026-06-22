const express = require('express');
const router = express.Router();
const { createPipeline, getPipelines, getPipeline, updatePipeline, deletePipeline, reportLeak, getPipelineStats } = require('../controllers/pipelineController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getPipelines);
router.get('/stats', authenticate, getPipelineStats);
router.get('/:id', authenticate, getPipeline);
router.post('/', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), createPipeline);
router.put('/:id', authenticate, authorize('super_admin', 'gp_admin', 'district_officer'), updatePipeline);
router.post('/:id/report-leak', authenticate, reportLeak);
router.delete('/:id', authenticate, authorize('super_admin', 'district_officer'), deletePipeline);

module.exports = router;
