import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface GeneratedPaper {
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: {
    title: string;
    sectionType: string;
    instruction: string;
    questions: {
      number: number;
      text: string;
      difficulty: 'Easy' | 'Moderate' | 'Challenging';
      marks: number;
      options?: string[];
    }[];
  }[];
  answerKey: {
    questionNumber: number;
    answer: string;
  }[];
}

let groqClient: Groq | null = null;

function getClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Generate a question paper using Groq's LLM.
 * Retries up to 3 times on JSON parse failure.
 */
export async function generateQuestionPaper(prompt: string): Promise<GeneratedPaper> {
  const client = getClient();
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`AI generation attempt ${attempt}/${MAX_RETRIES}`);

      const chatCompletion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert educational content creator. You generate well-structured, academically rigorous question papers. Always respond with valid JSON only, no markdown formatting or code fences.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from AI');
      }

      const parsed = JSON.parse(content) as GeneratedPaper;

      // Validate basic structure
      if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        throw new Error('Invalid response: missing sections');
      }

      for (const section of parsed.sections) {
        if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
          throw new Error(`Invalid response: section "${section.title}" has no questions`);
        }
        for (const q of section.questions) {
          if (!q.text || !q.difficulty || !q.marks) {
            throw new Error(`Invalid question at number ${q.number}`);
          }
          // Normalize difficulty
          const validDifficulties = ['Easy', 'Moderate', 'Challenging'];
          if (!validDifficulties.includes(q.difficulty)) {
            q.difficulty = 'Moderate';
          }
        }
      }

      if (!parsed.answerKey) {
        parsed.answerKey = [];
      }

      logger.info('AI generation successful');
      return parsed;
    } catch (error) {
      logger.error(`AI generation attempt ${attempt} failed:`, error);
      if (attempt === MAX_RETRIES) {
        throw new Error(`AI generation failed after ${MAX_RETRIES} attempts: ${(error as Error).message}`);
      }
      // Wait before retry
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }

  throw new Error('AI generation failed unexpectedly');
}
