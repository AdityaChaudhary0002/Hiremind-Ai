const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require('../models/Interview.js');
const pdf = require("pdf-parse");

// --- INITIAL CONFIG ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Gemini if key exists, else null
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// --- ROBUST JSON PARSER ---
const cleanJSON = (text) => {
    if (!text) return "{}";
    // 1. Remove Markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // 2. Find first '{' and last '}' to handle preamble text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned;
};

const safeParseJSON = (text, fallback = {}) => {
    try {
        return JSON.parse(cleanJSON(text));
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", text);
        return fallback;
    }
};

// --- MULTI-MODEL ORCHESTRATOR ---
const callAI = async (messages, schemaStub = null) => {
    // 1. Attempt Groq (Primary)
    try {
        if (!process.env.GROQ_API_KEY) throw new Error("Groq Key Missing");

        const completion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.7
        });

        return completion.choices[0]?.message?.content || "{}";
    } catch (groqError) {
        console.warn("⚠️ Groq Failed/RateLimited. Attempting Fallback...", groqError.message);

        // 2. Attempt Gemini (Fallback)
        if (genAI && process.env.GEMINI_API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                // Convert OpenAI format messages to Gemini format (simplified)
                const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

                const result = await model.generateContent(prompt + "\n\nReturn JSON ONLY.");
                const response = await result.response;
                return response.text();
            } catch (geminiError) {
                console.error("❌ Gemini Fallback Failed:", geminiError.message);
            }
        }

        // 3. Last Resort: Structured Fallback
        console.error("❌ All AI Models Failed. Returning stub.");
        return JSON.stringify(schemaStub || {});
    }
};

// --- CONTROLLERS ---

