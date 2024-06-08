import { Module } from '@nestjs/common';
import { CourseProvider } from './course.service';
import { CourseController } from './course.controller';

@Module({
  controllers: [CourseController],
  providers: [CourseProvider],
  exports: [CourseProvider],
})
export class CourseModule {}
