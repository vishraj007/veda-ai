import { create } from 'zustand';
import type { QuestionType } from '@vedaai/shared';
import { generateId } from '@/lib/utils';

export interface QuestionTypeRow {
  id: string;
  type: QuestionType;
  numberOfQuestions: number;
  marksPerQuestion: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'hybrid';
export type ExamPattern = '' | 'cbse' | 'mcq_quiz' | 'unit_test' | 'mid_term' | 'final_exam';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

interface FormStore {
  currentStep: number;
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  additionalInstructions: string;
  uploadedFile: File | null;
  uploadedFileName: string;
  difficulty: DifficultyLevel;
  difficultyDistribution: DifficultyDistribution;
  examPattern: ExamPattern;
  bloomLevels: BloomLevel[];
  errors: Record<string, string>;
  touched: Record<string, boolean>;

  setField: (field: string, value: unknown) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, field: keyof QuestionTypeRow, value: unknown) => void;
  setDifficulty: (level: DifficultyLevel) => void;
  setDifficultyDistribution: (field: keyof DifficultyDistribution, value: number) => void;
  setExamPattern: (pattern: ExamPattern) => void;
  toggleBloomLevel: (level: BloomLevel) => void;
  applyExamTemplate: (pattern: ExamPattern) => void;
  nextStep: () => void;
  prevStep: () => void;
  validate: () => boolean;
  touchField: (field: string) => void;
  touchAllFields: () => void;
  resetForm: () => void;
  getTotalQuestions: () => number;
  getTotalMarks: () => number;
  getValidationSummary: () => string[];
}

/** Exam pattern presets that auto-fill question types */
const EXAM_TEMPLATES: Record<string, QuestionTypeRow[]> = {
  cbse: [
    { id: generateId(), type: 'multiple_choice', numberOfQuestions: 5, marksPerQuestion: 1 },
    { id: generateId(), type: 'short_answer', numberOfQuestions: 5, marksPerQuestion: 2 },
    { id: generateId(), type: 'long_answer', numberOfQuestions: 3, marksPerQuestion: 5 },
  ],
  mcq_quiz: [
    { id: generateId(), type: 'multiple_choice', numberOfQuestions: 20, marksPerQuestion: 1 },
  ],
  unit_test: [
    { id: generateId(), type: 'multiple_choice', numberOfQuestions: 5, marksPerQuestion: 1 },
    { id: generateId(), type: 'short_answer', numberOfQuestions: 5, marksPerQuestion: 2 },
    { id: generateId(), type: 'fill_blanks', numberOfQuestions: 5, marksPerQuestion: 1 },
  ],
  mid_term: [
    { id: generateId(), type: 'multiple_choice', numberOfQuestions: 10, marksPerQuestion: 1 },
    { id: generateId(), type: 'short_answer', numberOfQuestions: 5, marksPerQuestion: 2 },
    { id: generateId(), type: 'long_answer', numberOfQuestions: 4, marksPerQuestion: 5 },
    { id: generateId(), type: 'numerical', numberOfQuestions: 3, marksPerQuestion: 3 },
  ],
  final_exam: [
    { id: generateId(), type: 'multiple_choice', numberOfQuestions: 10, marksPerQuestion: 1 },
    { id: generateId(), type: 'fill_blanks', numberOfQuestions: 5, marksPerQuestion: 1 },
    { id: generateId(), type: 'short_answer', numberOfQuestions: 8, marksPerQuestion: 2 },
    { id: generateId(), type: 'long_answer', numberOfQuestions: 5, marksPerQuestion: 5 },
    { id: generateId(), type: 'numerical', numberOfQuestions: 4, marksPerQuestion: 4 },
  ],
};

