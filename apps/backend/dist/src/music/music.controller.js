"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicController = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = __importStar(require("crypto"));
const music_service_1 = require("./music.service");
let MusicController = class MusicController {
    musicService;
    constructor(musicService) {
        this.musicService = musicService;
    }
    SIGN_KEY = process.env.PLAY_TOKEN_SECRET || 'dev-secret-change-me';
    DEFAULT_CHUNK = 1024 * 1024;
    sign(data) {
        return crypto.createHmac('sha256', this.SIGN_KEY).update(data).digest('hex');
    }
    toWire(t) {
        const payload = JSON.stringify(t);
        const sig = this.sign(payload);
        return Buffer.from(payload).toString('base64url') + '.' + sig;
    }
    fromWire(raw) {
        if (!raw)
            return null;
        const [b64, sig] = String(raw).split('.');
        if (!b64 || !sig)
            return null;
        try {
            const json = Buffer.from(b64, 'base64url').toString('utf8');
            if (this.sign(json) !== sig)
                return null;
            const obj = JSON.parse(json);
            if (obj?.v !== 1)
                return null;
            return obj;
        }
        catch {
            return null;
        }
    }
    issueToken(musicId, companyId) {
        const token = { v: 1, musicId, companyId, startedAt: Date.now() };
        return this.toWire(token);
    }
    getCookie(req, name) {
        const h = req.headers['cookie'];
        if (!h)
            return null;
        const m = h.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
        return m ? decodeURIComponent(m.split('=')[1]) : null;
    }
    async playMusic(musicId, headerApiKey, range, playTokenHeader, playTokenQuery, apiKeyQuery, req, res) {
        try {
            let company = null;
            let apiKey = headerApiKey || apiKeyQuery;
            if (apiKey) {
                company = await this.musicService.validateApiKey(apiKey);
            }
            let tokenStr = playTokenHeader || playTokenQuery || this.getCookie(req, 'pt') || '';
            let token = this.fromWire(tokenStr);
            if (!company && token) {
                company = await this.musicService.findCompanyById(token.companyId);
            }
            if (!company) {
                throw new common_1.HttpException('API 키가 필요합니다.', common_1.HttpStatus.UNAUTHORIZED);
            }
            const music = await this.musicService.findById(musicId);
            if (!music)
                throw new common_1.HttpException('음원을 찾을 수 없습니다.', common_1.HttpStatus.NOT_FOUND);
            const ok = await this.musicService.checkPlayPermission(company, music);
            if (!ok)
                throw new common_1.HttpException('재생 권한이 없습니다.', common_1.HttpStatus.FORBIDDEN);
            let activeSession = await this.musicService.findActiveSession(music.id, company.id);
            let musicPlayId;
            let rewardInfo;
            let rewardAmount;
            if (activeSession) {
                musicPlayId = activeSession.id;
                rewardInfo = activeSession.reward_code;
                rewardAmount = activeSession.reward_amount ?? 0;
            }
            else {
                rewardInfo = await this.musicService.getRewardCode(musicId, company.id);
                const rewardRow = await this.musicService.findRewardById(musicId);
                rewardAmount = rewardRow ? rewardRow.reward_per_play : 0;
                const startPlay = await this.musicService.startPlay({
                    musicId: music.id,
                    companyId: company.id,
                    useCase: music.inst ? "1" : "0",
                    rewardCode: rewardInfo,
                    rewardAmount: String(rewardAmount),
                    usePrice: music.price_per_play,
                });
                musicPlayId = startPlay.id;
                await this.musicService.updateInitMusicStats(music.id);
            }
            const filePath = (0, path_1.join)(process.cwd(), '/uploads/music/', music.file_path);
            const fileSize = (0, fs_1.statSync)(filePath).size;
            if (!token || token.musicId !== music.id || token.companyId !== company.id) {
                tokenStr = this.issueToken(music.id, company.id);
                token = this.fromWire(tokenStr);
                res.setHeader('X-Play-Token', tokenStr);
                res.setHeader('Set-Cookie', `pt=${encodeURIComponent(tokenStr)}; Path=/; HttpOnly; SameSite=Lax`);
            }
            if (!range || !range.startsWith('bytes=')) {
                const syntheticEnd = Math.min(fileSize - 1, this.DEFAULT_CHUNK - 1);
                range = `bytes=0-${syntheticEnd}`;
            }
            const musicDataResult = await this.handleRangeRequestStateless({
                tokenStr, token, music, companyId: company.id,
                filePath, fileSize, range, res, musicPlayId, rewardInfo, rewardAmount
            });
            return musicDataResult;
        }
        catch (e) {
            console.error('음원 재생 에러:', e);
            if (e instanceof common_1.HttpException)
                throw e;
            throw new common_1.HttpException('음원 재생 중 오류', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleRangeRequestStateless(opts) {
        const { tokenStr, token, music, companyId, filePath, fileSize, range, res, musicPlayId, rewardInfo, rewardAmount } = opts;
        const parts = range.replace('bytes=', '').split('-');
        let start = parseInt(parts[0] || '0', 10);
        let reqEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        if (!Number.isFinite(start) || start < 0)
            start = 0;
        if (!Number.isFinite(reqEnd) || reqEnd >= fileSize)
            reqEnd = fileSize - 1;
        console.log(fileSize);
        let imposedEnd;
        if (start < (fileSize / 3)) {
            imposedEnd = Math.min(start + (256 * 1024) - 1, reqEnd, fileSize - 1);
        }
        else {
            const currentTime = Date.now();
            const elapsedTime = currentTime - new Date(token.startedAt).getTime();
            const musicDurationMs = music.duration * 1000;
            const halfDuration = musicDurationMs / 2;
            if (musicDurationMs > 0 && halfDuration > 0) {
                const playbackProgress = Math.min(Math.max(elapsedTime / halfDuration, 0), 1.0);
                const targetBytePosition = Math.floor(fileSize * playbackProgress);
                const maxAllowedEnd = Math.min(targetBytePosition, fileSize - 1);
                imposedEnd = Math.min(start + (1 * 1024) - 1, reqEnd, maxAllowedEnd);
            }
            else {
                imposedEnd = Math.min(start + (1 * 1024) - 1, reqEnd, fileSize - 1);
            }
            if (!Number.isFinite(imposedEnd)) {
                imposedEnd = Math.min(start + (1 * 1024) - 1, reqEnd, fileSize - 1);
            }
        }
        let end = imposedEnd;
        if (end < start)
            end = start;
        const chunkSize = end - start + 1;
        const progressPercentByBytes = Math.floor(((end + 1) / fileSize) * 100);
        console.log(`🎯 진행도(바이트기준): ${progressPercentByBytes}%`);
        if (progressPercentByBytes == 100) {
            const normalizedRewardAmount = (rewardAmount == null || rewardAmount === '') ? 0 : rewardAmount;
            await this.musicService.recordValidPlayOnce({
                musicId: music.id,
                companyId,
                useCase: music.inst ? '1' : '0',
                rewardCode: rewardInfo,
                musicPlayId,
                rewardAmount: normalizedRewardAmount,
            });
        }
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-Play-Token', tokenStr);
        const stream = (0, fs_1.createReadStream)(filePath, { start, end });
        return new common_1.StreamableFile(stream);
    }
};
exports.MusicController = MusicController;
__decorate([
    (0, common_1.Get)(':music_id/play'),
    __param(0, (0, common_1.Param)('music_id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __param(2, (0, common_1.Headers)('range')),
    __param(3, (0, common_1.Headers)('x-play-token')),
    __param(4, (0, common_1.Query)('pt')),
    __param(5, (0, common_1.Query)('api_key')),
    __param(6, (0, common_1.Req)()),
    __param(7, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "playMusic", null);
exports.MusicController = MusicController = __decorate([
    (0, common_1.Controller)('music'),
    __metadata("design:paramtypes", [music_service_1.MusicService])
], MusicController);
//# sourceMappingURL=music.controller.js.map