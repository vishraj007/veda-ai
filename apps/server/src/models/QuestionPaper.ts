import mongoose, { Schema, Document } from 'mongoose';
import type { Difficulty } from '@vedaai/shared';

export interface IQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface ISection {
  title: string;
  sectionType: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswerKeyItem {
  questionNumber: number;
  answer: string;
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: ISection[];
  answerKey: IAnswerKeyItem[];
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
    marks: { type: Number, required: true, min: 1 },
    options: { type: [String] },
  },
  { _id: false }
);

const sectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    sectionType: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
  },
  { _id: false }
);

const answerKeyItemSchema = new Schema<IAnswerKeyItem>(
  {
    questionNumber: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const questionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    generalInstructions: { type: String, default: 'All questions are compulsory unless stated otherwise.' },
    sections: { type: [sectionSchema], required: true },
    answerKey: { type: [answerKeyItemSchema], default: [] },
  },
  { timestamps: true }
);

questionPaperSchema.index({ assignmentId: 1 });

export const QuestionPaperModel = mongoose.model<IQuestionPaper>('QuestionPaper', questionPaperSchema);
