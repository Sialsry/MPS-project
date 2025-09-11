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
exports.MeRewardsResponseDto = exports.MeRewardsTotalsDto = exports.MeRewardItemDto = exports.MeRewardDailyDto = exports.GetMeRewardsQueryDto = exports.REWARD_CODE_EARNING = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
exports.REWARD_CODE_EARNING = '1';
class GetMeRewardsQueryDto {
    days = 7;
    musicId;
}
exports.GetMeRewardsQueryDto = GetMeRewardsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '최근 N일 집계(1~60)', default: 7, minimum: 1, maximum: 60 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], GetMeRewardsQueryDto.prototype, "days", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '특정 음원만 조회할 때 ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMeRewardsQueryDto.prototype, "musicId", void 0);
class MeRewardDailyDto {
    date;
    amount;
}
exports.MeRewardDailyDto = MeRewardDailyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-09-01' }),
    __metadata("design:type", String)
], MeRewardDailyDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardDailyDto.prototype, "amount", void 0);
class MeRewardItemDto {
    musicId;
    title = null;
    coverImageUrl = null;
    playEndpoint;
    lyricsEndpoint;
    startDate = null;
    monthBudget;
    monthSpent;
    monthRemaining;
    rewardPerPlay = null;
    remainingByPlanCount = null;
    remainingByPlanAmount = null;
    lifetimeExtracted;
    lastUsedAt = null;
    daily;
}
exports.MeRewardItemDto = MeRewardItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardItemDto.prototype, "musicId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '미친 것 같아' }),
    __metadata("design:type", Object)
], MeRewardItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://...' }),
    __metadata("design:type", Object)
], MeRewardItemDto.prototype, "coverImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/api/music/3/play' }),
    __metadata("design:type", String)
], MeRewardItemDto.prototype, "playEndpoint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/api/lyric/3/download' }),
    __metadata("design:type", String)
], MeRewardItemDto.prototype, "lyricsEndpoint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-08-12T10:11:22Z', description: '사용 시작일(첫 재생)' }),
    __metadata("design:type", Object)
], MeRewardItemDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardItemDto.prototype, "monthBudget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 180.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardItemDto.prototype, "monthSpent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2320.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardItemDto.prototype, "monthRemaining", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 25.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], MeRewardItemDto.prototype, "rewardPerPlay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 91 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], MeRewardItemDto.prototype, "remainingByPlanCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2275.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], MeRewardItemDto.prototype, "remainingByPlanAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5320.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardItemDto.prototype, "lifetimeExtracted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-09-07T03:11:22Z' }),
    __metadata("design:type", Object)
], MeRewardItemDto.prototype, "lastUsedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MeRewardDailyDto] }),
    (0, class_transformer_1.Type)(() => MeRewardDailyDto),
    __metadata("design:type", Array)
], MeRewardItemDto.prototype, "daily", void 0);
class MeRewardsTotalsDto {
    monthBudget;
    monthSpent;
    monthRemaining;
    lifetimeExtracted;
}
exports.MeRewardsTotalsDto = MeRewardsTotalsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6000.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardsTotalsDto.prototype, "monthBudget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 540.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardsTotalsDto.prototype, "monthSpent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5460.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardsTotalsDto.prototype, "monthRemaining", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12000.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardsTotalsDto.prototype, "lifetimeExtracted", void 0);
class MeRewardsResponseDto {
    month;
    days;
    items;
    totals;
}
exports.MeRewardsResponseDto = MeRewardsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-09' }),
    __metadata("design:type", String)
], MeRewardsResponseDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MeRewardsResponseDto.prototype, "days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MeRewardItemDto] }),
    (0, class_transformer_1.Type)(() => MeRewardItemDto),
    __metadata("design:type", Array)
], MeRewardsResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: MeRewardsTotalsDto }),
    (0, class_transformer_1.Type)(() => MeRewardsTotalsDto),
    __metadata("design:type", MeRewardsTotalsDto)
], MeRewardsResponseDto.prototype, "totals", void 0);
//# sourceMappingURL=me-rewards.dto.js.map