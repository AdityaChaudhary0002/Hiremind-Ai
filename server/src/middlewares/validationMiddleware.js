const { z } = require('zod');

const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Parse and validate the request body
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Map Zod errors to readable messages
                const messages = error.errors.map(err => {
                    const path = err.path.join('.');
                    return `${path ? path + ': ' : ''}${err.message}`;
                });
                return res.status(400).json({
                    message: "Validation Error",
                    errors: messages
                });
            }
            // Passing other types of errors down
            next(error);
        }
    };
};

// SCHEMAS
const schemas = {
    interviewGenerate: z.object({
        role: z.string().min(2).max(100),
        difficulty: z.enum(['Easy', 'Medium', 'Hard']),
        resumeText: z.string().max(20000).optional().or(z.literal(''))
    }),

    interviewSubmit: z.object({
        interviewId: z.string().min(1, "Interview ID is required"),
        userAnswers: z.array(z.string()).min(1, "At least one answer is required")
    }),

    interviewFollowUp: z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
        role: z.string().min(1, "Role is required"),
        difficulty: z.string().min(1, "Difficulty is required"),
        history: z.array(z.object({
            question: z.string(),
            answer: z.string(),
            feedback: z.string().optional(),
            weakTopics: z.array(z.string()).optional(),
            confidenceScore: z.number().min(0).max(100).optional()
        })).optional()
    }).superRefine((data, ctx) => {
        // Validation: Address suspiciously short answers compared to the question length
        // A simple heuristic: if a question is very long, a 1 character answer might be invalid.
        if (data.question.length > 50 && data.answer.trim().length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Answer appears too short for the given question context",
                path: ["answer"]
            });
        }
    }),

    createGoal: z.object({
        title: z.string().min(3).max(200),
        category: z.enum(['daily', 'weekly', 'milestone']).optional(),
        deadline: z.coerce.date().min(new Date()).optional()
    })
};

module.exports = { validate, schemas };
