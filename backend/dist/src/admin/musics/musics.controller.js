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
exports.MusicsController = void 0;
const common_1 = require("@nestjs/common");
const musics_service_1 = require("./musics.service");
const create_music_dto_1 = require("./dto/create-music.dto");
const update_music_dto_1 = require("./dto/update-music.dto");
const delete_musics_dto_1 = require("./dto/delete-musics.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = __importStar(require("fs"));
const update_reward_dto_1 = require("./dto/update-reward.dto");
const create_category_dto_1 = require("./dto/create-category.dto");
const music_rewards_summary_dto_1 = require("./dto/music-rewards-summary.dto");
const common_2 = require("@nestjs/common");
const music_rewards_trend_dto_1 = require("./dto/music-rewards-trend.dto");
const music_monthly_rewards_dto_1 = require("./dto/music-monthly-rewards.dto");
const music_company_usage_dto_1 = require("./dto/music-company-usage.dto");
const music_stats_dto_1 = require("./dto/music-stats.dto");
const plays_valid_stats_dto_1 = require("./dto/plays-valid-stats.dto");
const revenue_forecast_dto_1 = require("./dto/revenue-forecast.dto");
const rewards_filled_stats_dto_1 = require("./dto/rewards-filled-stats.dto");
const category_top5_dto_1 = require("./dto/category-top5.dto");
const realtime_dto_1 = require("./dto/realtime.dto");
let MusicsController = class MusicsController {
    musicsService;
    constructor(musicsService) {
        this.musicsService = musicsService;
    }
    async findAll(findMusicsDto) {
        return this.musicsService.findAll(findMusicsDto);
    }
    async getCategories() {
        return this.musicsService.getCategories();
    }
    async getRewardsSummary(query) {
        return this.musicsService.getRewardsSummary(query);
    }
    async getRewardsTrend(id, query) {
        return this.musicsService.getRewardsTrend(+id, query);
    }
    async getMonthlyRewards(id, query) {
        return this.musicsService.getMonthlyRewards(+id, query);
    }
    async getCompanyUsage(id, query) {
        return this.musicsService.getCompanyUsage(+id, query);
    }
    async getTotalStats(query) {
        return this.musicsService.getTotalCount(query);
    }
    async getValidPlaysStats(query) {
        return this.musicsService.getValidPlaysStats(query);
    }
    async getRevenueForecast(query) {
        return this.musicsService.getRevenueForecast(query);
    }
    async getRewardsFilled(query) {
        return this.musicsService.getRewardsFilledStats(query);
    }
    async getCategoryTop5(query) {
        return this.musicsService.getCategoryTop5(query);
    }
    async getRealtimeApiStatus(query) {
        return this.musicsService.getRealtimeApiStatus(query);
    }
    async getRealtimeApiCalls(query) {
        return this.musicsService.getRealtimeApiCalls(query);
    }
    async getRealtimeTopTracks(query) {
        return this.musicsService.getRealtimeTopTracks(query);
    }
    async getRealtimeTransactions(query) {
        return this.musicsService.getRealtimeTransactions(query);
    }
    async createCategory(dto) {
        const name = dto.name?.trim();
        if (!name)
            throw new common_1.BadRequestException('카테고리 이름은 필수입니다.');
        return this.musicsService.createCategory({ ...dto, name });
    }
    create(createMusicDto) {
        return this.musicsService.create(createMusicDto);
    }
    async upload(files) {
        return this.musicsService.saveUploadedFiles(files);
    }
    findOne(id) {
        return this.musicsService.findOne(+id);
    }
    async updateRewards(id, dto) {
        return this.musicsService.updateNextMonthRewards(+id, dto);
    }
    async getCover(id, res) {
        const file = await this.musicsService.getCoverFile(+id);
        if (file.isUrl && file.url) {
            return res.redirect(file.url);
        }
        if (file.absPath && file.contentType) {
            res.setHeader('Content-Type', file.contentType);
            return fs.createReadStream(file.absPath).pipe(res);
        }
        return res.status(404).send('커버 이미지가 없습니다.');
    }
    async getLyrics(id, mode = 'inline', res) {
        const info = await this.musicsService.getLyricsFileInfo(+id);
        if (info.hasText && info.text) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            if (mode === 'download') {
                res.setHeader('Content-Disposition', `attachment; filename="lyrics.txt"`);
            }
            return res.send(info.text);
        }
        if (info.hasFile && info.absPath && info.filename) {
            res.setHeader('Content-Type', 'text/plain');
            if (mode === 'download') {
                res.setHeader('Content-Disposition', `attachment; filename="${info.filename}"`);
            }
            return fs.createReadStream(info.absPath).pipe(res);
        }
        return res.status(404).send('가사 파일을 찾을 수 없습니다.');
    }
    update(id, updateMusicDto) {
        return this.musicsService.update(+id, updateMusicDto);
    }
    async delete(deleteDto) {
        return this.musicsService.delete(deleteDto.ids);
    }
};
exports.MusicsController = MusicsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('rewards/summary'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [music_rewards_summary_dto_1.MusicRewardsSummaryQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRewardsSummary", null);
__decorate([
    (0, common_1.Get)(':id/rewards/trend'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, music_rewards_trend_dto_1.MusicRewardsTrendQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRewardsTrend", null);
__decorate([
    (0, common_1.Get)(':id/rewards/monthly'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, music_monthly_rewards_dto_1.MusicMonthlyRewardsQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getMonthlyRewards", null);
__decorate([
    (0, common_1.Get)(':id/rewards/companies'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, music_company_usage_dto_1.MusicCompanyUsageQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getCompanyUsage", null);
__decorate([
    (0, common_1.Get)('stats/total'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [music_stats_dto_1.MusicTotalStatsQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getTotalStats", null);
__decorate([
    (0, common_1.Get)('stats/plays/valid'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [plays_valid_stats_dto_1.PlaysValidStatsQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getValidPlaysStats", null);
__decorate([
    (0, common_1.Get)('stats/revenue/forecast'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revenue_forecast_dto_1.RevenueForecastQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRevenueForecast", null);
__decorate([
    (0, common_1.Get)('stats/rewards/filled'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rewards_filled_stats_dto_1.RewardsFilledStatsQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRewardsFilled", null);
__decorate([
    (0, common_1.Get)('stats/category-top5'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_top5_dto_1.CategoryTop5QueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getCategoryTop5", null);
__decorate([
    (0, common_1.Get)('realtime/api-status'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [realtime_dto_1.RealtimeApiStatusQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRealtimeApiStatus", null);
__decorate([
    (0, common_1.Get)('realtime/api-calls'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [realtime_dto_1.RealtimeApiStatusQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRealtimeApiCalls", null);
__decorate([
    (0, common_1.Get)('realtime/top-tracks'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [realtime_dto_1.RealtimeTopTracksQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRealtimeTopTracks", null);
__decorate([
    (0, common_1.Get)('realtime/transactions'),
    __param(0, (0, common_1.Query)(new common_2.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [realtime_dto_1.RealtimeTransactionsQueryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getRealtimeTransactions", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_music_dto_1.CreateMusicDto]),
    __metadata("design:returntype", void 0)
], MusicsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'audio', maxCount: 1 },
        { name: 'lyrics', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ], { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MusicsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/rewards'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reward_dto_1.UpdateRewardDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "updateRewards", null);
__decorate([
    (0, common_1.Get)(':id/cover'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getCover", null);
__decorate([
    (0, common_1.Get)(':id/lyrics'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('mode')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "getLyrics", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_music_dto_1.UpdateMusicDto]),
    __metadata("design:returntype", void 0)
], MusicsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_musics_dto_1.DeleteMusicsDto]),
    __metadata("design:returntype", Promise)
], MusicsController.prototype, "delete", null);
exports.MusicsController = MusicsController = __decorate([
    (0, common_1.Controller)('/admin/musics'),
    __metadata("design:paramtypes", [musics_service_1.MusicsService])
], MusicsController);
//# sourceMappingURL=musics.controller.js.map