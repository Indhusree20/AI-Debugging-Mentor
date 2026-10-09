import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { PracticeService } from './services/practiceService.js';

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Seed initial practice problems idempotently
    await PracticeService.seedInitialProblems();

    const server = app.listen(config.port, () => {
      console.log(`==================================================`);
      console.log(`🚀 AI DEBUGGING MENTOR BACKEND ENGINE RUNNING`);
      console.log(`📡 Port: ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🤖 Default AI Provider: ${config.defaultAiProvider}`);
      console.log(`==================================================`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
