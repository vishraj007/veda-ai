import type { Request, Response, NextFunction } from 'express';
import { AssignmentModel } from '../models/Assignment.js';
import { QuestionPaperModel } from '../models/QuestionPaper.js';
import { addGenerationJob } from '../queues/index.js';
import { generatePdf } from '../services/pdf.service.js';
import { getRedisClient } from '../config/redis.js';
import { createError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/** Create a new assignment and queue generation */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, subject, className, schoolName, dueDate, questionTypes, additionalInstructions, difficulty, bloomLevels, difficultyDistribution } = req.body;

    // Calculate totals
    const totalQuestions = questionTypes.reduce((sum: number, qt: { numberOfQuestions: number }) => sum + qt.numberOfQuestions, 0);
    const totalMarks = questionTypes.reduce((sum: number, qt: { numberOfQuestions: number; marksPerQuestion: number }) => sum + qt.numberOfQuestions * qt.marksPerQuestion, 0);

    const assignment = await AssignmentModel.create({
      title,
      subject,
      className,
      schoolName,
      dueDate: new Date(dueDate),
      questionTypes,
      additionalInstructions: additionalInstructions || '',
      difficulty: difficulty || 'easy',
      bloomLevels: bloomLevels || [],
      difficultyDistribution: difficultyDistribution || undefined,
      uploadedFileName: req.file?.filename,
      status: 'generating',
      totalQuestions,
      totalMarks,
    });

    // Add job to BullMQ queue
    await addGenerationJob(assignment._id.toString());

    res.status(201).json({
      success: true,
      data: assignment.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/** List all assignments sorted by newest first */
export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignments = await AssignmentModel.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
}

/** Get a single assignment by ID */
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await AssignmentModel.findById(req.params.id).lean();
    if (!assignment) {
      throw createError('Assignment not found', 404);
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
}

/** Delete an assignment and its associated question paper */
export async function deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    // Delete associated paper
    if (assignment.questionPaperId) {
      await QuestionPaperModel.findByIdAndDelete(assignment.questionPaperId);
      // Clear cache
      try {
        const redis = getRedisClient();
        await redis.del(`paper:${req.params.id}`);
      } catch { /* ignore cache errors */ }
    }

    await AssignmentModel.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: { message: 'Assignment deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

/** Regenerate question paper for an existing assignment */
export async function regenerate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    // Delete old paper if exists
    if (assignment.questionPaperId) {
      await QuestionPaperModel.findByIdAndDelete(assignment.questionPaperId);
      try {
        const redis = getRedisClient();
        await redis.del(`paper:${req.params.id}`);
      } catch { /* ignore */ }
    }

    // Reset status and queue new job
    assignment.status = 'generating';
    assignment.questionPaperId = undefined;
    await assignment.save();

    await addGenerationJob(assignment._id.toString());

    res.json({ success: true, data: assignment.toJSON() });
  } catch (error) {
    next(error);
  }
}

/** Get the generated question paper (checks Redis cache first) */
export async function getPaper(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignmentId = req.params.id;

    // Check Redis cache first
    try {
      const redis = getRedisClient();
      const cached = await redis.get(`paper:${assignmentId}`);
      if (cached) {
        logger.debug('Serving paper from cache');
        res.json({ success: true, data: JSON.parse(cached) });
        return;
      }
    } catch { /* fallthrough to DB */ }

    // Fetch from MongoDB
    const paper = await QuestionPaperModel.findOne({ assignmentId }).lean();
    if (!paper) {
      throw createError('Question paper not found. It may still be generating.', 404);
    }

    // Update cache
    try {
      const redis = getRedisClient();
      await redis.setex(`paper:${assignmentId}`, 3600, JSON.stringify(paper));
    } catch { /* ignore */ }

    res.json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
}

/** Download question paper as PDF */
export async function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paper = await QuestionPaperModel.findOne({ assignmentId: req.params.id });
    if (!paper) {
      throw createError('Question paper not found', 404);
    }

    const pdfBuffer = await generatePdf(paper);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="question-paper-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
