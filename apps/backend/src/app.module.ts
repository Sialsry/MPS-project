// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import biznoConfig from '../bizno.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/backend/.env'),        // ts-node/dev
        join(__dirname, '../../.env'),                   // dist/apps/backend/.env (빌드 실행)
        '.env',                                          // 루트 .env가 있을 수도
      ],
      load: [biznoConfig],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AdminModule,
    ClientModule,
    MeModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
