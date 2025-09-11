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
exports.MePlaysResponseDto = exports.MePlayRowDto = exports.GetMePlaysQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GetMePlaysQueryDto {
    musicId;
    page = 1;
    limit = 20;
}
exports.GetMePlaysQueryDto = GetMePlaysQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '대상 음원 ID' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMePlaysQueryDto.prototype, "musicId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '페이지', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMePlaysQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '페이지 크기', default: 20, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetMePlaysQueryDto.prototype, "limit", void 0);
class MePlayRowDto {
    playId;
    playedAt;
    isValid;
    meta;
    rewardId;
    rewardCode;
    amount;
    status;
}
exports.MePlayRowDto = MePlayRowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10001 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MePlayRowDto.prototype, "playId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-09-08T12:34:56Z' }),
    __metadata("design:type", String)
], MePlayRowDto.prototype, "playedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], MePlayRowDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { ip: '1.2.3.4' }, description: '추가 메타' }),
    __metadata("design:type", Object)
], MePlayRowDto.prototype, "meta", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 333 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], MePlayRowDto.prototype, "rewardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1' }),
    __metadata("design:type", Object)
], MePlayRowDto.prototype, "rewardCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 25.0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], MePlayRowDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pending' }),
    __metadata("design:type", Object)
], MePlayRowDto.prototype, "status", void 0);
class MePlaysResponseDto {
    page;
    limit;
    total;
    items;
}
exports.MePlaysResponseDto = MePlaysResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MePlaysResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MePlaysResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], MePlaysResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MePlayRowDto] }),
    (0, class_transformer_1.Type)(() => MePlayRowDto),
    __metadata("design:type", Array)
], MePlaysResponseDto.prototype, "items", void 0);
//# sourceMappingURL=me-plays.dto.js.map