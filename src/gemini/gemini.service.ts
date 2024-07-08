import { Inject, Injectable } from '@nestjs/common';
import {
  GenerativeModel,
} from '@google/generative-ai';
import { GEMINI_PRO_MODEL } from './constants';
import { createContent } from './helper';

@Injectable()
export class GeminiService {
  constructor(
    @Inject(GEMINI_PRO_MODEL)
    private readonly proModel: GenerativeModel,
  ) {}

  async generateText(prompt: string) {
    const contents = createContent(prompt);

    const { totalTokens } = await this.proModel.countTokens({
      contents,
    });
    const result = await this.proModel.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    return { text };
  }
}
