const express = require('express');
const router = express.Router();
const { generateQuestions, submitInterview, getInterview, addMoreQuestions, getUserInterviews, generateFollowUp, deleteInterview, clearHistory } = require('../controllers/interviewController');
const { requireAuth } = require('../middlewares/clerkAuthMiddleware');
const { validate, schemas } = require('../middlewares/validationMiddleware');
const { aiLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/generate', requireAuth, aiLimiter, validate(schemas.interviewGenerate), generateQuestions);
router.post('/submit', requireAuth, validate(schemas.interviewSubmit), submitInterview);
router.post('/more', requireAuth, aiLimiter, addMoreQuestions);
router.post('/followup', requireAuth, aiLimiter, validate(schemas.interviewFollowUp), generateFollowUp);
router.get('/history', requireAuth, getUserInterviews);
router.get('/:id', requireAuth, getInterview);
router.delete('/:id', requireAuth, deleteInterview);
router.delete('/', requireAuth, clearHistory);

module.exports = router;
