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
exports.LyricController = void 0;
const common_1 = require("@nestjs/common");
const music_service_1 = require("./music.service");
const fs_1 = require("fs");
const path_1 = require("path");
let LyricController = class LyricController {
    musicService;
    constructor(musicService) {
        this.musicService = musicService;
    }
    async downloadLyric(musicId, apiKey, userAgent, response) {
        try {
            const company = await this.musicService.validateApiKey(apiKey);
            if (!company) {
                throw new common_1.HttpException('유효하지 않은 API 키입니다.', common_1.HttpStatus.UNAUTHORIZED);
            }
            const music = await this.musicService.findById(musicId);
            if (!music) {
                throw new common_1.HttpException('음원을 찾을 수 없습니다.', common_1.HttpStatus.NOT_FOUND);
            }
            if (!music.lyrics_file_path) {
                throw new common_1.HttpException('가사 파일이 없습니다.', common_1.HttpStatus.NOT_FOUND);
            }
            const canDownload = await this.musicService.checkLyricPermission(company, music);
            if (!canDownload) {
                throw new common_1.HttpException('가사 다운로드 권한이 없습니다.', common_1.HttpStatus.FORBIDDEN);
            }
            const lyricPath = (0, path_1.join)(process.cwd(), './uploads/lyrics/', music.lyrics_file_path);
            console.log('🔍 찾고 있는 가사 파일 경로:', lyricPath);
            console.log('📝 가사 정보:', { id: music.id, lyrics_file_path: music.lyrics_file_path, title: music.title });
            try {
                const stats = (0, fs_1.statSync)(lyricPath);
                console.log('📊 가사 파일 통계:', { size: stats.size, isFile: stats.isFile() });
                response.setHeader('Content-Type', 'text/plain; charset=utf-8');
                response.setHeader('Content-Length', stats.size);
                const safeFileName = `lyrics_${musicId}.txt`;
                response.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
                console.log('📁 다운로드 파일명:', safeFileName);
                const rewardCode = await this.musicService.getRewardCode(music.id, company.id);
                const rewardRow = await this.musicService.findRewardById(music.id);
                const rewardAmount = rewardRow ? rewardRow.reward_per_play : 0;
                const playRow = await this.musicService.startPlay({
                    musicId: music.id,
                    companyId: company.id,
                    useCase: '2',
                    rewardCode,
                    rewardAmount: rewardAmount.toString(),
                    usePrice: music.lyrics_price,
                });
                await this.musicService.lyricUseStat(music.id);
                await this.musicService.recordValidPlayOnce({
                    musicId: music.id,
                    companyId: company.id,
                    useCase: '2',
                    rewardCode,
                    musicPlayId: playRow.id,
                    rewardAmount,
                });
                const stream = (0, fs_1.createReadStream)(lyricPath);
                return new common_1.StreamableFile(stream);
            }
            catch (fileError) {
                console.error('❌ 가사 파일 접근 오류:', fileError);
                console.log('🔍 시도한 경로:', lyricPath);
                throw new common_1.HttpException('가사 파일을 찾을 수 없습니다.', common_1.HttpStatus.NOT_FOUND);
            }
        }
        catch (error) {
            console.error('가사 다운로드 에러:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('가사 다운로드 중 오류가 발생했습니다.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.LyricController = LyricController;
__decorate([
    (0, common_1.Get)(':music_id/download'),
    __param(0, (0, common_1.Param)('music_id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], LyricController.prototype, "downloadLyric", null);
exports.LyricController = LyricController = __decorate([
    (0, common_1.Controller)('lyric'),
    __metadata("design:paramtypes", [music_service_1.MusicService])
], LyricController);
//# sourceMappingURL=lyric.controller.js.map