const Analytics = require('../models/Analytics');

// Public Endpoint: Get Weaknesses
const getWeaknesses = async (req, res, next) => {
    try {
        const analytics = await Analytics.findOne({ userId: req.auth.userId });

        if (!analytics) {
            return res.status(200).json({ weaknesses: [] });
        }

        // Return top 3
        const top3 = analytics.weaknesses.slice(0, 3);
        res.status(200).json({ weaknesses: top3 });

    } catch (error) {
        next(error);
    }
};

// Internal Helper: Update Analytics after Interview
const updateAnalyticsInternal = async (userId, questionAnalysis) => {
    try {
        let analytics = await Analytics.findOne({ userId });
        if (!analytics) {
            analytics = new Analytics({ userId, skills: {} });
        }

        // questionAnalysis: [{ topic: "React", score: 8, ... }]
        // Note: Score in analysis is usually 0-10. We normalize to 0-100.

        for (const item of questionAnalysis) {
            if (item.topic && typeof item.score === 'number') {
                const normalizedScore = item.score <= 10 ? item.score * 10 : item.score;
                analytics.updateSkill(item.topic, normalizedScore);
            }
        }

        analytics.recalculateWeaknesses();
        analytics.lastInterviewDate = new Date();
        await analytics.save();
        console.log("Analytics updated for user:", userId);

    } catch (error) {
        console.error("Failed to update analytics:", error);
        // Don't block the main flow
    }
};

module.exports = { getWeaknesses, updateAnalyticsInternal };
