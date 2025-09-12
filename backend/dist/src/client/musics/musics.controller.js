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
exports.MusicsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_1 = require("@nestjs/jwt");
const musics_service_1 = require("./musics.service");
const list_music_query_dto_1 = require("./dto/list-music.query.dto");
const music_detail_dto_1 = require("./dto/music-detail.dto");
let MusicsController = class MusicsController {
    musics;
    jwt;
    constructor(musics, jwt) {
        this.musics = musics;
        this.jwt = jwt;
    }
    async list(req, query) {
        const token = req.headers?.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : (req.cookies?.mps_at ?? null);
        let user = null;
        if (token) {
            try {
                user = await this.jwt.verifyAsync(token);
            }
            catch { }
        }
        const isAuth = !!user;
        const companyId = Number(user?.sub ?? 0);
        const grade = (user?.grade ?? 'free');
        return this.musics.searchList({ companyId, grade, isAuth, query });
    }
    async categories() {
        const items = await this.musics.listCategories();
        return { items };
    }
    async popular(req, q) {
        const token = req.headers?.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : (req.cookies?.mps_at ?? null);
        let user = null;
        if (token) {
            try {
                user = await this.jwt.verifyAsync(token);
            }
            catch { }
        }
        const isAuth = !!user;
        const companyId = Number(user?.sub ?? 0);
        const grade = (user?.grade ?? 'free');
        const items = (await this.musics.searchList({
            companyId,
            grade,
            isAuth,
            query: {
                sort: 'most_played',
                category_id: q.category,
                limit: q.limit ?? 12,
            }
        })).items;
        return { items };
    }
    async getOne(req, id) {
        const token = req.headers?.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : (req.cookies?.mps_at ?? null);
        let user = null;
        if (token) {
            try {
                user = await this.jwt.verifyAsync(token);
            }
            catch { }
        }
        const isAuth = !!user;
        const companyId = Number(user?.sub ?? 0);
        const grade = (user?.grade ?? 'free');
        return this.musics.getDetail({ companyId, grade, isAuth, musicId: Number(id) });
    }
    async use(req, id) {
        const token = req.headers?.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : (req.cookies?.mps_at ?? null);
        let user = null;
        if (token) {
            try {
                user = await this.jwt.verifyAsync(token);
            }
            catch { }
        }
        if (!user) {
            const { UnauthorizedException } = await import('@nestjs/common');
            throw new UnauthorizedException('LOGIN_REQUIRED');
        }
        return this.musics.useMusic(Number(user.sub), Number(id));
    }
};
exports.MusicsController = MusicsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ schema: { properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/PopularMusicDto' } },
                nextCursor: { type: 'string', nullable: true }
            } } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_music_query_dto_1.ListMusicQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOkResponse)({ schema: { properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/CategoryDto' } }
            } } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('popular'),
    (0, swagger_1.ApiOkResponse)({ schema: { properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/PopularMusicDto' } }
            } } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "popular", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: music_detail_dto_1.MusicDetailDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(':id/use'),
    (0, swagger_1.ApiOkResponse)({ type: music_detail_dto_1.UseMusicResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "use", null);
exports.MusicsController = MusicsController = __decorate([
    (0, swagger_1.ApiTags)('musics'),
    (0, common_1.Controller)('musics'),
    __metadata("design:paramtypes", [musics_service_1.MusicsService, jwt_1.JwtService])
], MusicsController);
//# sourceMappingURL=musics.controller.js.map