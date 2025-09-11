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
exports.MeController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const multer_1 = require("multer");
const platform_express_1 = require("@nestjs/platform-express");
const path_1 = require("path");
const me_service_1 = require("./me.service");
const swagger_1 = require("@nestjs/swagger");
const update_me_dto_1 = require("./dto/update-me.dto");
const fs_1 = require("fs");
const subscribe_dto_1 = require("./dto/subscribe.dto");
const me_rewards_dto_1 = require("./dto/me-rewards.dto");
const me_plays_dto_1 = require("./dto/me-plays.dto");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'profile');
if (!(0, fs_1.existsSync)(UPLOAD_DIR))
    (0, fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
let MeController = class MeController {
    me;
    constructor(me) {
        this.me = me;
    }
    async overview(req) {
        const payload = await this.me.getMe(Number(req.user.sub));
        console.debug('[RESP /me/overview]', JSON.stringify(payload, (_k, v) => typeof v === 'bigint' ? v.toString() : v));
        return payload;
    }
    async updateProfile(req, file, dto) {
        const companyId = Number(req.user.sub);
        if (file) {
            dto.profile_image_url = `/uploads/profile/${file.filename}`;
        }
        return this.me.updateProfile(companyId, dto);
    }
    async subscribe(req, dto) {
        const companyId = Number(req.user.sub);
        return this.me.subscribe(companyId, dto);
    }
    async history(req) {
        const companyId = req.user.sub;
        return this.me.getHistory(companyId);
    }
    async rewards(req, q) {
        console.log('[rewards] sub(type):', typeof req.user?.sub, 'days:', q.days, 'musicId:', q.musicId);
        const companyId = Number(req.user?.sub);
        return this.me.getRewardsSummary({ companyId, days: q.days, musicId: q.musicId });
    }
    async plays(req, q) {
        const companyId = Number(req.user?.sub);
        return this.me.getPlays({ companyId, musicId: q.musicId, page: q.page, limit: q.limit });
    }
    async removeUsing(req, musicId) {
        const companyId = Number(req.user.sub);
        return this.me.removeUsing(companyId, musicId);
    }
};
exports.MeController = MeController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "overview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('profile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profile_image', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
            filename: (_req, file, cb) => {
                const ext = (file.originalname.match(/\.[^\.]+$/)?.[0] ?? '').toLowerCase();
                cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, update_me_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, subscribe_dto_1.SubscribeDto]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "history", null);
__decorate([
    (0, common_1.Get)('rewards'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, me_rewards_dto_1.GetMeRewardsQueryDto]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "rewards", null);
__decorate([
    (0, common_1.Get)('plays'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, me_plays_dto_1.GetMePlaysQueryDto]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "plays", null);
__decorate([
    (0, common_1.Delete)('using/:musicId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('musicId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "removeUsing", null);
exports.MeController = MeController = __decorate([
    (0, swagger_1.ApiTags)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [me_service_1.MeService])
], MeController);
//# sourceMappingURL=me.controller.js.map