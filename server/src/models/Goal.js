const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
    isPriority: { type: Boolean, default: false },
    category: { type: String, enum: ['daily', 'weekly', 'milestone'], default: 'daily' },
    deadline: { type: Date },
    xpReward: { type: Number, default: 50 },
    createdAt: { type: Date, default: Date.now },
    aiStrategy: {
        roadmap: [String],
        weeklyPlan: [String],
        skills: [String],
        timeline: String,
        generatedAt: Date
    }
});

module.exports = mongoose.model('Goal', goalSchema);
