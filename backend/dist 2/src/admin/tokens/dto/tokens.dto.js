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
exports.TransactionDetailDto = exports.TransactionsDto = exports.BatchDetailDto = exports.DailyBatchesDto = exports.WalletInfoDto = exports.TokenInfoDto = void 0;
const class_validator_1 = require("class-validator");
class TokenInfoDto {
}
exports.TokenInfoDto = TokenInfoDto;
class WalletInfoDto {
}
exports.WalletInfoDto = WalletInfoDto;
class DailyBatchesDto {
    limit = '10';
    offset = '0';
}
exports.DailyBatchesDto = DailyBatchesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyBatchesDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyBatchesDto.prototype, "offset", void 0);
class BatchDetailDto {
    date;
}
exports.BatchDetailDto = BatchDetailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchDetailDto.prototype, "date", void 0);
class TransactionsDto {
    limit = '20';
    offset = '0';
}
exports.TransactionsDto = TransactionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionsDto.prototype, "offset", void 0);
class TransactionDetailDto {
    id;
}
exports.TransactionDetailDto = TransactionDetailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionDetailDto.prototype, "id", void 0);
//# sourceMappingURL=tokens.dto.js.map