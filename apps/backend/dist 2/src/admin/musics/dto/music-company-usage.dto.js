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
exports.MusicCompanyUsageResponseDto = exports.MusicCompanyUsageItemDto = exports.MusicCompanyUsageQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MusicCompanyUsageQueryDto {
    yearMonth;
    limit;
    page;
    search;
}
exports.MusicCompanyUsageQueryDto = MusicCompanyUsageQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-(0[1-9]|1[0-2])$/),
    __metadata("design:type", String)
], MusicCompanyUsageQueryDto.prototype, "yearMonth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], MusicCompanyUsageQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MusicCompanyUsageQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    __metadata("design:type", String)
], MusicCompanyUsageQueryDto.prototype, "search", void 0);
class MusicCompanyUsageItemDto {
    rank;
    companyId;
    companyName;
    tier;
    monthlyEarned;
    monthlyPlays;
}
exports.MusicCompanyUsageItemDto = MusicCompanyUsageItemDto;
class MusicCompanyUsageResponseDto {
    yearMonth;
    total;
    page;
    limit;
    items;
}
exports.MusicCompanyUsageResponseDto = MusicCompanyUsageResponseDto;
//# sourceMappingURL=music-company-usage.dto.js.map