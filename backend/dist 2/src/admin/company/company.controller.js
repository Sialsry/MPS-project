"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const company_service_1 = require("./company.service");
const create_company_dto_1 = require("./dto/create-company.dto");
const update_company_dto_1 = require("./dto/update-company.dto");
const rewards_summary_query_dto_1 = require("./dto/rewards-summary.query.dto");
const rewards_detail_query_dto_1 = require("./dto/rewards-detail.query.dto");
const company_stats_dto_1 = require("./dto/company-stats.dto");
const renewal_stats_dto_1 = require("./dto/renewal-stats.dto");
const hourly_plays_dto_1 = require("./dto/hourly-plays.dto");
const tier_distribution_dto_1 = require("./dto/tier-distribution.dto");
const revenue_calendar_dto_1 = require("./dto/revenue-calendar.dto");
const revenue_trends_dto_1 = require("./dto/revenue-trends.dto");
const revenue_companies_dto_1 = require("./dto/revenue-companies.dto");
let CompanyController = class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    create(createCompanyDto) {
        return this.companyService.create(createCompanyDto);
    }
    findAll() {
        return this.companyService.findAll();
    }
    async getRewardsSummary(query) {
        return this.companyService.getRewardsSummary(query);
    }
    async getCompanyTotal(query) {
        return this.companyService.getTotalCount(query);
    }
    async getRenewalStats(query) {
        return this.companyService.getRenewalStats(query);
    }
    async getHourlyPlays(query) {
        return this.companyService.getHourlyValidPlays(query);
    }
    async getTierDistribution(query) {
        return this.companyService.getTierDistribution(query);
    }
    async getRevenueCalendar(query) {
        return this.companyService.getRevenueCalendar(query);
    }
    async getRevenueTrends(query) {
        return this.companyService.getRevenueTrends(query);
    }
    async getRevenueCompanies(query) {
        return this.companyService.getRevenueCompanies(query);
    }
    async getRewardsDetail(id, query) {
        return this.companyService.getRewardsDetail(id, query.yearMonth);
    }
    findOne(id) {
        return this.companyService.findOne(+id);
    }
    update(id, updateCompanyDto) {
        return this.companyService.update(+id, updateCompanyDto);
    }
    remove(id) {
        return this.companyService.remove(+id);
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_company_dto_1.CreateCompanyDto]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('rewards/summary'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rewards_summary_query_dto_1.RewardsSummaryQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRewardsSummary", null);
__decorate([
    (0, common_1.Get)('stats/total'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_stats_dto_1.CompanyTotalStatsQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyTotal", null);
__decorate([
    (0, common_1.Get)('stats/renewal'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [renewal_stats_dto_1.RenewalStatsQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRenewalStats", null);
__decorate([
    (0, common_1.Get)('stats/hourly-plays'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hourly_plays_dto_1.HourlyPlaysQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getHourlyPlays", null);
__decorate([
    (0, common_1.Get)('stats/tier-distribution'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tier_distribution_dto_1.TierDistributionQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getTierDistribution", null);
__decorate([
    (0, common_1.Get)('revenue/calendar'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revenue_calendar_dto_1.RevenueCalendarQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRevenueCalendar", null);
__decorate([
    (0, common_1.Get)('revenue/trends'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revenue_trends_dto_1.RevenueTrendsQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRevenueTrends", null);
__decorate([
    (0, common_1.Get)('revenue/companies'),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revenue_companies_dto_1.RevenueCompaniesQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRevenueCompanies", null);
__decorate([
    (0, common_1.Get)(':id/rewards/detail'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, rewards_detail_query_dto_1.RewardsDetailQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getRewardsDetail", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_company_dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "remove", null);
exports.CompanyController = CompanyController = __decorate([
    (0, common_1.Controller)('/admin/companies'),
    __metadata("design:paramtypes", [company_service_1.CompanyService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map