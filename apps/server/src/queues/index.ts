import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

let generationQueue: Queue | null = null;

/** Get or create the question generation queue */
export function getGenerationQueue(): Queue {
  if (!generationQueue) {
    const connection = getRedisClient();
    generationQueue = new Queue('question-generation', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
    logger.info('BullMQ generation queue initialized');
  }
  return generationQueue;
}

/** Add a generation job to the queue */
export async function addGenerationJob(assignmentId: string): Promise<string> {
  const queue = getGenerationQueue();
  const job = await queue.add('generate-paper', { assignmentId }, { jobId: `gen-${assignmentId}-${Date.now()}` });
  logger.info(`Generation job added: ${job.id}`);
  return job.id!;
}
