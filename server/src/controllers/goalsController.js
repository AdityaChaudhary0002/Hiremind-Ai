const Interview = require('../models/Interview');
const Goal = require('../models/Goal');
const Groq = require("groq-sdk");

// Initialize Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Calculate User Level based on XP/Interviews
const calculateLevel = (interviews, goalsCompleted) => {
    // Simple logic: 1 interview = 100 XP, 1 goal = 50 XP
    const totalXP = (interviews * 100) + (goalsCompleted * 50);

    if (totalXP < 500) return { current: "Recruit", next: "Operative", progress: (totalXP / 500) * 100 };
    if (totalXP < 1500) return { current: "Operative", next: "Specialist", progress: ((totalXP - 500) / 1000) * 100 };
    if (totalXP < 3000) return { current: "Specialist", next: "Architect", progress: ((totalXP - 1500) / 1500) * 100 };
    return { current: "Architect", next: "System Legend", progress: 100 };
};

const getGoals = async (req, res, next) => {
    try {
        const userId = req.auth.userId;

        // 1. Fetch Interviews for Stats
        const interviews = await Interview.find({ userId }).select('score type feedback createdAt');

        // 2. Fetch User Goals
        const userGoals = await Goal.find({ userId }).sort({ createdAt: -1 });

        // 3. Calculate Stats
        const totalInterviews = interviews.length;
        const passedInterviews = interviews.filter(i => i.feedback?.overallScore >= 70).length;
        const averageScore = totalInterviews > 0
            ? Math.round(interviews.reduce((acc, curr) => acc + (curr.feedback?.overallScore || 0), 0) / totalInterviews)
            : 0;

        // Calculate Streak (Mock logic for now, or based on last interview date)
        const streak = 3; // Placeholder

        // Calculate Level
        const goalsCompleted = userGoals.filter(g => g.isCompleted).length;
        const levelData = calculateLevel(totalInterviews, goalsCompleted);

        // 4. Calculate Skill Matrix
        const skillsMap = {};
        interviews.forEach(i => {
            const role = i.role || "General"; // Assuming role is stored or derived
            if (!skillsMap[role]) skillsMap[role] = { total: 0, count: 0 };
            skillsMap[role].total += (i.feedback?.overallScore || 0);
            skillsMap[role].count += 1;
        });

        const skillMatrix = Object.keys(skillsMap).map(role => ({
            role,
            level: Math.round(skillsMap[role].total / skillsMap[role].count),
            missions: skillsMap[role].count
        }));

        // 5. Recent Activity
        const recentActivity = interviews.slice(0, 5).map(i => ({
            _id: i._id,
            role: i.type || "Interview",
            difficulty: "Standard",
            createdAt: i.createdAt,
            feedback: i.feedback
        }));

        // 6. Predictive Intelligence & Momentum Radar
        // Calculate Velocity (Goals per week)
        const firstGoalDate = userGoals.length > 0 ? new Date(userGoals[userGoals.length - 1].createdAt) : new Date();
        const daysActive = Math.max(1, Math.ceil((new Date() - firstGoalDate) / (1000 * 60 * 60 * 24)));
        const velocity = (goalsCompleted / daysActive) * 7; // Goals per week

        // Momentum Calculation
        // Base: Velocity * 10 + Streak * 5 + Efficiency * 0.5
        // Efficiency = Passed / Total
        const efficiency = totalInterviews > 0 ? (passedInterviews / totalInterviews) * 100 : 0;
        let momentumScore = Math.min(100, (velocity * 15) + (streak * 5) + (efficiency * 0.2));

        // Inactivity Penalty
        const lastActivityDate = userGoals.length > 0 ? new Date(userGoals[0].createdAt) : new Date(); // Goals are sorted desc
        const daysSinceLastActivity = Math.floor((new Date() - lastActivityDate) / (1000 * 60 * 60 * 24));

        if (daysSinceLastActivity > 3) momentumScore -= (daysSinceLastActivity - 3) * 10;
        momentumScore = Math.max(0, Math.round(momentumScore));

        // Intelligent Messaging
        let momentumMessage = "Systems syncing...";
        let momentumStatus = "stable";

        if (daysSinceLastActivity > 7) {
            momentumMessage = "Signal lost. Re-initiate sequence with a small objective.";
            momentumStatus = "critical";
        } else if (momentumScore < 30) {
            momentumMessage = "Trajectory decaying. One victory will restore alignment.";
            momentumStatus = "warning";
        } else if (momentumScore < 70) {
            momentumMessage = "Systems operational. Increase output to reach escape velocity.";
            momentumStatus = "stable";
        } else {
            momentumMessage = "Maximum efficiency achieved. You are unstoppable.";
            momentumStatus = "optimal";
        }

        // Estimate Time to Next Level
        const xpNeededr = (levelData.next === "System Legend") ? 0 : 500; // Simplified for now, should be (nextLevelThreshold - currentXP)
        let xpGap = 0;
        if (levelData.current === "Recruit") xpGap = 500 * (1 - levelData.progress / 100);
        else if (levelData.current === "Operative") xpGap = 1000 * (1 - levelData.progress / 100);
        else if (levelData.current === "Specialist") xpGap = 1500 * (1 - levelData.progress / 100);

        const goalsNeededForLevel = Math.ceil(xpGap / 50);
        const daysToLevelUp = velocity > 0 ? Math.ceil((goalsNeededForLevel / (velocity / 7))) : 30;

        const predictions = {
            velocity: parseFloat(velocity.toFixed(1)),
            daysToLevelUp: daysToLevelUp,
            activeDays: daysActive,
            efficiency: Math.round(efficiency),
            momentum: {
                score: momentumScore,
                status: momentumStatus,
                message: momentumMessage
            }
        };

        return res.status(200).json({
            stats: {
                totalInterviews,
                passedInterviews,
                averageScore,
                streak,
                level: levelData.current,
                nextLevel: levelData.next,
                progress: levelData.progress
            },
            skillMatrix,
            recentActivity,
            goals: userGoals,
            predictions
        });

    } catch (error) {
        next(error);
    }
};

