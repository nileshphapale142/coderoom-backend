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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CourseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TestModule,
    UserModule,
    QuestionModule,
  ],
  controllers: [UserController, CourseController, TestController, QuestionController],
  providers: [],
})
export class AppModule {}
