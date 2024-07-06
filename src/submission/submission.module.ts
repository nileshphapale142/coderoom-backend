import { Module } from '@nestjs/common';
import { SubmissionController } from './submission.controller';
import { SubmissionProvider } from './submission.service';

@Module({
  controllers: [SubmissionController],
  providers: [SubmissionProvider]
})
export class SubmissionModule {}
