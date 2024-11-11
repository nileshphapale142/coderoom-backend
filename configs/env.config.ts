import dotenv from 'dotenv';

dotenv.config();

export const env = {
  JUDGE0: {
    KEY: process.env.JUDGE0_API_KEY || '',
    HOST: process.env.JUDGE0_API_HOST || ''
  },
  
  ADMIN: {
    USERANME: process.env.ADMIN_USERNAME  || '',
    PASSWORD: process.env.ADMIN_PASSWORD || ''
  }
};