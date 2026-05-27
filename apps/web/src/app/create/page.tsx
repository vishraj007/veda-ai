'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AssignmentForm from '@/components/create/AssignmentForm';
import { useFormStore } from '@/store/useFormStore';
import { generateId } from '@/lib/utils';

/** Tool presets that auto-configure the form */
const TOOL_PRESETS: Record<string, {
  title: string;
  subtitle: string;
  defaultQuestionTypes: { type: string; numberOfQuestions: number; marksPerQuestion: number }[];
  additionalHint: string;
}> = {
  question_paper: {
    title: 'Create Question Paper',
    subtitle: 'Generate a comprehensive question paper with AI',
    defaultQuestionTypes: [
      { type: 'multiple_choice', numberOfQuestions: 4, marksPerQuestion: 1 },
    ],
    additionalHint: '',
  },
  worksheet: {
    title: 'Create Worksheet',
    subtitle: 'Generate a practice worksheet for students',
    defaultQuestionTypes: [
      { type: 'fill_blanks', numberOfQuestions: 5, marksPerQuestion: 1 },
      { type: 'short_answer', numberOfQuestions: 5, marksPerQuestion: 2 },
    ],
    additionalHint: 'Exam Pattern: Worksheet format.\nGenerate as a practice worksheet. Include clear instructions for students. Make questions progressively harder.',
  },
  quiz: {
    title: 'Create Quiz',
    subtitle: 'Generate a quick MCQ quiz for classroom assessment',
    defaultQuestionTypes: [
      { type: 'multiple_choice', numberOfQuestions: 15, marksPerQuestion: 1 },
    ],
    additionalHint: 'Exam Pattern: MCQ Quiz format.\nThis is a quick quiz. Keep questions concise and clear. Mix easy and moderate difficulty.',
  },
  homework: {
    title: 'Create Homework',
    subtitle: 'Design structured homework for daily practice',
    defaultQuestionTypes: [
      { type: 'short_answer', numberOfQuestions: 5, marksPerQuestion: 2 },
      { type: 'long_answer', numberOfQuestions: 2, marksPerQuestion: 5 },
    ],
    additionalHint: 'Exam Pattern: Homework format.\nDesign as homework assignment. Include a mix of practice problems. Questions should encourage self-study.',
  },
  answer_key: {
    title: 'Create Answer Key',
    subtitle: 'Generate detailed answer key with step-by-step solutions',
    defaultQuestionTypes: [
      { type: 'multiple_choice', numberOfQuestions: 5, marksPerQuestion: 1 },
      { type: 'short_answer', numberOfQuestions: 5, marksPerQuestion: 2 },
    ],
    additionalHint: 'Generate detailed step-by-step solutions in the answer key. Each answer should explain the reasoning clearly.',
  },
};

function CreatePageInner() {
  const searchParams = useSearchParams();
  const toolType = searchParams.get('tool') || 'question_paper';
  const { setField } = useFormStore();

  useEffect(() => {
    const preset = TOOL_PRESETS[toolType];
    if (preset) {
      // Apply default question types for this tool
      const qts = preset.defaultQuestionTypes.map((qt) => ({
        id: generateId(),
        ...qt,
      }));
      setField('questionTypes', qts);

      // Set additional instructions hint if not already set
      if (preset.additionalHint) {
        setField('additionalInstructions', preset.additionalHint);
      }
    }
  }, [toolType, setField]);

  const preset = TOOL_PRESETS[toolType] || TOOL_PRESETS.question_paper;

  return <AssignmentForm toolTitle={preset.title} toolSubtitle={preset.subtitle} />;
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Loading...</div>}>
      <CreatePageInner />
    </Suspense>
  );
}
