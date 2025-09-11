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
exports.UseMusicResponseDto = exports.MusicDetailDto = exports.RewardInfoDto = void 0;
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
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "reward_one", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "reward_total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "reward_remain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "total_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], RewardInfoDto.prototype, "remain_count", void 0);
class MusicDetailDto {
    id;
    title;
    artist;
    cover_image_url;
    format;
    has_lyrics;
    lyrics_text;
    lyrics_file_path;
    grade_required;
    can_use;
    reward;
    popularity;
    created_at;
    category_id;
    category_name;
    duration_sec;
    price_per_play;
    is_using;
}
exports.MusicDetailDto = MusicDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MusicDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MusicDetailDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MusicDetailDto.prototype, "artist", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], MusicDetailDto.prototype, "cover_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FULL', 'INSTRUMENTAL'] }),
    __metadata("design:type", String)
], MusicDetailDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MusicDetailDto.prototype, "has_lyrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], MusicDetailDto.prototype, "lyrics_text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], MusicDetailDto.prototype, "lyrics_file_path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [0, 1, 2] }),
    __metadata("design:type", Number)
], MusicDetailDto.prototype, "grade_required", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MusicDetailDto.prototype, "can_use", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: RewardInfoDto }),
    __metadata("design:type", RewardInfoDto)
], MusicDetailDto.prototype, "reward", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MusicDetailDto.prototype, "popularity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MusicDetailDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], MusicDetailDto.prototype, "category_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], MusicDetailDto.prototype, "category_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], MusicDetailDto.prototype, "duration_sec", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], MusicDetailDto.prototype, "price_per_play", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MusicDetailDto.prototype, "is_using", void 0);
class UseMusicResponseDto {
    using_id;
    is_using;
}
exports.UseMusicResponseDto = UseMusicResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UseMusicResponseDto.prototype, "using_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UseMusicResponseDto.prototype, "is_using", void 0);
//# sourceMappingURL=music-detail.dto.js.map