const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log to file
    try {
        const logPath = path.join(__dirname, '../../fatal_error.log');
        const logMsg = `[${new Date().toISOString()}] ${statusCode} - ${err.message}\nStack: ${err.stack}\n\n`;
        fs.appendFileSync(logPath, logMsg);
    } catch (e) {
        console.error("Failed to write to fatal_error.log", e);
    }

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        errors: err.errors || undefined
    });
};

module.exports = { notFound, errorHandler };
