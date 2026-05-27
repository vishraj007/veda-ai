/** All supported question types in the system */
export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice Questions' },
  { value: 'short_answer', label: 'Short Questions' },
  { value: 'long_answer', label: 'Long Answer Questions' },
  { value: 'diagram_graph', label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
  { value: 'fill_blanks', label: 'Fill in the Blanks' },
  { value: 'true_false', label: 'True/False Questions' },
] as const;

/** Supported difficulty levels */
export const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Challenging'] as const;

/** Supported file upload types */
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

/** Maximum file upload size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Assignment status values */
export const ASSIGNMENT_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

/** WebSocket event names */
export const WS_EVENTS = {
  GENERATION_PROGRESS: 'generation:progress',
  GENERATION_COMPLETED: 'generation:completed',
  GENERATION_FAILED: 'generation:failed',
  JOIN_ROOM: 'join:assignment',
  LEAVE_ROOM: 'leave:assignment',
} as const;

/** API endpoints */
export const API_ENDPOINTS = {
  ASSIGNMENTS: '/api/assignments',
  ASSIGNMENT_BY_ID: (id: string) => `/api/assignments/${id}`,
  REGENERATE: (id: string) => `/api/assignments/${id}/regenerate`,
  PAPER: (id: string) => `/api/assignments/${id}/paper`,
  PDF: (id: string) => `/api/assignments/${id}/pdf`,
} as const;
