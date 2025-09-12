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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsSummaryQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const VALID_SORT_BY = [
    'company_id', 'name', 'grade', 'total_tokens', 'monthly_earned',
    'monthly_used', 'usage_rate', 'active_tracks',
];
class RewardsSummaryQueryDto {
    yearMonth;
    search;
    tier;
    page;
    limit;
    sortBy;
    order;
}
exports.RewardsSummaryQueryDto = RewardsSummaryQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'yearMonth는 YYYY-MM 형식이어야 합니다.' }),
    __metadata("design:type", String)
], RewardsSummaryQueryDto.prototype, "yearMonth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RewardsSummaryQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['free', 'standard', 'business', 'all']),
    __metadata("design:type", String)
], RewardsSummaryQueryDto.prototype, "tier", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value !== undefined ? parseInt(value, 10) : undefined)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RewardsSummaryQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value !== undefined ? parseInt(value, 10) : undefined)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], RewardsSummaryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(VALID_SORT_BY),
    __metadata("design:type", Object)
], RewardsSummaryQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], RewardsSummaryQueryDto.prototype, "order", void 0);
//# sourceMappingURL=rewards-summary.query.dto.js.map