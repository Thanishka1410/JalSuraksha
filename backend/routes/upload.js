const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/v1/upload/image
 * Upload up to 5 images. Requires authentication.
 * Field name: "images"
 */
router.post('/image', authenticate, upload.array('images', 5), uploadImages);

module.exports = router;
