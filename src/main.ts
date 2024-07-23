import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  dotenv.config()

  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true
  });
  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,
  }))
  
  
  await app.listen(5000);
}
bootstrap();
