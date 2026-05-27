import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { env, validateEnv } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getRedisClient, disconnectRedis } from './config/redis.js';
import { initializeSocket } from './socket/index.js';
import { startGenerationWorker } from './queues/generation.worker.js';
import { getGenerationQueue } from './queues/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  validateEnv();

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create Express app
  const app = express();

  // Middleware
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(uploadsDir));

  // API Routes
  app.use('/api', routes);

  // Error handler (must be last)
  app.use(errorHandler);

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize Socket.io
  initializeSocket(httpServer);

  // Connect to MongoDB
  await connectDatabase();

  // Initialize Redis
  getRedisClient();

  // Initialize BullMQ queue
  getGenerationQueue();

  // Start worker
  startGenerationWorker();

  // Start listening
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    httpServer.close();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
