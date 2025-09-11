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
exports.ListMusicQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ListMusicQueryDto {
    q;
    mode = 'keyword';
    explain;
    min_similarity;
    category_id;
    mood;
    reward_max;
    remaining_reward_max;
    status;
    sort = 'relevance';
    limit = 20;
    cursor;
}
exports.ListMusicQueryDto = ListMusicQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['keyword', 'semantic'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['keyword', 'semantic']),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBooleanString)(),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "explain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    (0, class_transformer_1.Transform)(({ value }) => value !== undefined ? Number(value) : undefined),
    __metadata("design:type", Number)
], ListMusicQueryDto.prototype, "min_similarity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "category_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "mood", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value !== undefined ? Number(value) : undefined),
    __metadata("design:type", Number)
], ListMusicQueryDto.prototype, "reward_max", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value !== undefined ? Number(value) : undefined),
    __metadata("design:type", Number)
], ListMusicQueryDto.prototype, "remaining_reward_max", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['active', 'inactive', 'invalid'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['active', 'inactive', 'invalid']),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['relevance', 'newest', 'most_played', 'remaining_reward'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['relevance', 'newest', 'most_played', 'remaining_reward']),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_transformer_1.Transform)(({ value }) => value !== undefined ? Number(value) : 20),
    __metadata("design:type", Number)
], ListMusicQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListMusicQueryDto.prototype, "cursor", void 0);
//# sourceMappingURL=list-music.query.dto.js.map