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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensController = void 0;
const common_1 = require("@nestjs/common");
const tokens_service_1 = require("./tokens.service");
const tokens_dto_1 = require("./dto/tokens.dto");
let TokensController = class TokensController {
    tokensService;
    constructor(tokensService) {
        this.tokensService = tokensService;
    }
    async getTokenInfo() {
        return this.tokensService.getTokenInfo();
    }
    async getWalletInfo() {
        return this.tokensService.getWalletInfo();
    }
    async getDailyBatches(query) {
        return this.tokensService.getDailyBatches(query);
    }
    async getBatchDetail(date) {
        return this.tokensService.getBatchDetail({ date });
    }
    async getTransactions(query) {
        return this.tokensService.getTransactions(query);
    }
    async getTransactionDetail(id) {
        return this.tokensService.getTransactionDetail(id);
    }
};
exports.TokensController = TokensController;
__decorate([
    (0, common_1.Get)('info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokensController.prototype, "getTokenInfo", null);
__decorate([
    (0, common_1.Get)('wallet'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokensController.prototype, "getWalletInfo", null);
__decorate([
    (0, common_1.Get)('batches'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tokens_dto_1.DailyBatchesDto]),
    __metadata("design:returntype", Promise)
], TokensController.prototype, "getDailyBatches", null);
__decorate([
    (0, common_1.Get)('batches/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokensController.prototype, "getBatchDetail", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tokens_dto_1.TransactionsDto]),
    __metadata("design:returntype", Promise)
], TokensController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokensController.prototype, "getTransactionDetail", null);
exports.TokensController = TokensController = __decorate([
    (0, common_1.Controller)('admin/tokens'),
    __metadata("design:paramtypes", [tokens_service_1.TokensService])
], TokensController);
//# sourceMappingURL=tokens.controller.js.map