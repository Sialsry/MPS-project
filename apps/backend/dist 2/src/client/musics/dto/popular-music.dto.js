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
exports.PopularMusicDto = exports.RewardInfoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RewardInfoDto {
    reward_one;
    reward_total;
    reward_remain;
    total_count;
    remain_count;
}
exports.RewardInfoDto = RewardInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, nullable: true, description: '1회 리워드' }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "reward_one", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, nullable: true, description: '총 리워드 (total_count * reward_one)' }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "reward_total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, nullable: true, description: '남은 리워드 (remain_count * reward_one)' }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "reward_remain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Number, nullable: true, description: '이번 달 총 리워드 횟수' }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "total_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Number, nullable: true, description: '이번 달 남은 리워드 횟수' }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "remain_count", void 0);
class PopularMusicDto {
    id;
    title;
    artist;
    cover_image_url;
    format;
    has_lyrics;
    grade_required;
    can_use;
    reward;
    popularity;
    created_at;
    category;
}
exports.PopularMusicDto = PopularMusicDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PopularMusicDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PopularMusicDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PopularMusicDto.prototype, "artist", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, nullable: true }),
    __metadata("design:type", Object)
], PopularMusicDto.prototype, "cover_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FULL', 'INSTRUMENTAL'] }),
    __metadata("design:type", String)
], PopularMusicDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], PopularMusicDto.prototype, "has_lyrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [0, 1, 2], description: '0=free, 1=standard, 2=business' }),
    __metadata("design:type", Number)
], PopularMusicDto.prototype, "grade_required", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], PopularMusicDto.prototype, "can_use", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: RewardInfoDto }),
    __metadata("design:type", RewardInfoDto)
], PopularMusicDto.prototype, "reward", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '최근 30일 유효 재생수' }),
    __metadata("design:type", Number)
], PopularMusicDto.prototype, "popularity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '업로드일' }),
    __metadata("design:type", Date)
], PopularMusicDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, nullable: true }),
    __metadata("design:type", Object)
], PopularMusicDto.prototype, "category", void 0);
//# sourceMappingURL=popular-music.dto.js.map