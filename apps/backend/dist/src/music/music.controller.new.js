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
exports.MusicController = void 0;
const common_1 = require("@nestjs/common");
const music_service_1 = require("./music.service");
const fs_1 = require("fs");
const path_1 = require("path");
const api_key_service_1 = require("./api-key.service");
let MusicController = class MusicController {
    musicService;
    apiKeyService;
    constructor(musicService, apiKeyService) {
        this.musicService = musicService;
        this.apiKeyService = apiKeyService;
    }
    async playMusic(musicId, headerApiKey, userAgent, range, response) {
        try {
            const apiKey = headerApiKey;
            const company = await this.apiKeyService.validateApiKey(apiKey);
            if (!company)
                throw new common_1.HttpException('유효하지 않은 API 키입니다.', common_1.HttpStatus.UNAUTHORIZED);
            const music = await this.musicService.findById(musicId);
            if (!music)
                throw new common_1.HttpException('음원을 찾을 수 없습니다.', common_1.HttpStatus.NOT_FOUND);
            const filePath = (0, path_1.join)(process.cwd(), music.file_path);
            try {
                const stats = (0, fs_1.statSync)(filePath);
                const fileSize = stats.size;
                let playSession = await this.musicService.findActiveSession(music.id, company.id);
            }
            catch (error) {
            }
        }
        catch (error) {
        }
    }
};
exports.MusicController = MusicController;
__decorate([
    (0, common_1.Get)(':music_id/play'),
    __param(0, (0, common_1.Param)('music_id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Headers)('range')),
    __param(4, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "playMusic", null);
exports.MusicController = MusicController = __decorate([
    (0, common_1.Controller)('music'),
    __metadata("design:paramtypes", [music_service_1.MusicService,
        api_key_service_1.ApiKeyService])
], MusicController);
//# sourceMappingURL=music.controller.new.js.map