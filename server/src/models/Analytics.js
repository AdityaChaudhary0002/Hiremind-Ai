const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Map of Skill/Topic -> Metrics
    skills: {
        type: Map,
        of: new mongoose.Schema({
            totalScore: { type: Number, default: 0 }, // Sum of scores (0-100 normalized)
            count: { type: Number, default: 0 }, // Number of questions/interviews on this topic
            lastUpdated: { type: Date, default: Date.now }
        }, { _id: false })
    },
    // Snapshot of current weakest areas
    weaknesses: [{
        topic: String,
        averageScore: Number
    }],
    lastInterviewDate: Date
}, { timestamps: true });

// Method to update a skill score
analyticsSchema.methods.updateSkill = function (topic, score) {
    // Normalize topic key (lowercase, trimmed)
    const key = topic.trim();

    if (!this.skills.has(key)) {
        this.skills.set(key, { totalScore: score, count: 1, lastUpdated: new Date() });
    } else {
        const data = this.skills.get(key);
        data.totalScore += score;
        data.count += 1;
        data.lastUpdated = new Date();
        this.skills.set(key, data); // Mongoose Map setter
    }
};

// Method to recalculate top weaknesses
analyticsSchema.methods.recalculateWeaknesses = function () {
    const skillList = [];
    this.skills.forEach((value, key) => {
        const avg = value.totalScore / value.count;
        skillList.push({ topic: key, averageScore: Math.round(avg) });
    });

    // Sort by Ascending Score (Weakest first)
    // Filter out skills with very low distinctness or generic names if possible, but for now take all.
    // We strictly want the lowest scores.
    skillList.sort((a, b) => a.averageScore - b.averageScore);

    this.weaknesses = skillList.slice(0, 5); // Store top 5 weakest
};

module.exports = mongoose.model('Analytics', analyticsSchema);
