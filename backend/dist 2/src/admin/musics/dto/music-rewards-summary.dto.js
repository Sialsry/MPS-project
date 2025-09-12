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
exports.MusicRewardsSummaryResponseDto = exports.MusicRewardsSummaryItemDto = exports.MusicRewardsSummaryQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MusicRewardsSummaryQueryDto {
    yearMonth;
    search;
    categoryId;
    musicType;
    grade;
    page;
    limit;
    sortBy;
    order;
}
exports.MusicRewardsSummaryQueryDto = MusicRewardsSummaryQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-(0[1-9]|1[0-2])$/),
    __metadata("design:type", String)
], MusicRewardsSummaryQueryDto.prototype, "yearMonth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? String(value).trim() : undefined),
    __metadata("design:type", String)
], MusicRewardsSummaryQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value && String(value) !== 'all' ? Number(value) : undefined)),
    __metadata("design:type", Number)
], MusicRewardsSummaryQueryDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['inst', 'normal', 'all']),
    __metadata("design:type", String)
], MusicRewardsSummaryQueryDto.prototype, "musicType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['0', '1', '2', 'all']),
    __metadata("design:type", String)
], MusicRewardsSummaryQueryDto.prototype, "grade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MusicRewardsSummaryQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], MusicRewardsSummaryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['music_id', 'title', 'artist', 'category', 'grade', 'musicType', 'monthlyLimit', 'rewardPerPlay', 'usageRate', 'validPlays', 'earned', 'companiesUsing', 'lastUsedAt']),
    __metadata("design:type", String)
], MusicRewardsSummaryQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], MusicRewardsSummaryQueryDto.prototype, "order", void 0);
class MusicRewardsSummaryItemDto {
    musicId;
    title;
    artist;
    category;
    grade;
    validPlays;
    earned;
    companiesUsing;
    lastUsedAt;
    monthlyLimit;
    usageRate;
    rewardPerPlay;
}
exports.MusicRewardsSummaryItemDto = MusicRewardsSummaryItemDto;
class MusicRewardsSummaryResponseDto {
    yearMonth;
    total;
    page;
    limit;
    items;
}
exports.MusicRewardsSummaryResponseDto = MusicRewardsSummaryResponseDto;
//# sourceMappingURL=music-rewards-summary.dto.js.map