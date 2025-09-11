"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensModule = void 0;
const common_1 = require("@nestjs/common");
const tokens_controller_1 = require("./tokens.controller");
const tokens_service_1 = require("./tokens.service");
const web3_service_1 = require("./web3.service");
const tokens_queries_1 = require("./queries/tokens.queries");
let TokensModule = class TokensModule {
};
exports.TokensModule = TokensModule;
exports.TokensModule = TokensModule = __decorate([
    (0, common_1.Module)({
        controllers: [tokens_controller_1.TokensController],
        providers: [tokens_service_1.TokensService, web3_service_1.Web3Service, tokens_queries_1.TokensQueries],
        exports: [tokens_service_1.TokensService]
    })
], TokensModule);
//# sourceMappingURL=tokens.module.js.map