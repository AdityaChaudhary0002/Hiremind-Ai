const express = require('express');
const router = express.Router();
const { generateQuestions, submitInterview, getInterview, addMoreQuestions, getUserInterviews, generateFollowUp } = require('../controllers/interviewController');
const { requireAuth } = require('../middlewares/clerkAuthMiddleware');

router.post('/generate', requireAuth, generateQuestions);
router.post('/submit', requireAuth, submitInterview);
router.post('/more', requireAuth, addMoreQuestions);
router.post('/followup', requireAuth, generateFollowUp);
router.get('/history', requireAuth, getUserInterviews);
router.get('/:id', requireAuth, getInterview);

module.exports = router;
