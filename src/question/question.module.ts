import { Module } from '@nestjs/common';
import { QuestionProvider } from './question.service';
import { QuestionController } from './question.controller';

@Module({
  providers: [QuestionProvider],
  controllers: [QuestionController],
  exports: [QuestionProvider]
})
export class QuestionModule {}
