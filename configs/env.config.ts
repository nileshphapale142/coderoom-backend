import dotenv from 'dotenv';

dotenv.config();

export const env = {
  GEMINI: {
    KEY: process.env.GEMINI_API_KEY || '',
    PRO_MODEL: process.env.GEMINI_PRO_MODEL || 'gemini-pro',
  },
};