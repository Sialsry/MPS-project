import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './admin/auth/auth.module';
import { MusicsModule } from './admin/musics/musics.module';

@Module({
  imports: [DbModule, AuthModule, MusicsModule],
  controllers: [AppController],  
  providers: [AppService],    
})
export class AppModule {}