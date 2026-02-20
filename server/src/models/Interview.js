const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Technical', 'Non-Technical'],
        default: 'Technical'
    },
    questions: {
        type: [String],
        required: true,
    },
    answers: {
        type: [String],
        default: [],
    },
    feedback: {
        type: Object,
        default: {},
    },
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['In-Progress', 'Completed'],
        default: 'In-Progress'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Interview', interviewSchema);
