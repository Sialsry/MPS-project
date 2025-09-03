import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeGateway } from './me.gateway';

@Module({
  providers: [MeGateway, MeService],
})
export class MeModule {}
