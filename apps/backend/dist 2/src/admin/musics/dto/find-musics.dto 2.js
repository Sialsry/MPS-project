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
exports.FindMusicsDto = exports.SortOrder = exports.SortField = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SortField;
(function (SortField) {
    SortField["TITLE"] = "title";
    SortField["ARTIST"] = "artist";
    SortField["GENRE"] = "genre";
    SortField["MUSIC_TYPE"] = "musicType";
    SortField["VALID_PLAYS"] = "validPlays";
    SortField["VALID_RATE"] = "validRate";
    SortField["REWARD"] = "reward";
    SortField["CREATED_AT"] = "createdAt";
    SortField["PLAYS"] = "plays";
})(SortField || (exports.SortField = SortField = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
class FindMusicsDto {
    page = 1;
    limit = 10;
    search;
    category;
    musicType;
    idSortFilter;
    releaseDateSortFilter;
    rewardLimitFilter;
    dateFilter;
    sortBy = SortField.CREATED_AT;
    sortOrder = SortOrder.DESC;
    includeStats = false;
    statsType;
    startDate;
    endDate;
}
exports.FindMusicsDto = FindMusicsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? Number(value) : 1),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FindMusicsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? Number(value) : 10),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FindMusicsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "musicType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "idSortFilter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "releaseDateSortFilter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "rewardLimitFilter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "dateFilter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortField),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FindMusicsDto.prototype, "includeStats", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "statsType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FindMusicsDto.prototype, "endDate", void 0);
//# sourceMappingURL=find-musics.dto.js.map