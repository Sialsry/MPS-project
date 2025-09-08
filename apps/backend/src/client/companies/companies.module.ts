import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository';
import { OdcloudClient } from './odcloud.client';
import { UtilsModule } from '../common/utils/utils.module';
@Module({
  imports: [UtilsModule],
  controllers: [CompaniesController],
  providers: [CompaniesRepository, CompaniesService, OdcloudClient],
  exports: [CompaniesRepository, CompaniesService],
})
export class CompanieModule {}
