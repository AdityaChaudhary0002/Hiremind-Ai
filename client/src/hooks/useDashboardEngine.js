import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

export const useDashboardEngine = () => {
    const { getToken, isLoaded, userId } = useAuth();

    // Core Data State
    const [data, setData] = useState({
        interviews: [],
        latestFull: null,
        stats: {
            total: 0,
            avgScore: 0,
            streak: 0,
            lastDate: null
        },
        insight: null,
        intelligence: null
    });

    const [loading, setLoading] = useState(true);
    const [insightLoading, setInsightLoading] = useState(true);
    const [orbState, setOrbState] = useState('idle');

    // --- 1. COMPUTATION ENGINE ---
    const computeStats = (interviews) => {
        if (!interviews?.length) return { total: 0, avgScore: 0, streak: 0, lastDate: null };

        const total = interviews.length;
        const avgScore = Math.round(interviews.reduce((acc, curr) => acc + (curr.feedback?.overallScore || 0), 0) / total);
        const lastDate = new Date(interviews[0].createdAt);

        let streak = 0;
        const today = new Date().setHours(0, 0, 0, 0);
        const dates = interviews.map(i => new Date(i.createdAt).setHours(0, 0, 0, 0));
        const uniqueDates = [...new Set(dates)];

        const lastInterviewDate = uniqueDates[0];
        const diffDays = (today - lastInterviewDate) / (1000 * 60 * 60 * 24);

        if (diffDays <= 1) {
            streak = 1;
            for (let i = 0; i < uniqueDates.length - 1; i++) {
                const curr = uniqueDates[i];
                const prev = uniqueDates[i + 1];
                const gap = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                if (gap === 1) streak++;
                else break;
            }
        }

        return { total, avgScore, streak, lastDate };
    };

    const generateInsight = (recentSessions) => {
        if (!recentSessions.length) return null;

        const weakTopics = {};
        let lowestScore = 100;
        let lowestTopic = '';

        recentSessions.forEach(session => {
            const analysis = session.feedback?.questionAnalysis || [];
            analysis.forEach(q => {
                if (q.score < 6) {
                    const topic = q.topic || "General Knowledge";
                    weakTopics[topic] = (weakTopics[topic] || 0) + 1;
                }
                if (q.score < lowestScore) {
                    lowestScore = q.score;
                    lowestTopic = q.topic;
                }
            });
        });

        const sortedWeak = Object.entries(weakTopics).sort((a, b) => b[1] - a[1]);

        if (sortedWeak.length > 0) {
            const [topic] = sortedWeak[0];
            return {
                message: `Weakness detected in ${topic}. Response depth is insufficient. Recommendation: Drill ${topic} specifically.`,
                type: "warning"
            };
        } else if (lowestTopic && lowestScore < 7) {
            return {
                message: `Your technical accuracy in ${lowestTopic} is below threshold (${lowestScore}/10). Refine your definitions.`,
                type: "warning"
            };
        }

        return {
            message: "Performance nominal. System optimal. Maintain current trajectory.",
            type: "success"
        };
    };

    // --- 2. DATA FETCHING ---

    useEffect(() => {
        let isMounted = true;
        let safetyTimer;

        console.log("Dashboard Engine: Initializing...");

        safetyTimer = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("Dashboard Engine: Safety timer triggered.");
                setLoading(false);
                setInsightLoading(false);
            }
        }, 3000);

        const init = async () => {
            // Wait for auth loaded
            if (!isLoaded || !userId) return;

            try {
                const token = await getToken();
                // 1. Fetch List and Intelligence
                console.log("Dashboard Engine: Fetching data...");
                const [res, intelligenceRes] = await Promise.all([
                    api.getUserInterviews(token, 1, 50).catch(() => ({ interviews: [] })),
                    api.getIntelligence(token).catch(() => null)
                ]);

                const list = res.interviews || (Array.isArray(res) ? res : []);

                if (!isMounted) return;

                const stats = computeStats(list);

                setData(prev => ({ ...prev, interviews: list, stats, intelligence: intelligenceRes }));
                setLoading(false);

                // 2. Fetch Deep Details (Insight)
                let recentFull = [];
                if (list.length > 0) {
                    const top3 = list.slice(0, 3);
                    recentFull = await Promise.all(
                        top3.map(i => api.getInterviewById(i._id, token).catch(() => null))
                    );
                    recentFull = recentFull.filter(Boolean);
                }

                if (!isMounted) return;

                const insight = generateInsight(recentFull);

                let nextOrbState = 'idle';
                if (stats.streak > 5) nextOrbState = 'flux';
                else if (list.length > 1 && list[0].feedback?.overallScore > stats.avgScore) nextOrbState = 'pulse';

                setData(prev => ({
                    ...prev,
                    latestFull: recentFull[0] || null,
                    insight
                }));
                // Update orb state safely
                if (isMounted) setOrbState(nextOrbState);

            } catch (err) {
                console.error("Dashboard Engine Failure:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setInsightLoading(false);
                }
            }
        };

        if (isLoaded) {
            init();
        }

        return () => {
            isMounted = false;
            clearTimeout(safetyTimer);
        };
    }, [isLoaded]); // Removing excessive dependencies

    // --- 3. TIME AWARENESS ---
    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) return "Good Morning";
        if (h >= 12 && h < 17) return "Good Afternoon";
        if (h >= 17 && h < 22) return "Good Evening";
        return "Late Night Protocol";
    }, []);

    return {
        ...data,
        loading,
        insightLoading,
        orbState,
        greeting,
        user: { id: userId } // Return mock user
    };
};
