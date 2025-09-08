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
exports.MusicService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const api_key_service_1 = require("./api-key.service");
let MusicService = class MusicService {
    db;
    apiKeyService;
    constructor(db, apiKeyService) {
        this.db = db;
        this.apiKeyService = apiKeyService;
    }
    async validateApiKey(apiKey) {
        if (!apiKey) {
            throw new common_1.HttpException('API 키가 필요합니다.', common_1.HttpStatus.UNAUTHORIZED);
        }
        const company = await this.apiKeyService.validateApiKey(apiKey);
        return company;
    }
    async findById(musicId) {
        const result = await this.db
            .select()
            .from(schema_1.musics)
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId));
        return result[0] || null;
    }
    async findRewardById(musicId) {
        const result = await this.db
            .select()
            .from(schema_1.monthly_music_rewards)
            .where((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId));
        return result[0] || null;
    }
    async checkPlayPermission(company, music) {
        if (music.grade > this.getGradeLevel(company.grade)) {
            return false;
        }
        if (company.grade !== 'free') {
            const activeSubscription = await this.db
                .select()
                .from(schema_1.company_subscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.company_subscriptions.company_id, company.id), (0, drizzle_orm_1.gte)(schema_1.company_subscriptions.end_date, new Date())));
            if (activeSubscription.length === 0) {
                return false;
            }
        }
        return true;
    }
    async checkLyricPermission(company, music) {
        return this.checkPlayPermission(company, music);
    }
    async startPlay(sessionData) {
        const playRecord = await this.db
            .insert(schema_1.music_plays)
            .values({
            music_id: Number(sessionData.musicId),
            using_company_id: Number(sessionData.companyId),
            reward_code: sessionData.rewardCode,
            use_case: sessionData.useCase,
            is_valid_play: false,
            reward_amount: sessionData.rewardAmount,
            use_price: sessionData.usePrice,
        })
            .returning();
        return playRecord[0];
    }
    async recordLyricDownload(downloadData) {
        try {
            const company = await this.db
                .select()
                .from(schema_1.companies)
                .where((0, drizzle_orm_1.eq)(schema_1.companies.id, downloadData.companyId));
            if (company.length === 0) {
                throw new Error('회사 정보를 찾을 수 없습니다.');
            }
            const rewardInfo = await this.checkAndProcessReward(downloadData.musicId, downloadData.companyId, company[0].grade);
            await this.db
                .insert(schema_1.music_plays)
                .values({
                music_id: downloadData.musicId,
                using_company_id: downloadData.companyId,
                reward_code: rewardInfo.rewardCode,
                use_case: '2',
                is_valid_play: true,
                play_duration_sec: 0,
                reward_amount: rewardInfo.rewardAmount.toString(),
            });
            console.log(`가사 다운로드 기록: 음원 ${downloadData.musicId}, 회사 ${downloadData.companyId}, 리워드: ${rewardInfo.rewardAmount}`);
        }
        catch (error) {
            console.error('가사 다운로드 기록 에러:', error);
        }
    }
    async updateEndMusicStats(musicId) {
        await this.db
            .update(schema_1.musics)
            .set({
            total_valid_play_count: (0, drizzle_orm_1.sql) `${schema_1.musics.total_valid_play_count} + 1`,
            last_played_at: new Date(),
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId));
    }
    async updateInitMusicStats(musicId) {
        await this.db
            .update(schema_1.musics)
            .set({
            total_play_count: (0, drizzle_orm_1.sql) `${schema_1.musics.total_play_count} + 1`,
            total_revenue: (0, drizzle_orm_1.sql) `${schema_1.musics.total_revenue} + ${schema_1.musics.price_per_play}`,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId));
    }
    async lyricUseStat(musicId) {
        await this.db
            .update(schema_1.musics)
            .set({
            total_play_count: (0, drizzle_orm_1.sql) `${schema_1.musics.total_play_count} + 1`,
            total_revenue: (0, drizzle_orm_1.sql) `${schema_1.musics.total_revenue} + ${schema_1.musics.lyrics_price}`,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId));
    }
    async processReward(playRecord) {
        try {
            const company = await this.db
                .select()
                .from(schema_1.companies)
                .where((0, drizzle_orm_1.eq)(schema_1.companies.id, playRecord.using_company_id));
            if (company.length === 0) {
                return;
            }
            const rewardInfo = await this.checkAndProcessReward(playRecord.music_id, playRecord.using_company_id, company[0].grade);
            await this.db
                .update(schema_1.music_plays)
                .set({
                reward_amount: rewardInfo.rewardAmount.toString(),
                reward_code: rewardInfo.rewardCode,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, playRecord.id));
            if (rewardInfo.rewardAmount > 0) {
                await this.db
                    .update(schema_1.companies)
                    .set({
                    total_rewards_earned: (0, drizzle_orm_1.sql) `${schema_1.companies.total_rewards_earned} + ${rewardInfo.rewardAmount}`,
                    updated_at: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.companies.id, playRecord.using_company_id));
                console.log(`리워드 지급: ${rewardInfo.rewardAmount}원, 회사 ${playRecord.using_company_id}`);
            }
        }
        catch (error) {
            console.error('리워드 처리 에러:', error);
        }
    }
    async checkAndProcessReward(musicId, companyId, companyGrade) {
        if (companyGrade === 'free') {
            return { rewardCode: '0', rewardAmount: 0 };
        }
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        const monthlyReward = await this.db
            .select()
            .from(schema_1.monthly_music_rewards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId), (0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.year_month, currentYearMonth)));
        if (monthlyReward.length === 0) {
            return { rewardCode: '0', rewardAmount: 0 };
        }
        const reward = monthlyReward[0];
        if (reward.remaining_reward_count <= 0) {
            return { rewardCode: '2', rewardAmount: 0 };
        }
        const monthlyRewardLimit = 5000;
        const companyMonthlyRewardCount = await this.getCompanyMonthlyRewardCount(companyId);
        if (companyMonthlyRewardCount >= monthlyRewardLimit) {
            return { rewardCode: '3', rewardAmount: 0 };
        }
        await this.db
            .update(schema_1.monthly_music_rewards)
            .set({
            remaining_reward_count: (0, drizzle_orm_1.sql) `${schema_1.monthly_music_rewards.remaining_reward_count} - 1`,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.id, reward.id));
        const rewardAmount = parseFloat(reward.reward_per_play.toString());
        return { rewardCode: '1', rewardAmount };
    }
    async getCompanyMonthlyRewardCount(companyId) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.music_plays.using_company_id, companyId), (0, drizzle_orm_1.gte)(schema_1.music_plays.created_at, startOfMonth), (0, drizzle_orm_1.eq)(schema_1.music_plays.reward_code, '1')));
        return result[0]?.count || 0;
    }
    getGradeLevel(grade) {
        const levels = {
            'free': 0,
            'standard': 1,
            'business': 2
        };
        return levels[grade] || 0;
    }
    async getRewardCode(musicId, companyId) {
        const musicRows = await this.db
            .select({ id: schema_1.musics.id, grade: schema_1.musics.grade })
            .from(schema_1.musics)
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId))
            .limit(1);
        const music = musicRows[0];
        if (!music)
            return '0';
        if (music.grade !== 1)
            return '0';
        const monthlyRows = await this.db
            .select({
            id: schema_1.monthly_music_rewards.id,
            remaining: schema_1.monthly_music_rewards.remaining_reward_count,
        })
            .from(schema_1.monthly_music_rewards)
            .where((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.monthly_music_rewards.id))
            .limit(1);
        const monthly = monthlyRows[0];
        if (!monthly || monthly.remaining <= 0)
            return '2';
        const subscriptionRows = await this.db
            .select({
            id: schema_1.company_subscriptions.id,
            start: schema_1.company_subscriptions.start_date,
        })
            .from(schema_1.company_subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.company_subscriptions.company_id, companyId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.company_subscriptions.start_date), (0, drizzle_orm_1.desc)(schema_1.company_subscriptions.id))
            .limit(1);
        const sub = subscriptionRows[0];
        if (sub?.start) {
            const startDate = new Date(sub.start);
            const endDate = new Date(startDate.getTime());
            endDate.setMonth(endDate.getMonth() + 1);
            const rewardCountRows = await this.db
                .select({ c: (0, drizzle_orm_1.count)() })
                .from(schema_1.music_plays)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.music_plays.using_company_id, companyId), (0, drizzle_orm_1.eq)(schema_1.music_plays.is_valid_play, true), (0, drizzle_orm_1.eq)(schema_1.music_plays.reward_code, '1'), (0, drizzle_orm_1.gte)(schema_1.music_plays.created_at, startDate), (0, drizzle_orm_1.lt)(schema_1.music_plays.created_at, endDate)));
            const rewardCount = Number(rewardCountRows[0]?.c || 0);
            if (rewardCount >= 5000)
                return '3';
        }
        return '1';
    }
    async findActiveSession(musicId, companyId) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const result = await this.db
            .select()
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.music_plays.music_id, musicId), (0, drizzle_orm_1.eq)(schema_1.music_plays.using_company_id, companyId), (0, drizzle_orm_1.gte)(schema_1.music_plays.created_at, tenMinutesAgo), (0, drizzle_orm_1.eq)(schema_1.music_plays.is_valid_play, false)))
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.music_plays.created_at} DESC`)
            .limit(1);
        return result[0] || null;
    }
    async updatePlayProgress(sessionId, progressPercent, byteStart, byteEnd) {
        console.log(`📈 진행도 업데이트: 세션 ${sessionId}, ${progressPercent}%, bytes: ${byteStart}-${byteEnd}`);
        await this.updateTotalTransferredBytes(sessionId, byteStart, byteEnd);
        if (progressPercent >= 60) {
            await this.checkAndMarkValidPlayByTransfer(sessionId, progressPercent);
        }
        else if (progressPercent >= 50) {
            await this.checkValidPlayWithTimeCondition(sessionId, progressPercent);
        }
        await this.db
            .update(schema_1.music_plays)
            .set({
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId));
    }
    async checkValidPlayWithTimeCondition(sessionId, progressPercent) {
        const session = await this.db
            .select()
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId))
            .limit(1);
        if (!session[0] || session[0].is_valid_play || !session[0].created_at) {
            return;
        }
        const currentTime = new Date();
        const startTime = new Date(session[0].created_at);
        const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
        console.log(`⏰ 시간+진행도 체크: 세션 ${sessionId}, ${progressPercent}%, ${elapsedSeconds}초 경과`);
        if (elapsedSeconds >= 30 && progressPercent >= 50) {
            await this.markAsValidPlayByTransfer(sessionId, progressPercent);
        }
    }
    async updateTotalTransferredBytes(sessionId, byteStart, byteEnd) {
        const transferredBytes = (byteEnd - byteStart) + 1;
        const session = await this.db
            .select()
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId))
            .limit(1);
        if (session[0]) {
            const currentTransferred = session[0].play_duration_sec || 0;
            const newTotalTransferred = currentTransferred + transferredBytes;
            await this.db
                .update(schema_1.music_plays)
                .set({
                play_duration_sec: newTotalTransferred,
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId));
            console.log(`� 세션 ${sessionId} 누적 전송량: ${newTotalTransferred} bytes`);
        }
    }
    async checkAndMarkValidPlayByTransfer(sessionId, progressPercent) {
        const session = await this.db
            .select()
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId))
            .limit(1);
        if (!session[0] || session[0].is_valid_play) {
            return;
        }
        console.log(`🎯 데이터 전송 기반 유효재생 체크: 세션 ${sessionId}, 진행도 ${progressPercent}%`);
        if (progressPercent >= 50) {
            await this.markAsValidPlayByTransfer(sessionId, progressPercent);
        }
    }
    async markAsValidPlayByTransfer(sessionId, progressPercent) {
        const session = await this.db
            .select()
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId))
            .limit(1);
        if (!session[0]) {
            console.error(`세션을 찾을 수 없습니다: ${sessionId}`);
            return;
        }
        if (session[0].is_valid_play) {
            console.log(`⚠️ 이미 유효재생 처리된 세션: ${sessionId}`);
            return;
        }
        const company = await this.db
            .select()
            .from(schema_1.companies)
            .where((0, drizzle_orm_1.eq)(schema_1.companies.id, session[0].using_company_id))
            .limit(1);
        const companyGrade = company[0]?.grade || 'free';
        const { rewardCode, rewardAmount } = await this.checkAndProcessReward(session[0].music_id, session[0].using_company_id, companyGrade);
        let actualPlayDuration = 60;
        if (session[0].created_at) {
            const currentTime = new Date();
            const startTime = new Date(session[0].created_at);
            actualPlayDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
        }
        await this.db
            .update(schema_1.music_plays)
            .set({
            is_valid_play: true,
            reward_code: rewardCode,
            reward_amount: rewardAmount.toString(),
            play_duration_sec: actualPlayDuration,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId));
        if (rewardAmount > 0) {
            await this.db
                .update(schema_1.companies)
                .set({
                total_rewards_earned: (0, drizzle_orm_1.sql) `${schema_1.companies.total_rewards_earned} + ${rewardAmount}`,
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.companies.id, session[0].using_company_id));
        }
        console.log(`🎉 데이터 전송량 기반 유효재생 처리 완료: 세션 ${sessionId}, 진행도 ${progressPercent}%, 실제 재생시간: ${actualPlayDuration}초, 리워드: ${rewardAmount}`);
    }
    async markAsValidPlay(sessionId) {
        console.log(`✅ 유효재생 처리 시작: 세션 ${sessionId}`);
        const session = await this.db
            .select()
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId))
            .limit(1);
        if (!session[0]) {
            console.log(`❌ 세션을 찾을 수 없음: ${sessionId}`);
            return;
        }
        if (session[0].is_valid_play) {
            console.log(`⏭️ 이미 유효재생 처리됨: 세션 ${sessionId}`);
            return;
        }
        await this.db
            .update(schema_1.music_plays)
            .set({
            is_valid_play: true,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, sessionId));
        console.log(`✅ 유효재생 처리 완료: 세션 ${sessionId}`);
        await this.processReward(sessionId);
    }
    async recordValidPlayOnce(opts) {
        const { musicId, companyId, useCase, musicPlayId, rewardCode, rewardAmount } = opts;
        await this.db
            .update(schema_1.music_plays)
            .set({
            is_valid_play: true,
            reward_code: rewardCode ?? '0',
            reward_amount: (rewardAmount ?? 0).toString(),
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, musicPlayId));
        console.log(rewardCode, '리워드코드입니다.');
        await this.db
            .insert(schema_1.rewards)
            .values({
            company_id: companyId,
            music_id: musicId,
            play_id: musicPlayId,
            amount: rewardAmount.toString(),
            reward_code: rewardCode ?? '0',
        });
        await this.updateEndMusicStats(musicId);
        if ((rewardCode ?? '0') === '1') {
            const currentYearMonth = new Date().toISOString().slice(0, 7);
            const target = await this.db
                .select({ id: schema_1.monthly_music_rewards.id, remaining: schema_1.monthly_music_rewards.remaining_reward_count })
                .from(schema_1.monthly_music_rewards)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId), (0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.year_month, currentYearMonth)))
                .limit(1);
            if (target[0] && target[0].remaining > 0) {
                await this.db
                    .update(schema_1.monthly_music_rewards)
                    .set({
                    remaining_reward_count: (0, drizzle_orm_1.sql) `${schema_1.monthly_music_rewards.remaining_reward_count} - 1`,
                    updated_at: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.id, target[0].id));
            }
        }
    }
    async getStartPlay(musicPlayId) {
        const result = await this.db
            .select()
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.eq)(schema_1.music_plays.id, musicPlayId));
        return result[0] || null;
    }
    async findCompanyById(companyId) {
        const rows = await this.db
            .select()
            .from(schema_1.companies)
            .where((0, drizzle_orm_1.eq)(schema_1.companies.id, companyId))
            .limit(1);
        return rows[0] || null;
    }
};
exports.MusicService = MusicService;
exports.MusicService = MusicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase,
        api_key_service_1.ApiKeyService])
], MusicService);
//# sourceMappingURL=music.service.js.map