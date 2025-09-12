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
exports.MusicRewardsTrendResponseDto = exports.MusicRewardsTrendSeriesDto = exports.MusicRewardsTrendQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MusicRewardsTrendQueryDto {
    granularity;
    type;
    segment;
    yearMonth;
    months;
}
exports.MusicRewardsTrendQueryDto = MusicRewardsTrendQueryDto;
__decorate([
    (0, class_validator_1.IsIn)(['daily', 'monthly']),
    __metadata("design:type", String)
], MusicRewardsTrendQueryDto.prototype, "granularity", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['music', 'lyrics']),
    __metadata("design:type", String)
], MusicRewardsTrendQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['category', 'all']),
    __metadata("design:type", String)
], MusicRewardsTrendQueryDto.prototype, "segment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-(0[1-9]|1[0-2])$/),
    __metadata("design:type", String)
], MusicRewardsTrendQueryDto.prototype, "yearMonth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(24),
    __metadata("design:type", Number)
], MusicRewardsTrendQueryDto.prototype, "months", void 0);
class MusicRewardsTrendSeriesDto {
    label;
    data;
}
exports.MusicRewardsTrendSeriesDto = MusicRewardsTrendSeriesDto;
class MusicRewardsTrendResponseDto {
    labels;
    series;
    meta;
}
exports.MusicRewardsTrendResponseDto = MusicRewardsTrendResponseDto;
//# sourceMappingURL=music-rewards-trend.dto.js.map