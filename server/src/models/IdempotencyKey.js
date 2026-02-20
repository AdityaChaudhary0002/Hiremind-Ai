const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // TTL Index: Auto-delete after 24 hours (86400 seconds)
    }
});

// Create a compound unique index so a user cannot submit the same session twice
idempotencyKeySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);
