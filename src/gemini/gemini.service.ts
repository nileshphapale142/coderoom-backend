import { Inject, Injectable } from '@nestjs/common';
import { GenerativeModel } from '@google/generative-ai';
import { GEMINI_FLASH_MODEL, GEMINI_PRO_MODEL } from './constants';
import { createContent } from './helper';

@Injectable()
export class GeminiService {
  constructor(
    @Inject(GEMINI_PRO_MODEL)
    private readonly proModel: GenerativeModel,

    @Inject(GEMINI_FLASH_MODEL)
    private readonly flashModel: GenerativeModel,
  ) {}

  async generateText(prompt: string) {
    const contents = createContent(prompt);

    const { totalTokens } = await this.flashModel.countTokens({
      contents,
    });
    const result = await this.flashModel.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    return { text };
  }
}
