import { z } from 'zod';

/** Validation schema for a single question type config row */
const questionTypeConfigSchema = z.object({
  type: z.enum([
    'multiple_choice',
    'short_answer',
    'long_answer',
    'diagram_graph',
    'numerical',
    'fill_blanks',
    'true_false',
  ], { required_error: 'Question type is required' }),
  numberOfQuestions: z
    .number({ required_error: 'Number of questions is required' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1 question')
    .max(50, 'Maximum 50 questions'),
  marksPerQuestion: z
    .number({ required_error: 'Marks is required' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1 mark')
    .max(20, 'Maximum 20 marks per question'),
});

/** Validation schema for creating an assignment */
export const createAssignmentSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  subject: z
    .string({ required_error: 'Subject is required' })
    .min(1, 'Subject is required')
    .trim(),
  className: z
    .string({ required_error: 'Class is required' })
    .min(1, 'Class is required')
    .trim(),
  schoolName: z
    .string({ required_error: 'School name is required' })
    .min(1, 'School name is required')
    .trim(),
  dueDate: z
    .string({ required_error: 'Due date is required' })
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date format')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Due date must be today or a future date'),
  questionTypes: z
    .array(questionTypeConfigSchema)
    .min(1, 'At least one question type is required')
    .refine(
      (types) => {
        const seen = new Set<string>();
        for (const t of types) {
          if (seen.has(t.type)) return false;
          seen.add(t.type);
        }
        return true;
      },
      { message: 'Duplicate question types are not allowed' }
    ),
  additionalInstructions: z
    .string()
    .max(1000, 'Instructions must be less than 1000 characters')
    .optional()
    .default(''),
});

/** Inferred type from the validation schema */
export type CreateAssignmentValidated = z.infer<typeof createAssignmentSchema>;
