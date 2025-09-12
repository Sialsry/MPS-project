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
var ApiKeyUtil_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyUtil = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
let ApiKeyUtil = class ApiKeyUtil {
    static { ApiKeyUtil_1 = this; }
    config;
    constructor(config) {
        this.config = config;
    }
    static KEY_RE = /^(?<prefix>sk_(?:live|test))_v(?<ver>\d+)_(?<kid>[A-Za-z0-9_-]{8,})_(?<secret>[A-Za-z0-9_-]{32,})$/;
    generate(mode = 'live') {
        const prefix = (this.config.get('API_KEY_PREFIX') ?? `sk_${mode}`);
        const version = Number(this.config.get('API_KEY_VERSION') ?? 1);
        const kid = (0, node_crypto_1.randomBytes)(6).toString('base64url');
        const secret = (0, node_crypto_1.randomBytes)(32).toString('base64url');
        const key = `${prefix}_v${version}_${kid}_${secret}`;
        const last4 = secret.slice(-4);
        const hash = this.hash(key);
        return { key, last4, kid, version, hash };
    }
    hash(apiKeyPlain) {
        const pepper = this.requirePepper();
        const salt = (0, node_crypto_1.randomBytes)(16).toString('hex');
        const mac = (0, node_crypto_1.createHmac)('sha256', pepper).update(`${apiKeyPlain}:${salt}`).digest('hex');
        return `${salt}:${mac}`;
    }
    verify(apiKeyPlain, storedHash) {
        const pepper = this.requirePepper();
        const [salt, mac] = storedHash.split(':');
        if (!salt || !mac)
            return false;
        const calc = (0, node_crypto_1.createHmac)('sha256', pepper).update(`${apiKeyPlain}:${salt}`).digest('hex');
        try {
            return (0, node_crypto_1.timingSafeEqual)(Buffer.from(mac, 'hex'), Buffer.from(calc, 'hex'));
        }
        catch {
            return false;
        }
    }
    getKid(apiKeyPlain) {
        const m = apiKeyPlain.match(ApiKeyUtil_1.KEY_RE);
        return m?.groups?.kid ?? null;
    }
    mask(last4) {
        return last4 ? `••••-••••-••••-${last4}` : '****-****-****-****';
    }
    requirePepper() {
        const pepper = this.config.get('API_KEY_PEPPER');
        if (!pepper)
            throw new Error('API_KEY_PEPPER is not configured');
        return pepper;
    }
};
exports.ApiKeyUtil = ApiKeyUtil;
exports.ApiKeyUtil = ApiKeyUtil = ApiKeyUtil_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiKeyUtil);
//# sourceMappingURL=api-key.util.js.map