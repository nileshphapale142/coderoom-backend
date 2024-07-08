import { Global, Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiProModelProvider } from './gemini.provider';

@Global()
@Module({
  providers: [GeminiService, GeminiProModelProvider],
  exports: [GeminiService],
})
export class GeminiModule {}
