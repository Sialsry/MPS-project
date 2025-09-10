import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 추가
  app.enableCors({
    origin: [
      'https://admin.klk1.store',  // 프론트엔드 개발 서버
    ],
    credentials: true,  // 쿠키/인증 헤더 허용
  });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
