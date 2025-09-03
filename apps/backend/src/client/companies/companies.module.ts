import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository';
import { OdcloudClient } from './odcloud.client';
@Module({
  controllers: [CompaniesController],
  providers: [CompaniesRepository, CompaniesService, OdcloudClient],
  exports: [CompaniesRepository, CompaniesService],
})
export class CompanieModule {}
