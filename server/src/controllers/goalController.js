const Goal = require('../models/Goal');

const getGoals = async (req, res, next) => {
    try {
        const goals = await Goal.find({ userId: req.auth.userId });
        res.status(200).json(goals);
    } catch (error) {
        next(error);
    }
};

const createGoal = async (req, res, next) => {
    try {
        const { title, target, category } = req.body;
        const goal = await Goal.create({
            userId: req.auth.userId,
            title,
            target,
            category
        });
        res.status(201).json(goal);
    } catch (error) {
        next(error);
    }
};

const updateGoalProgress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { current } = req.body;

        const goal = await Goal.findOne({ _id: id, userId: req.auth.userId });
        if (!goal) {
            res.status(404);
            throw new Error('Goal not found');
        }

        goal.current = current;
        if (goal.current >= goal.target) {
            goal.completed = true;
        } else {
            goal.completed = false;
        }

        await goal.save();
        res.status(200).json(goal);
    } catch (error) {
        next(error);
    }
};

module.exports = { getGoals, createGoal, updateGoalProgress };
