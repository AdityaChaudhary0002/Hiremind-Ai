const express = require('express'); // Force Restart
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
const goalsRoutes = require('./routes/goalsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

app.use('/api/health', healthRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resume', resumeRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
console.log("Server module reloaded");
