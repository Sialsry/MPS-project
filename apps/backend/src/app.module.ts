import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [DbModule, MusicModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
