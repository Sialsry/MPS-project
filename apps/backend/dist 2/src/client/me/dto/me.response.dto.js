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
exports.MeResponseDto = exports.UsingItemDto = exports.UsingSummaryDto = exports.ApiKeyPreviewDto = exports.SubscriptionDto = exports.CompanyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CompanyDto {
    id;
    name;
    grade;
    profile_image_url;
    smart_account_address;
    total_rewards_earned;
    total_rewards_used;
    reward_balance;
}
exports.CompanyDto = CompanyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CompanyDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CompanyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Free', 'Standard', 'Business'] }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CompanyDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], CompanyDto.prototype, "profile_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], CompanyDto.prototype, "smart_account_address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CompanyDto.prototype, "total_rewards_earned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CompanyDto.prototype, "total_rewards_used", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CompanyDto.prototype, "reward_balance", void 0);
class SubscriptionDto {
    plan;
    status;
    start_date;
    end_date;
    next_billing_at;
    remaining_days;
}
exports.SubscriptionDto = SubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['free', 'standard', 'business'] }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['active', 'none'] }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], SubscriptionDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], SubscriptionDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], SubscriptionDto.prototype, "next_billing_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], SubscriptionDto.prototype, "remaining_days", void 0);
class ApiKeyPreviewDto {
    last4;
}
exports.ApiKeyPreviewDto = ApiKeyPreviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], ApiKeyPreviewDto.prototype, "last4", void 0);
class UsingSummaryDto {
    using_count;
}
exports.UsingSummaryDto = UsingSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UsingSummaryDto.prototype, "using_count", void 0);
class UsingItemDto {
    id;
    title;
    artist;
    cover;
    lastUsedAt;
    leadersEarned;
}
exports.UsingItemDto = UsingItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UsingItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UsingItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UsingItemDto.prototype, "artist", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UsingItemDto.prototype, "cover", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UsingItemDto.prototype, "lastUsedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UsingItemDto.prototype, "leadersEarned", void 0);
class MeResponseDto {
    company;
    subscription;
    api_key;
    using_summary;
    using_list;
}
exports.MeResponseDto = MeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: CompanyDto, nullable: true }),
    (0, class_transformer_1.Type)(() => CompanyDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], MeResponseDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SubscriptionDto }),
    (0, class_transformer_1.Type)(() => SubscriptionDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", SubscriptionDto)
], MeResponseDto.prototype, "subscription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ApiKeyPreviewDto }),
    (0, class_transformer_1.Type)(() => ApiKeyPreviewDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", ApiKeyPreviewDto)
], MeResponseDto.prototype, "api_key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UsingSummaryDto }),
    (0, class_transformer_1.Type)(() => UsingSummaryDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", UsingSummaryDto)
], MeResponseDto.prototype, "using_summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [UsingItemDto] }),
    (0, class_transformer_1.Type)(() => UsingItemDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], MeResponseDto.prototype, "using_list", void 0);
//# sourceMappingURL=me.response.dto.js.map