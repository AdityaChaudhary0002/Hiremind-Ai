import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/+$/, '');

// Helper to create headers
const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

// Create Axios Instance with Timeout
const client = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30s timeout
});

const api = {
    // --- INTERVIEW FLOW ---

    /**
     * Generate interview questions based on role and difficulty
     */
    generateQuestions: async (role, difficulty, token, resumeText = null) => {
        const payload = { role, difficulty };
        if (resumeText) payload.resumeText = resumeText;

        const response = await client.post(
            `/api/interview/generate`,
            payload,
            getAuthHeaders(token)
        );
        return response.data;
    },

    /**
     * Submit a single Q&A pair for background processing
     */
    submitFollowup: async (data, token) => {
        // data: { question, answer, role, difficulty, history }
        return client.post(
            `/api/interview/followup`,
            data,
            getAuthHeaders(token)
        );
    },

    /**
     * Finalize and submit the entire interview
     */
    submitInterview: async (interviewId, answers, sessionId, token) => {
        return client.post(
            `/api/interview/submit`,
            { interviewId, answers, sessionId },
            getAuthHeaders(token)
        );
    },

    // --- DASHBOARD / USER DATA ---

    /**
     * Fetch all past interviews for the user
     */
    getUserInterviews: async (token, page = 1, limit = 10, type) => {
        const response = await client.get(
            `/api/interview/history`, // Updated endpoint to match route
            {
                ...getAuthHeaders(token),
                params: { page, limit, type }
            }
        );
        return response.data;
    },

    /**
     * Fetch intelligence data
     */
    getIntelligence: async (token) => {
        const response = await client.get(
            `/api/interview/intelligence`,
            getAuthHeaders(token)
        );
        return response.data;
    },

    /**
     * Fetch a specific interview by ID
     */
    getInterviewById: async (id, token) => {
        const response = await client.get(
            `/api/interview/${id}`,
            getAuthHeaders(token)
        );
        return response.data;
    },

    deleteInterview: async (id, token) => {
        return client.delete(
            `/api/interview/${id}`,
            getAuthHeaders(token)
        );
    },

    clearHistory: async (token) => {
        return client.delete(
            `/api/interview`,
            getAuthHeaders(token)
        );
    },

    // --- GOALS ---
    getGoals: async (token) => {
        const response = await client.get(
            `/api/goals`,
            getAuthHeaders(token)
        );
        return response.data;
    },

    createGoal: async (title, category, token) => {
        const response = await client.post(
            `/api/goals`,
            { title, category },
            getAuthHeaders(token)
        );
        return response.data;
    },

    toggleGoal: async (id, token) => {
        const response = await client.patch(
            `/api/goals/${id}/toggle`,
            {},
            getAuthHeaders(token)
        );
        return response.data;
    },

    togglePriority: async (id, token) => {
        const response = await client.patch(
            `/api/goals/${id}/priority`,
            {},
            getAuthHeaders(token)
        );
        return response.data;
    },

    generateStrategy: async (id, token) => {
        const response = await client.post(
            `/api/goals/${id}/strategize`,
            {},
            getAuthHeaders(token)
        );
        return response.data;
    },

    deleteGoal: async (id, token) => {
        const response = await client.delete(
            `/api/goals/${id}`,
            getAuthHeaders(token)
        );
        return response.data;
    },

    deleteAllGoals: async (token) => {
        const response = await client.delete(
            `/api/goals/debug/reset`,
            getAuthHeaders(token)
        );
        return response.data;
    },

    // --- UTILS ---

    /**
     * Execute code via Piston API (External)
     */
    runCode: async (language, code) => {
        const pistonLang = language === 'node' ? 'javascript' : language;
        return axios.post('https://emkc.org/api/v2/piston/execute', {
            language: pistonLang,
            version: '*',
            files: [{ content: code }]
        });
    }
};

export default api;
