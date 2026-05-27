/** Supported question types */
export type QuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'long_answer'
  | 'diagram_graph'
  | 'numerical'
  | 'fill_blanks'
  | 'true_false';

/** Difficulty levels for questions */
export type Difficulty = 'Easy' | 'Moderate' | 'Challenging';

/** Assignment status */
export type AssignmentStatus = 'draft' | 'generating' | 'completed' | 'failed';

/** Configuration for a single question type in the form */
export interface QuestionTypeConfig {
  id: string;
  type: QuestionType;
  numberOfQuestions: number;
  marksPerQuestion: number;
}

/** Assignment document as stored in the database */
export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  uploadedFileName?: string;
  status: AssignmentStatus;
  totalQuestions: number;
  totalMarks: number;
  questionPaperId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Input payload for creating a new assignment */
export interface CreateAssignmentInput {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: Omit<QuestionTypeConfig, 'id'>[];
  additionalInstructions?: string;
}
