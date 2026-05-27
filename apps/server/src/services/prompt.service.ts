import type { IAssignment } from '../models/Assignment.js';
import { QUESTION_TYPES } from '@vedaai/shared';

/** Map question type value to readable label */
function getQuestionTypeLabel(type: string): string {
  const found = QUESTION_TYPES.find((qt) => qt.value === type);
  return found ? found.label : type;
}

/** Build difficulty distribution guidance based on structured data */
function getDifficultyGuidance(assignment: IAssignment): string {
  // If custom distribution is provided (hybrid mode), use exact percentages
  if (assignment.difficultyDistribution) {
    const { easy, medium, hard } = assignment.difficultyDistribution;
    return `Difficulty Distribution: ${easy}% Easy, ${medium}% Moderate, ${hard}% Challenging. Generate questions strictly matching this distribution.`;
  }

  // Otherwise use preset distributions based on difficulty level
  switch (assignment.difficulty?.toLowerCase()) {
    case 'easy':
      return 'Difficulty Distribution: 70% Easy, 25% Moderate, 5% Challenging. Focus on basic recall and understanding.';
    case 'medium':
      return 'Difficulty Distribution: 30% Easy, 50% Moderate, 20% Challenging. Focus on application and analysis. This should feel like a typical school exam.';
    case 'hard':
      return 'Difficulty Distribution: 10% Easy, 40% Moderate, 50% Challenging. Focus on critical thinking, evaluation, and problem solving.';
    default:
      return 'Difficulty Distribution: 30% Easy, 50% Moderate, 20% Challenging. Balanced difficulty.';
  }
}

/** Build Bloom's taxonomy guidance */
function getBloomGuidance(bloomLevels: string[]): string {
  if (!bloomLevels || bloomLevels.length === 0) return '';
  return `\n**Bloom's Taxonomy Focus:**\nDesign questions targeting these cognitive levels: ${bloomLevels.join(', ')}. Ensure each question aligns with at least one of these levels. Mention the cognitive level in question design.`;
}

/** Build a structured prompt for the LLM to generate a question paper */
export function buildPrompt(assignment: IAssignment): string {
  const questionTypesList = assignment.questionTypes
    .map(
      (qt, i) =>
        `${i + 1}. ${getQuestionTypeLabel(qt.type)}: ${qt.numberOfQuestions} questions × ${qt.marksPerQuestion} mark(s) each = ${qt.numberOfQuestions * qt.marksPerQuestion} marks`
    )
    .join('\n');

  const sectionLetters = 'ABCDEFGHIJ';
  const sectionMapping = assignment.questionTypes
    .map((qt, i) => `- Section ${sectionLetters[i]}: ${getQuestionTypeLabel(qt.type)}`)
    .join('\n');

  const difficultyGuidance = getDifficultyGuidance(assignment);
  const bloomGuidance = getBloomGuidance(assignment.bloomLevels || []);
  const cleanInstructions = assignment.additionalInstructions || '';

  const prompt = `You are an expert educational content creator. Generate a comprehensive and well-structured question paper based on the following specifications.

**Paper Details:**
- School: ${assignment.schoolName}
- Subject: ${assignment.subject}
- Class: ${assignment.className}
- Total Questions: ${assignment.totalQuestions}
- Total Marks: ${assignment.totalMarks}
- Time Allowed: ${Math.ceil(assignment.totalMarks * 1.5)} minutes

**Question Types Required:**
${questionTypesList}

**Section Mapping:**
${sectionMapping}

**${difficultyGuidance}**
${bloomGuidance}
${cleanInstructions ? `\n**Additional Instructions from Teacher:**\n${cleanInstructions}\n` : ''}
**Requirements:**
1. Distribute difficulty levels across questions according to the distribution specified above
2. Each question must be clear, unambiguous, and grade-appropriate for ${assignment.className}
3. For Multiple Choice Questions, provide exactly 4 options labeled (a), (b), (c), (d)
4. Generate a complete answer key with concise answers
5. Each section must have a clear instruction line
6. Questions should be creative, varied, and test different aspects of the topic

**IMPORTANT: Respond with ONLY a valid JSON object (no markdown, no code fences) matching this exact structure:**

{
  "timeAllowed": "${Math.ceil(assignment.totalMarks * 1.5)} minutes",
  "maxMarks": ${assignment.totalMarks},
  "generalInstructions": "All questions are compulsory unless stated otherwise.",
  "sections": [
    {
      "title": "Section A",
      "sectionType": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries 2 marks.",
      "questions": [
        {
          "number": 1,
          "text": "What is the process of electroplating?",
          "difficulty": "Easy",
          "marks": 2,
          "options": []
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionNumber": 1,
      "answer": "Electroplating is the process of depositing a thin layer of metal..."
    }
  ]
}

Ensure question numbers are sequential across all sections. The difficulty field must be exactly one of: "Easy", "Moderate", or "Challenging".`;

  return prompt;
}
