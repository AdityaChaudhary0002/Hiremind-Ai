const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    current: {
        type: Number,
        default: 0
    },
    target: {
        type: Number,
        required: true
    },
    category: {
        type: String, // 'technical', 'soft-skill', 'interview'
        default: 'technical'
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
