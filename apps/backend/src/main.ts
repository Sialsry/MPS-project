import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 추가
  app.enableCors({
    origin: [
      'http://localhost:4001',  // 프론트엔드 개발 서버
      'https://mps-project-frontend-admin.vercel.app',  // 배포된 프론트엔드
    ],
    credentials: true,  // 쿠키/인증 헤더 허용
  });
  
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
