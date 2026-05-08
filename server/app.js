const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://taskflow-iota-red.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Production Static Build Handling
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error Middleware
app.use(errorHandler);

module.exports = app;