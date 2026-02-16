const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const healthRoutes = require('./routes/healthRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const goalRoutes = require('./routes/goalRoutes');

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/goals', goalRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
