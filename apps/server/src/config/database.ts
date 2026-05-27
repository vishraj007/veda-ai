import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/** Connect to MongoDB with retry logic */
export async function connectDatabase(): Promise<void> {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      logger.info('MongoDB connected successfully');

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      return;
    } catch (error) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`, error);
      if (retries < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        logger.info(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after maximum retries');
}

/** Disconnect from MongoDB gracefully */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
