import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import express from 'express';              // esModuleInterop=true일 때
// import * as express from 'express';      // esModuleInterop=false일 때
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // ★ 업로드 루트 보장 + 정적 서빙
  const UPLOAD_ROOT = join(process.cwd(), 'uploads');
  if (!existsSync(UPLOAD_ROOT)) mkdirSync(UPLOAD_ROOT, { recursive: true });
  app.use('/uploads', express.static(UPLOAD_ROOT));

  // ★ CORS: 프론트(3000)에서 쿠키 포함 요청 허용 + PATCH 포함
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // 디버그 로그(선택)
  app.use((req: any, _res, next) => {
    if (req.originalUrl?.startsWith('/me')) {
      console.log('[REQ /me]', {
        url: req.originalUrl,
        hasAuthHeader: Boolean(req.headers.authorization),
        hasCookie_mps_at: Boolean(req.cookies?.mps_at),
      });
    }
    next();
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
