const express = require('express');
const router = express.Router();
const { getWeaknesses } = require('../controllers/analyticsController');
const { requireAuth } = require('../middlewares/clerkAuthMiddleware');

router.get('/weaknesses', requireAuth, getWeaknesses);

module.exports = router;
