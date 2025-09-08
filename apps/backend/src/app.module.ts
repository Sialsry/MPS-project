import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { MusicModule } from './music/music.module';
import { RecordModule } from './record/record.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [DbModule, MusicModule, RecordModule, SchedulerModule, TestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
