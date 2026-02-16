const Groq = require("groq-sdk");
const Interview = require('../models/Interview.js');
const pdf = require("pdf-parse");

// Initialize Groq SDK (Ensure API Key is available)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateQuestions = async (req, res, next) => {
    const { role, difficulty, resumeText } = req.body;

    if (!role || !difficulty) {
        res.status(400);
        return next(new Error('Please provide both role and difficulty'));
    }

    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing.');
        }

        let prompt = `Generate 10 structured technical interview questions for a ${difficulty} level ${role} position. Return ONLY a JSON object with this format: { "questions": ["Q1", "Q2", ...] }. No markdown.`;

        if (resumeText) {
            prompt = `CRITICAL INSTRUCTION: You are generating interview questions based on a specific candidate resume.
            Resume Content: """${resumeText.substring(0, 4000)}"""
            .
            Based STRICTLY on the resume above, generate 10 highly specific technical interview questions for a ${difficulty} level ${role} position.
            Ask about specific projects, technologies, and claims made in the resume.
            Return ONLY a JSON object: { "questions": [...] }. No markdown.`;
        }

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const text = completion.choices[0]?.message?.content || "{}";
        const content = JSON.parse(text);

        const interview = await Interview.create({
            role,
            difficulty,
            questions: content.questions,
            userId: req.auth.userId,
            feedback: {} // Initialize empty
        });

        res.status(200).json({ ...content, _id: interview._id });
    } catch (error) {
        console.error("Error generating questions:", error);
        next(error);
    }
};

const addMoreQuestions = async (req, res, next) => {
    const { interviewId } = req.body;

    try {
        const interview = await Interview.findOne({ _id: interviewId, userId: req.auth.userId });
        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }

        const prompt = `Generate 5 MORE unique structured interview questions for a ${interview.difficulty} level ${interview.role}. Return JSON: { "questions": [...] }. No markdown.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const text = completion.choices[0]?.message?.content || "{}";
        const content = JSON.parse(text);

        interview.questions = [...interview.questions, ...content.questions];
        await interview.save();

        res.status(200).json({ questions: content.questions });
    } catch (error) {
        next(error);
    }
};

const submitInterview = async (req, res, next) => {
    const { interviewId, userAnswers } = req.body;

    try {
        const interview = await Interview.findOne({ _id: interviewId, userId: req.auth.userId });
        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }

        interview.answers = userAnswers; // Store raw answers

        const prompt = `
        Analyze this interview for a ${interview.role} (${interview.difficulty}).
        Questions: ${JSON.stringify(interview.questions)}
        Answers: ${JSON.stringify(userAnswers)}
        
        Provide JSON report:
        {
            "overallScore": 0-100,
            "summary": "string",
            "technicalScore": 0-100,
            "communicationScore": 0-100,
            "improvements": ["tip 1", "tip 2", ...],
            "questionAnalysis": [ { "question": "Q...", "score": 0-10, "feedback": "...", "idealAnswer": "..." }, ... ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const feedback = JSON.parse(completion.choices[0]?.message?.content || "{}");

        interview.feedback = feedback;
        await interview.save();

        res.status(200).json(feedback);
    } catch (error) {
        next(error);
    }
};

const getInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.id, userId: req.auth.userId });
        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }
        res.status(200).json(interview);
    } catch (error) {
        next(error);
    }
};

const getUserInterviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Interview.countDocuments({ userId: req.auth.userId });
        const interviews = await Interview.find({ userId: req.auth.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('role difficulty createdAt feedback.overallScore');

        res.status(200).json({
            interviews,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        });
    } catch (error) {
        next(error);
    }
};

const parseResume = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }
        const data = await pdf(req.file.buffer);
        res.json({ text: data.text });
    } catch (error) {
        console.error("Resume Parsing Error:", error);
        next(error);
    }
};

module.exports = { generateQuestions, addMoreQuestions, submitInterview, getInterview, getUserInterviews, parseResume };
