"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanieModule = void 0;
const common_1 = require("@nestjs/common");
const companies_service_1 = require("./companies.service");
const companies_controller_1 = require("./companies.controller");
const companies_repository_1 = require("./companies.repository");
const odcloud_client_1 = require("./odcloud.client");
const blockchain_service_1 = require("./blockchain.service");
const utils_module_1 = require("../common/utils/utils.module");
let CompanieModule = class CompanieModule {
};
exports.CompanieModule = CompanieModule;
exports.CompanieModule = CompanieModule = __decorate([
    (0, common_1.Module)({
        imports: [utils_module_1.UtilsModule],
        controllers: [companies_controller_1.CompaniesController],
        providers: [companies_repository_1.CompaniesRepository, companies_service_1.CompaniesService, odcloud_client_1.OdcloudClient, blockchain_service_1.BlockchainService],
        exports: [companies_repository_1.CompaniesRepository, companies_service_1.CompaniesService, blockchain_service_1.BlockchainService],
    })
], CompanieModule);
//# sourceMappingURL=companies.module.js.map