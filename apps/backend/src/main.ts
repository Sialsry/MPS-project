import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 (개발 환경에서는 모든 origin 허용)
  app.enableCors({
    origin: true,  // 개발 환경에서는 모든 origin 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'User-Agent'],
    credentials: true,
  });

  // 전역 Validation Pipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 전역 프리픽스 설정
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/']
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3001}`);
}

void bootstrap();
