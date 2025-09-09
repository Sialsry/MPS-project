import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('env-test')
  testEnv() {
    return {
      adminId: this.configService.get('ADMIN_ID'),
      adminPw: this.configService.get('ADMIN_PW'),
      hasAdminId: !!this.configService.get('ADMIN_ID'),
      hasAdminPw: !!this.configService.get('ADMIN_PW')
    };
  }
}