const createGoal = async (req, res, next) => {
    try {
        const { title, category } = req.body;
        console.log("[DEBUG] createGoal Body:", req.body);

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const goalData = {
            userId: req.auth.userId,
            title: String(title).trim(),
            category: category || 'daily',
            xpReward: category === 'milestone' ? 500 : category === 'weekly' ? 150 : 50,
            createdAt: new Date()
        };

        const newGoal = await Goal.create(goalData);
        console.log("[DEBUG] Goal Created:", newGoal);

        return res.status(201).json(newGoal);
    } catch (error) {
        console.error("[DEBUG] Create Goal Error:", error);
        next(error);
    }
};

const toggleGoal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOne({ _id: id, userId: req.auth.userId });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        goal.isCompleted = !goal.isCompleted;
        await goal.save();

        return res.status(200).json(goal);
    } catch (error) {
        next(error);
    }
};

const togglePriority = async (req, res, next) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOne({ _id: id, userId: req.auth.userId });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        goal.isPriority = !goal.isPriority;
        await goal.save();

        return res.status(200).json(goal);
    } catch (error) {
        next(error);
    }
};

const deleteGoal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOneAndDelete({ _id: id, userId: req.auth.userId });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        return res.status(200).json({ message: "Goal deleted" });
    } catch (error) {
        next(error);
    }
};

const deleteAllGoals = async (req, res, next) => {
    try {
        await Goal.deleteMany({ userId: req.auth.userId });
        return res.status(200).json({ message: "All goals reset" });
    } catch (error) {
        next(error);
    }
};

// AI Strategy Generator
const generateGoalStrategy = async (req, res, next) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOne({ _id: id, userId: req.auth.userId });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        const prompt = `
        Act as a Personal Career Strategist & Coach.
        User Goal: "${goal.title}"
        Category: ${goal.category}

        Generate a strategic execution plan.
        Return JSON ONLY:
        {
            "roadmap": ["Step 1", "Step 2", "Step 3", "Step 4"],
            "weeklyPlan": ["Week 1: Focus on X", "Week 2: Build Y"],
            "skills": ["Skill 1", "Skill 2"],
            "timeline": "Estimated timeframe string (e.g., '4 Weeks')"
        }
        Keep steps concise, actionable, and inspiring. No markdown.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const text = completion.choices[0]?.message?.content || "{}";
        const strategy = JSON.parse(text);

        goal.aiStrategy = {
            ...strategy,
            generatedAt: new Date()
        };
        await goal.save();

        return res.status(200).json(goal);
    } catch (error) {
        console.error("AI Strategy Error:", error);
        next(error);
    }
};

module.exports = {
    getGoals,
    createGoal,
    toggleGoal,
    togglePriority,
    generateGoalStrategy,
    deleteGoal,
    deleteAllGoals
};
