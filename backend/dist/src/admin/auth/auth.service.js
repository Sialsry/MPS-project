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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    jwtService;
    configService;
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const { adminId, adminPw } = loginDto;
        const Id = this.configService.get('ADMIN_ID');
        const Pw = this.configService.get('ADMIN_PW');
        if (adminId !== Id || adminPw !== Pw) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { adminId };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        return { accessToken, refreshToken, adminId };
    }
    async logout(authHeader) {
        if (!authHeader) {
            throw new common_1.UnauthorizedException('유효하지 않은 인증 헤더입니다.');
        }
        const token = authHeader.split(' ')[1];
        try {
            await this.jwtService.verifyAsync(token);
            return { message: '로그아웃 완료' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다.');
        }
    }
    async refreshToken(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('유효하지 않은 인증 헤더입니다.');
        }
        const refreshToken = authHeader.split(' ')[1];
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const newPayload = { sub: 'admin', adminId: payload.adminId, role: 'admin' };
            const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '1h' });
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                adminId: payload.adminId,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('유효하지 않은 refresh token입니다.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map