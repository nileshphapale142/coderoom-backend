import { Module } from '@nestjs/common';
import { QuestionProvider } from './question.service';
import { QuestionController } from './question.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  // imports: [UserModule],
  providers: [QuestionProvider],
  controllers: [QuestionController],
  exports: [QuestionProvider]
})
export class QuestionModule {}