const generateQuestions = async (req, res, next) => {
    const { role, difficulty, resumeText } = req.body;

    if (!role || !difficulty) {
        res.status(400);
        return next(new Error('Please provide both role and difficulty'));
    }

    const systemPrompt = `You are a rigorous technical interviewer. Generate 10 structured interview questions for a ${difficulty} level ${role} position.`;
    let userPrompt = `Return ONLY a JSON object: { "questions": ["Q1", "Q2", ...] }. No markdown.`;

    if (resumeText) {
        userPrompt = `
        Candidate Resume: """${resumeText.substring(0, 4000)}"""
        
        Draft 10 highly specific questions testing claims made in this resume.
        Focus on projects, skills, and experience listed.
        Return ONLY a JSON object: { "questions": ["Q1", "Q2", ...] }. No markdown.`;
    }

    try {
        const rawResponse = await callAI(
            [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            { questions: ["Could not generate specific questions. Tell me about yourself.", "What are your strengths?", "Describe a challenge you faced."] }
        );

        const content = safeParseJSON(rawResponse, { questions: [] });

        // Validation: Ensure we actually got questions
        if (!content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
            throw new Error("AI generated invalid question structure");
        }

        const lowerRole = role.toLowerCase();
        const nonTechKeywords = ['hr', 'manager', 'sales', 'marketing', 'behavioral', 'leadership', 'design', 'product owner'];
        const type = nonTechKeywords.some(k => lowerRole.includes(k)) ? 'Non-Technical' : 'Technical';

        const interview = await Interview.create({
            role,
            difficulty,
            type,
            questions: content.questions,
            userId: req.auth.userId,
            feedback: {}
        });

        res.status(200).json({ ...content, _id: interview._id });
    } catch (error) {
        console.error("Generate Questions Error:", error);
        next(error);
    }
};

const addMoreQuestions = async (req, res, next) => {
    const { interviewId } = req.body;

    try {
        const interview = await Interview.findOne({ _id: interviewId, userId: req.auth.userId });
        if (!interview) return res.status(404).json({ message: 'Interview not found' });

        const prevQuestions = interview.questions.join("\n");
        const prompt = `
        Role: ${interview.role} (${interview.difficulty})
        Previous Questions:
        ${prevQuestions}

        Generate 5 NEW, UNIQUE questions different from above.
        Return JSON: { "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"] }
        `;

        const rawResponse = await callAI([{ role: "user", content: prompt }], { questions: [] });
        const content = safeParseJSON(rawResponse, { questions: [] });

        if (content.questions?.length) {
            interview.questions = [...interview.questions, ...content.questions];
            await interview.save();
        }

        res.status(200).json({ questions: content.questions || [] });
    } catch (error) {
        next(error);
    }
};

const { updateAnalyticsInternal } = require('./analyticsController');

const submitInterview = async (req, res, next) => {
    const { interviewId, userAnswers } = req.body;

    try {
        const interview = await Interview.findOne({ _id: interviewId, userId: req.auth.userId });
        if (!interview) return res.status(404).json({ message: 'Interview not found' });

        interview.answers = userAnswers;

        const prompt = `
        Analyze this interview for a ${interview.role} (${interview.difficulty}).
        Questions: ${JSON.stringify(interview.questions)}
        Answers: ${JSON.stringify(userAnswers)}
        
        Provide detailed JSON report:
        {
            "overallScore": 0-100,
            "summary": "Executive summary of performance.",
            "technicalScore": 0-100,
            "communicationScore": 0-100,
            "improvements": ["Specific tactical advice 1", "Advice 2", "Advice 3"],
            "questionAnalysis": [ 
                { 
                    "question": "Q text", 
                    "topic": "Specific Technical Topic (e.g. React Hooks, SQL Indexing, System Design)", 
                    "score": 0-10, 
                    "feedback": "Critique", 
                    "idealAnswer": "Better approach" 
                } 
            ]
        }
        `;

        const rawResponse = await callAI(
            [{ role: "user", content: prompt }],
            { overallScore: 0, summary: "Analysis failed.", improvements: [], questionAnalysis: [] }
        );

        const feedback = safeParseJSON(rawResponse);
        interview.feedback = feedback;
        await interview.save();

        // Update Weakness Radar in Background
        if (feedback.questionAnalysis) {
            updateAnalyticsInternal(req.auth.userId, feedback.questionAnalysis).catch(console.error);
        }

        res.status(200).json(feedback);
    } catch (error) {
        next(error);
    }
};

// --- ADAPTIVE FOLLOW-UP ENGINE ---
const generateFollowUp = async (req, res, next) => {
    const { question, answer, role, difficulty, history } = req.body;

    try {
        // 1. Context Construction
        let contextBlock = "";
        let weakTopics = [];

        if (history && Array.isArray(history) && history.length > 0) {
            const recent = history.slice(-2); // Last 2 Q&A only (Focus on immediate context)

            // Extract weak topics effectively
            history.forEach(h => {
                if (h.weakTopics && Array.isArray(h.weakTopics)) {
                    weakTopics.push(...h.weakTopics);
                }
            });
            weakTopics = [...new Set(weakTopics)]; // Deduplicate

            contextBlock = `
            Conversational Memory (Last 2 Turns):
            ${recent.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n')}
            
            Identified Weak Topics so far: ${weakTopics.join(', ') || 'None'}
            `;
        }

        const prompt = `
        You are a rigorous technical interviewer for a ${role} (${difficulty}) role.
        
        ${contextBlock}

        Current Question: "${question}"
        Candidate Answer: "${answer}"

        Analyze the candidate's answer based on these STRICT rules:

        1. **Short Answer Detection**: If answer is < 10 words or "I don't know", immediately trigger a follow-up asking for elaboration.
        2. **Low Confidence**: If answer contains "maybe", "I guess", "probably", trigger a follow-up to test certainty.
        3. **Context Check**: If answer contradicts "Conversational Memory", point it out.
        4. **Depth Check**: If answer is correct but surface-level, ask "Why?" or "How does that work internally?".
        5. **Drill Down**: If topic matches "Identified Weak Topics", be extra critical.

        Return JSON ONLY:
        {
            "followUp": "String (The follow-up question) OR null (if answer is satisfactory)",
            "confidenceScore": 0-100 (Estimate based on language certainty),
            "weakTopics": ["Topic1", "Topic2"] (List of topics where candidate struggled in THIS answer)
        }
        `;

        const rawResponse = await callAI(
            [{ role: "user", content: prompt }],
            { followUp: null, KW: [], confidenceScore: 100, weakTopics: [] }
        );

        const content = safeParseJSON(rawResponse, { followUp: null, confidenceScore: 100, weakTopics: [] });

        // Safety Fallback for JSON structure
        const result = {
            followUp: content.followUp || null,
            confidenceScore: typeof content.confidenceScore === 'number' ? content.confidenceScore : 80,
            weakTopics: Array.isArray(content.weakTopics) ? content.weakTopics : []
        };

        res.status(200).json(result);

    } catch (error) {
        console.error("Follow-up Engine Error:", error);
        res.status(200).json({ followUp: null, confidenceScore: 100, weakTopics: [] });
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
        const type = req.query.type;
        const skip = (page - 1) * limit;

        const query = { userId: req.auth.userId };
        if (type) query.type = type;

        const total = await Interview.countDocuments(query);
        const interviews = await Interview.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('role difficulty createdAt feedback.overallScore type');

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

const deleteInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId });
        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }
        res.status(200).json({ message: 'Interview deleted' });
    } catch (error) {
        next(error);
    }
};

const clearHistory = async (req, res, next) => {
    try {
        await Interview.deleteMany({ userId: req.auth.userId });
        res.status(200).json({ message: 'History cleared' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateQuestions,
    addMoreQuestions,
    submitInterview,
    getInterview,
    getUserInterviews,
    parseResume,
    generateFollowUp,
    deleteInterview,
    clearHistory
};
