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
exports.OdcloudClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let OdcloudClient = class OdcloudClient {
    config;
    constructor(config) {
        this.config = config;
    }
    qs() {
        const p = new URLSearchParams({
            serviceKey: this.config.get('odcloud.keyEnc'),
            returnType: this.config.get('odcloud.returnType') ?? 'JSON',
        });
        return `?${p.toString()}`;
    }
    async status(bNo) {
        const base = this.config.get('odcloud.baseUrl');
        const res = await fetch(`${base}/nts-businessman/v1/status${this.qs()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({ b_no: [bNo] }),
        });
        if (!res.ok)
            throw new common_1.HttpException('ODcloud status error', res.status);
        return res.json();
    }
};
exports.OdcloudClient = OdcloudClient;
exports.OdcloudClient = OdcloudClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OdcloudClient);
//# sourceMappingURL=odcloud.client.js.map