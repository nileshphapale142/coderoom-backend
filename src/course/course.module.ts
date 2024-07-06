import { Module } from '@nestjs/common';
import { CourseProvider } from './course.service';
import { CourseController } from './course.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [CourseController],
  providers: [CourseProvider],
  exports: [CourseProvider],
})
export class CourseModule {}