const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { testConnection } = require('./config/database');

// Initialize app
const app = express();

// Trust proxy — required for Railway/Vercel deployment
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting — Login only
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limit to login route only
app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/threats', require('./routes/threatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assessments', require('./routes/riskAssessmentRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Risk Assessment API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check:');
      console.error('   1. XAMPP MySQL is running');
      console.error('   2. Database exists (risk_assessment_db)');
      console.error('   3. .env file is configured correctly');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 Risk Assessment API Server Running');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📡 Server:    http://localhost:${PORT}`);
      console.log(`🔗 API:       http://localhost:${PORT}/api`);
      console.log(`💚 Health:    http://localhost:${PORT}/api/health`);
      console.log(`🌍 CORS:      ${process.env.FRONTEND_URL}`);
      console.log(`📊 Database:  ${process.env.DB_NAME}`);
      console.log(`🔒 JWT:       ${process.env.JWT_EXPIRE} expiration`);
      console.log(`🛡️  Rate Limit: 10 login attempts per 15 minutes`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('📌 Available Routes:');
      console.log('   POST   /api/auth/register      - Register new user');
      console.log('   POST   /api/auth/login         - Login user');
      console.log('   GET    /api/auth/me            - Get current user');
      console.log('   GET    /api/assets             - Get all assets');
      console.log('   POST   /api/assets             - Create asset');
      console.log('   GET    /api/threats            - Get all threats');
      console.log('   POST   /api/threats            - Create threat');
      console.log('   GET    /api/assessments        - Get all assessments');
      console.log('   POST   /api/assessments        - Create assessment');
      console.log('   GET    /api/users              - Get all users (Admin)');
      console.log('   GET    /api/users/stats        - Get user stats (Admin)');
      console.log('');
      console.log('Press Ctrl+C to stop the server');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;