export const useFormStore = create<FormStore>((set, get) => ({
  currentStep: 1,
  title: '',
  subject: '',
  className: '',
  schoolName: 'Delhi Public School, Bokaro Steel City',
  dueDate: '',
  questionTypes: [
    { id: generateId(), type: 'multiple_choice', numberOfQuestions: 4, marksPerQuestion: 1 },
  ],
  additionalInstructions: '',
  uploadedFile: null,
  uploadedFileName: '',
  difficulty: 'easy',
  difficultyDistribution: { easy: 33, medium: 34, hard: 33 },
  examPattern: '',
  bloomLevels: [],
  errors: {},
  touched: {},

  setField: (field, value) => {
    set((state) => {
      const newState = { ...state, [field]: value };
      if (state.errors[field]) {
        const errors = { ...state.errors };
        delete errors[field];
        return { ...newState, errors };
      }
      return newState;
    });
  },

  addQuestionType: () => {
    set((state) => ({
      questionTypes: [
        ...state.questionTypes,
        { id: generateId(), type: 'short_answer', numberOfQuestions: 3, marksPerQuestion: 2 },
      ],
    }));
  },

  removeQuestionType: (id) => {
    set((state) => ({
      questionTypes: state.questionTypes.filter((qt) => qt.id !== id),
    }));
  },

  updateQuestionType: (id, field, value) => {
    set((state) => ({
      questionTypes: state.questionTypes.map((qt) =>
        qt.id === id ? { ...qt, [field]: value } : qt
      ),
    }));
  },

  setDifficulty: (level) => set({ difficulty: level }),

  setDifficultyDistribution: (field, value) => {
    set((state) => {
      const dist = { ...state.difficultyDistribution, [field]: value };
      return { difficultyDistribution: dist };
    });
  },

  setExamPattern: (pattern) => set({ examPattern: pattern }),

  toggleBloomLevel: (level) => {
    set((state) => {
      const exists = state.bloomLevels.includes(level);
      return {
        bloomLevels: exists
          ? state.bloomLevels.filter((l) => l !== level)
          : [...state.bloomLevels, level],
      };
    });
  },

  applyExamTemplate: (pattern) => {
    const template = EXAM_TEMPLATES[pattern];
    if (template) {
      // Generate fresh IDs for each row
      const freshTemplate = template.map((row) => ({ ...row, id: generateId() }));
      set({ questionTypes: freshTemplate, examPattern: pattern });
    }
  },

  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  validate: () => {
    const state = get();
    const errors: Record<string, string> = {};

    if (!state.title || state.title.trim().length < 3) {
      errors.title = state.title.trim().length === 0
        ? 'Please enter an assignment title'
        : 'Title must be at least 3 characters long';
    }
    if (!state.subject) {
      errors.subject = 'Please select a subject';
    }
    if (!state.className) {
      errors.className = 'Please select a class';
    }
    if (!state.schoolName || state.schoolName.trim().length === 0) {
      errors.schoolName = 'Please enter your school name';
    }
    if (!state.dueDate) {
      errors.dueDate = 'Please select a due date';
    } else {
      const d = new Date(state.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) errors.dueDate = 'Due date cannot be in the past. Please select today or a future date';
    }
    if (state.questionTypes.length === 0) {
      errors.questionTypes = 'Please add at least one question type';
    }
    if (state.difficulty === 'hybrid') {
      const total = state.difficultyDistribution.easy + state.difficultyDistribution.medium + state.difficultyDistribution.hard;
      if (total !== 100) {
        errors.difficulty = `Difficulty distribution must total 100% (currently ${total}%)`;
      }
    }
    for (const qt of state.questionTypes) {
      if (qt.numberOfQuestions < 1) errors[`qt_${qt.id}_num`] = 'Number of questions must be at least 1';
      if (qt.marksPerQuestion < 1) errors[`qt_${qt.id}_marks`] = 'Marks per question must be at least 1';
    }

    // Check for duplicate types
    const types = state.questionTypes.map((qt) => qt.type);
    const uniqueTypes = new Set(types);
    if (types.length !== uniqueTypes.size) {
      errors.questionTypes = 'Each question type can only be added once. Please remove duplicates';
    }

    // Touch all fields so errors display inline
    const allTouched: Record<string, boolean> = {};
    ['title', 'subject', 'className', 'schoolName', 'dueDate'].forEach((f) => {
      allTouched[f] = true;
    });

    set({ errors, touched: { ...state.touched, ...allTouched } });
    return Object.keys(errors).length === 0;
  },

  touchField: (field) => {
    set((state) => ({ touched: { ...state.touched, [field]: true } }));
  },

  touchAllFields: () => {
    set((state) => {
      const allTouched: Record<string, boolean> = { ...state.touched };
      ['title', 'subject', 'className', 'schoolName', 'dueDate'].forEach((f) => {
        allTouched[f] = true;
      });
      return { touched: allTouched };
    });
  },

  resetForm: () => {
    set({
      currentStep: 1,
      title: '',
      subject: '',
      className: '',
      schoolName: 'Delhi Public School, Bokaro Steel City',
      dueDate: '',
      questionTypes: [
        { id: generateId(), type: 'multiple_choice', numberOfQuestions: 4, marksPerQuestion: 1 },
      ],
      additionalInstructions: '',
      uploadedFile: null,
      uploadedFileName: '',
      difficulty: 'easy',
      difficultyDistribution: { easy: 33, medium: 34, hard: 33 },
      examPattern: '',
      bloomLevels: [],
      errors: {},
      touched: {},
    });
  },

  getTotalQuestions: () => {
    return get().questionTypes.reduce((sum, qt) => sum + qt.numberOfQuestions, 0);
  },

  getTotalMarks: () => {
    return get().questionTypes.reduce((sum, qt) => sum + qt.numberOfQuestions * qt.marksPerQuestion, 0);
  },

  getValidationSummary: () => {
    const errors = get().errors;
    const messages: string[] = [];
    const fieldLabels: Record<string, string> = {
      title: 'Assignment Title',
      subject: 'Subject',
      className: 'Class',
      schoolName: 'School Name',
      dueDate: 'Due Date',
      questionTypes: 'Question Types',
    };
    for (const [key, msg] of Object.entries(errors)) {
      if (key.startsWith('qt_')) continue; // skip inline question type errors
      const label = fieldLabels[key] || key;
      messages.push(`${label}: ${msg}`);
    }
    return messages;
  },
}));
