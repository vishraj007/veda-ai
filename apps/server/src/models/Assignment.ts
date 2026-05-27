import mongoose, { Schema, Document } from 'mongoose';
import type { AssignmentStatus, QuestionType } from '@vedaai/shared';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: Date;
  questionTypes: {
    type: QuestionType;
    numberOfQuestions: number;
    marksPerQuestion: number;
  }[];
  additionalInstructions: string;
  difficulty: string;
  bloomLevels: string[];
  difficultyDistribution?: { easy: number; medium: number; hard: number };
  uploadedFileName?: string;
  status: AssignmentStatus;
  totalQuestions: number;
  totalMarks: number;
  questionPaperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionTypeConfigSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['multiple_choice', 'short_answer', 'long_answer', 'diagram_graph', 'numerical', 'fill_blanks', 'true_false'],
    },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [questionTypeConfigSchema], required: true, validate: [(v: unknown[]) => v.length > 0, 'At least one question type is required'] },
    additionalInstructions: { type: String, default: '', maxlength: 1000 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed', 'hybrid'], default: 'mixed' },
    bloomLevels: [{ type: String }],
    difficultyDistribution: {
      type: { easy: { type: Number }, medium: { type: Number }, hard: { type: Number } },
      default: undefined,
    },
    uploadedFileName: { type: String },
    status: { type: String, enum: ['draft', 'generating', 'completed', 'failed'], default: 'draft' },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    questionPaperId: { type: Schema.Types.ObjectId, ref: 'QuestionPaper' },
  },
  { timestamps: true }
);

assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ status: 1 });

export const AssignmentModel = mongoose.model<IAssignment>('Assignment', assignmentSchema);
