const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parseResume, generateCoverLetter } = require('../controllers/resumeController');
const { requireAuth } = require('../middlewares/clerkAuthMiddleware');

// Set up Multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/upload', requireAuth, upload.single('resume'), parseResume);
router.post('/cover-letter', requireAuth, generateCoverLetter);

module.exports = router;
