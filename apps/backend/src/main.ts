// src/main.ts
import cookieParser from 'cookie-parser'; // esModuleInterop 켠 경우
// import cookieParser = require('cookie-parser'); // 끄면 이 형태
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); 

  app.enableCors({
    origin: ['http://localhost:3000'], 
    credentials: true,                 
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
