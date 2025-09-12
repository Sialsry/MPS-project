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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const system_service_1 = require("./system.service");
const system_dto_1 = require("./dto/system.dto");
let SystemController = class SystemController {
    systemService;
    constructor(systemService) {
        this.systemService = systemService;
    }
    async getApiStats(query) {
        return this.systemService.getApiStats(query);
    }
    async getApiChart(query) {
        return this.systemService.getApiChart(query);
    }
    async getApiKeys(query) {
        return this.systemService.getApiKeys(query);
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('api/stats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_dto_1.SystemStatsDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getApiStats", null);
__decorate([
    (0, common_1.Get)('api/chart'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_dto_1.SystemChartDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getApiChart", null);
__decorate([
    (0, common_1.Get)('api/keys'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_dto_1.SystemKeysDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getApiKeys", null);
exports.SystemController = SystemController = __decorate([
    (0, common_1.Controller)('admin/system'),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
//# sourceMappingURL=system.controller.js.map