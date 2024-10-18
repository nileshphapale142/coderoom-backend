import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  dotenv.config()

  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000', 'https://coderoom-3l5j.onrender.com'],
    credentials: true
  });
  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,
  }))
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
}
bootstrap();
