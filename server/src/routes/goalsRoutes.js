const express = require('express');
const router = express.Router();
const { getGoals, createGoal, toggleGoal, togglePriority, generateGoalStrategy, deleteGoal, deleteAllGoals } = require('../controllers/goalsController');
const { requireAuth } = require('../middlewares/clerkAuthMiddleware');
const { validate, schemas } = require('../middlewares/validationMiddleware');

// All routes require authentication
router.use(requireAuth);

router.get('/', getGoals);
router.post('/', validate(schemas.createGoal), createGoal);
router.patch('/:id/toggle', toggleGoal);
router.patch('/:id/priority', togglePriority);
router.post('/:id/strategize', generateGoalStrategy);
router.delete('/debug/reset', deleteAllGoals);
router.delete('/:id', deleteGoal);

module.exports = router;
