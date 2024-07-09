import { Global, Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiFlashModelProvider, GeminiProModelProvider } from './gemini.provider';

@Global()
@Module({
  providers: [GeminiService, GeminiProModelProvider, GeminiFlashModelProvider],
  exports: [GeminiService],
})
export class GeminiModule {}
