import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  dotenv.config()

  const app = await NestFactory.create(AppModule);
  
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,
  }))
  
  app.use(cookieParser())
  
  await app.listen(5000);
}
bootstrap();
