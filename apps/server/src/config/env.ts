import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
} as const;

/** Validate that all required env vars are present */
export function validateEnv(): void {
  if (!env.GROQ_API_KEY) {
    console.warn('[WARN] GROQ_API_KEY is not set. AI generation will fail.');
  }
}
