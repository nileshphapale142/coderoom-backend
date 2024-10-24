import dotenv from 'dotenv';

dotenv.config();

export const env = {
  GEMINI: {
    KEY: process.env.GEMINI_API_KEY || '',
    PRO_MODEL: process.env.GEMINI_PRO_MODEL || 'gemini-pro',
    FLASH_MODEL: process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash',
  },
  JUDGE0: {
    // KEY: process.env.X_RAPIDAPI_KEY || '',
    // HOST: process.env.X_RAPIDAPI_HOST || ''
    
    KEY: process.env.SULU_API_KEY || '',
    HOST: process.env.SULU_API_HOST || ''
  }
};