import dotenv from 'dotenv';

dotenv.config();

export const env = {
  GEMINI: {
    KEY: process.env.GEMINI_API_KEY || '',
    PRO_MODEL: process.env.GEMINI_PRO_MODEL || 'gemini-pro',
    FLASH_MODEL: process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash',
  },
};