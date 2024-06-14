import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { CourseModule } from './course/course.module';
import { CourseController } from './course/course.controller';
import { TestModule } from './test/test.module';
import { TestController } from './test/test.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CourseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TestModule,
  ],
  controllers: [UserController, CourseController, TestController],
  providers: [],
})
export class AppModule {}
