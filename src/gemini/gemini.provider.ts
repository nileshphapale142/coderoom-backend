import {
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { Provider } from '@nestjs/common';

import { env } from '../../configs/env.config';
import { GENERATION_CONFIG, SAFETY_SETTINGS } from '../../configs/gemini.config';
import { GEMINI_PRO_MODEL, GEMINI_FLASH_MODEL } from './constants';


export const GeminiFlashModelProvider: Provider<GenerativeModel> = {
    provide: GEMINI_FLASH_MODEL,
    useFactory: () => {
        const genAI = new GoogleGenerativeAI(env.GEMINI.KEY)
        return genAI.getGenerativeModel({
            model: env.GEMINI.FLASH_MODEL,
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS
        })
    }
}


export const GeminiProModelProvider: Provider<GenerativeModel> = {
  provide: GEMINI_PRO_MODEL,
  useFactory: () => {
    const genAI = new GoogleGenerativeAI(env.GEMINI.KEY);
    return genAI.getGenerativeModel({
      model: env.GEMINI.PRO_MODEL,
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  },
};