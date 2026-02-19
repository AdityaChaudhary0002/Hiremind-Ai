const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(detail => detail.message);
            return res.status(400).json({
                message: "Validation Error",
                errors: messages
            });
        }
        next();
    };
};

// SCHEMAS
const schemas = {
    interviewGenerate: Joi.object({
        role: Joi.string().min(2).max(100).required(),
        difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
        resumeText: Joi.string().optional().allow('').max(20000)
    }),
    interviewSubmit: Joi.object({
        interviewId: Joi.string().required(), // basic check, could be regex for mongoId
        userAnswers: Joi.array().items(Joi.string().allow('')).min(1).required()
    }),
    interviewFollowUp: Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().required(),
        role: Joi.string().required(),
        difficulty: Joi.string().required(),
        history: Joi.array().items(Joi.object({
            question: Joi.string(),
            answer: Joi.string()
        })).optional()
    }),
    createGoal: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        category: Joi.string().valid('daily', 'weekly', 'milestone').optional(),
        deadline: Joi.date().greater('now').optional()
    })
};

module.exports = { validate, schemas };
