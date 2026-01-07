require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
async function startServer() {
  console.log('🚀 Starting SupportHub Backend Server...');
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Test database connection
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Server will start but database operations will fail.');
    console.error('    Please check your .env configuration and ensure MySQL is running.');
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`📡 API base URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8000'}`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();
