import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { CourseModule } from './course/course.module';
import { CourseController } from './course/course.controller';
import { TestModule } from './test/test.module';
import { TestController } from './test/test.controller';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { QuestionController } from './question/question.controller';
import { SubmissionModule } from './submission/submission.module';
import { GeminiModule } from './gemini/gemini.module';
import { Judge0Module } from './judge0/judge0.module';
import { AdminProvider } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CourseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TestModule,
    UserModule,
    QuestionModule,
    SubmissionModule,
    GeminiModule,
    Judge0Module,
    AdminModule,
  ],
  controllers: [UserController, CourseController, TestController, QuestionController, AdminController],
  providers: [],
})
export class AppModule {}
