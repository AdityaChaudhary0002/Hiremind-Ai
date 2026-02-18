import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Helper to create headers
const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const api = {
    // --- INTERVIEW FLOW ---

    /**
     * Generate interview questions based on role and difficulty
     */
    generateQuestions: async (role, difficulty, token) => {
        const response = await axios.post(
            `${API_URL}/api/interview/generate`,
            { role, difficulty },
            getAuthHeaders(token)
        );
        return response.data;
    },

    /**
     * Submit a single Q&A pair for background processing
     */
    submitFollowup: async (data, token) => {
        // data: { question, answer, role, difficulty }
        return axios.post(
            `${API_URL}/api/interview/followup`,
            data,
            getAuthHeaders(token)
        );
    },

    /**
     * Finalize and submit the entire interview
     */
    submitInterview: async (interviewId, answers, token) => {
        return axios.post(
            `${API_URL}/api/interview/submit`,
            { interviewId, answers },
            getAuthHeaders(token)
        );
    },

    // --- DASHBOARD / USER DATA ---

    /**
     * Fetch all past interviews for the user
     */
    getUserInterviews: async (token) => {
        const response = await axios.get(
            `${API_URL}/api/interview/user-interviews`,
            getAuthHeaders(token)
        );
        return response.data;
    },

    /**
     * Fetch a specific interview by ID
     */
    getInterviewById: async (id, token) => {
        const response = await axios.get(
            `${API_URL}/api/interview/${id}`,
            getAuthHeaders(token)
        );
        return response.data;
    },

    // --- GOALS ---
    getGoals: async (token) => {
        const response = await axios.get(
            `${API_URL}/api/goals`,
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
