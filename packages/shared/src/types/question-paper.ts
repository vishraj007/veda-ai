import type { Difficulty } from './assignment';

/** A single question in the paper */
export interface Question {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

/** A section within the question paper (e.g., Section A) */
export interface Section {
  title: string;
  sectionType: string;
  instruction: string;
  questions: Question[];
}

/** An item in the answer key */
export interface AnswerKeyItem {
  questionNumber: number;
  answer: string;
}

/** Complete question paper document */
export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: Section[];
  answerKey: AnswerKeyItem[];
  createdAt: string;
}

/** WebSocket progress event payload */
export interface GenerationProgress {
  assignmentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
}
