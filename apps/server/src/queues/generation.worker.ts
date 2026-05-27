import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import { AssignmentModel } from '../models/Assignment.js';
import { QuestionPaperModel } from '../models/QuestionPaper.js';
import { buildPrompt } from '../services/prompt.service.js';
import { generateQuestionPaper } from '../services/ai.service.js';
import { emitToAssignment } from '../socket/index.js';
import { WS_EVENTS } from '@vedaai/shared';
import { logger } from '../utils/logger.js';

interface GenerationJobData {
  assignmentId: string;
}

/** Start the BullMQ worker that processes question paper generation jobs */
export function startGenerationWorker(): Worker {
  const connection = getRedisClient();

  const worker = new Worker<GenerationJobData>(
    'question-generation',
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;
      logger.info(`Processing generation job for assignment: ${assignmentId}`);

      try {
        // Step 1: Update status to generating
        const assignment = await AssignmentModel.findByIdAndUpdate(
          assignmentId,
          { status: 'generating' },
          { new: true }
        );

        if (!assignment) {
          throw new Error(`Assignment ${assignmentId} not found`);
        }

        // Step 2: Emit progress 10%
        emitToAssignment(assignmentId, WS_EVENTS.GENERATION_PROGRESS, {
          assignmentId,
          status: 'processing',
          progress: 10,
          message: 'Starting question generation...',
        });

        // Step 3: Build prompt
        const prompt = buildPrompt(assignment);
        emitToAssignment(assignmentId, WS_EVENTS.GENERATION_PROGRESS, {
          assignmentId,
          status: 'processing',
          progress: 25,
          message: 'Preparing AI prompt...',
        });

        // Step 4: Call AI service
        emitToAssignment(assignmentId, WS_EVENTS.GENERATION_PROGRESS, {
          assignmentId,
          status: 'processing',
          progress: 40,
          message: 'Generating questions with AI...',
        });

        const generatedPaper = await generateQuestionPaper(prompt);

        emitToAssignment(assignmentId, WS_EVENTS.GENERATION_PROGRESS, {
          assignmentId,
          status: 'processing',
          progress: 70,
          message: 'Processing AI response...',
        });

        // Step 5: Save question paper to MongoDB
        const questionPaper = await QuestionPaperModel.create({
          assignmentId,
          schoolName: assignment.schoolName,
          subject: assignment.subject,
          className: assignment.className,
          timeAllowed: generatedPaper.timeAllowed,
          maxMarks: generatedPaper.maxMarks || assignment.totalMarks,
          generalInstructions: generatedPaper.generalInstructions,
          sections: generatedPaper.sections,
          answerKey: generatedPaper.answerKey || [],
        });

        emitToAssignment(assignmentId, WS_EVENTS.GENERATION_PROGRESS, {
          assignmentId,
          status: 'processing',
          progress: 90,
          message: 'Saving results...',
        });

        // Step 6: Update assignment with paper reference
        await AssignmentModel.findByIdAndUpdate(assignmentId, {
          status: 'completed',
          questionPaperId: questionPaper._id,
        });

        // Step 7: Cache result in Redis
        try {
          const redis = getRedisClient();
          await redis.setex(
            `paper:${assignmentId}`,
            3600,
            JSON.stringify(questionPaper.toJSON())
          );
        } catch (cacheErr) {
          logger.warn('Failed to cache paper in Redis:', cacheErr);
        }

        // Step 8: Emit completion
        emitToAssignment(assignmentId, WS_EVENTS.GENERATION_COMPLETED, {
          assignmentId,
          status: 'completed',
          progress: 100,
          message: 'Question paper generated successfully!',
          paper: questionPaper.toJSON(),
        });

        logger.info(`Generation completed for assignment: ${assignmentId}`);
        return { questionPaperId: questionPaper._id };
      } catch (error) {
        logger.error(`Generation failed for assignment ${assignmentId}:`, error);

        // Update status to failed
        await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'failed' });

        // Emit failure
        emitToAssignment(assignmentId, WS_EVENTS.GENERATION_FAILED, {
          assignmentId,
          status: 'failed',
          progress: 0,
          message: `Generation failed: ${(error as Error).message}`,
        });

        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
      limiter: { max: 5, duration: 60000 },
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err.message);
  });

  logger.info('Generation worker started');
  return worker;
}
