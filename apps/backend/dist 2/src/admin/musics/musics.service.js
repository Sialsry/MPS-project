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
exports.MusicsService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const pagination_util_1 = require("../../common/utils/pagination.util");
const date_util_1 = require("../../common/utils/date.util");
const date_util_2 = require("../../common/utils/date.util");
const sort_util_1 = require("../../common/utils/sort.util");
const rewards_queries_1 = require("./queries/rewards.queries");
const musics_queries_1 = require("./queries/musics.queries");
const trend_queries_1 = require("./queries/trend.queries");
const monthly_queries_1 = require("./queries/monthly.queries");
const company_usage_queries_1 = require("./queries/company-usage.queries");
const date_util_3 = require("../../common/utils/date.util");
const stats_queries_1 = require("./queries/stats.queries");
let MusicsService = class MusicsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async onModuleInit() {
        await this.ensureStorageDirs();
    }
    async ensureStorageDirs() {
        const musicBaseDir = process.env.MUSIC_BASE_DIR
            ? path.resolve(process.env.MUSIC_BASE_DIR)
            : path.resolve(process.cwd(), 'music');
        const lyricsBaseDir = process.env.LYRICS_BASE_DIR
            ? path.resolve(process.env.LYRICS_BASE_DIR)
            : path.resolve(process.cwd(), 'lyrics');
        const imagesBaseDir = process.env.IMAGES_BASE_DIR
            ? path.resolve(process.env.IMAGES_BASE_DIR)
            : path.resolve(process.cwd(), 'images');
        await fs.mkdir(musicBaseDir, { recursive: true });
        await fs.mkdir(lyricsBaseDir, { recursive: true });
        await fs.mkdir(imagesBaseDir, { recursive: true });
    }
    async getCategories() {
        try {
            const categories = await this.db
                .select({ id: schema_1.music_categories.id, name: schema_1.music_categories.name })
                .from(schema_1.music_categories)
                .orderBy(schema_1.music_categories.name);
            return {
                categories: categories.map(cat => ({
                    id: cat.id,
                    name: cat.name
                }))
            };
        }
        catch (error) {
            throw new Error(`카테고리 조회 실패: ${error.message}`);
        }
    }
    async findAll(findMusicsDto) {
        const { page = 1, limit = 10, search, category, musicType, idSortFilter, releaseDateSortFilter, rewardLimitFilter, sortBy = 'created_at', sortOrder = 'desc' } = findMusicsDto;
        const { page: p, limit: l, offset } = (0, pagination_util_1.normalizePagination)(page, limit, 100);
        const currentMonth = (0, date_util_1.getDefaultYearMonthKST)();
        const rawQuery = (0, musics_queries_1.buildFindAllQuery)({
            search,
            categoryLabel: category ?? null,
            musicType: musicType ?? '',
            idSortFilter: idSortFilter ?? '',
            releaseDateSortFilter: releaseDateSortFilter ?? '',
            rewardLimitFilter: rewardLimitFilter ?? '',
            currentMonth,
            limit: l,
            offset,
        });
        console.log('🔍 Query parameters:', { search, category, musicType, currentMonth, limit: l, offset });
        console.log('🔍 Raw query:', rawQuery);
        const results = await this.db.execute(rawQuery);
        console.log('🔍 Query results:', results.rows.length, 'rows found');
        console.log('🔍 First result:', results.rows[0]);
        return {
            musics: results.rows,
            page: p,
            limit: l
        };
    }
    async getRewardsSummary(query) {
        const ym = (0, date_util_2.resolveYearMonthKST)(query.yearMonth);
        const [y, m] = ym.split('-').map(Number);
        const { page = 1, limit = 20 } = query;
        const { offset, page: p, limit: l } = (0, pagination_util_1.normalizePagination)(page, limit, 100);
        const sortAllow = ['music_id', 'title', 'artist', 'category', 'grade', 'musicType', 'monthlyLimit', 'rewardPerPlay', 'usageRate', 'validPlays', 'earned', 'companiesUsing', 'lastUsedAt'];
        const { sortBy, order } = (0, sort_util_1.normalizeSort)(query.sortBy, query.order, sortAllow);
        const orderSql = (0, rewards_queries_1.buildMusicRewardsOrderSql)(sortBy, order);
        const musicTypeBool = query.musicType === 'inst' ? true : query.musicType === 'normal' ? false : undefined;
        const gradeNum = query.grade && query.grade !== 'all' ? Number(query.grade) : undefined;
        const listSql = (0, rewards_queries_1.buildMusicRewardsSummaryQuery)({
            year: y,
            month: m,
            search: query.search,
            categoryId: query.categoryId,
            grade: gradeNum,
            musicType: musicTypeBool,
            offset,
            limit: l,
            orderBySql: orderSql,
        });
        const countSql = (0, rewards_queries_1.buildMusicRewardsSummaryCountQuery)({
            year: y,
            month: m,
            search: query.search,
            categoryId: query.categoryId,
            grade: gradeNum,
            musicType: musicTypeBool,
        });
        const [rowsRes, countRes] = await Promise.all([
            this.db.execute(listSql),
            this.db.execute(countSql),
        ]);
        const items = (rowsRes.rows || []).map((r) => ({
            musicId: Number(r.music_id),
            title: r.title,
            artist: r.artist,
            category: r.category ?? null,
            musicType: (() => {
                const v = r.music_type;
                const b = v === true || v === 't' || v === 'true' || v === 1 || v === '1';
                return b ? 'Inst' : '일반';
            })(),
            grade: Number(r.grade),
            validPlays: Number(r.valid_plays || 0),
            earned: Number(r.earned || 0),
            companiesUsing: Number(r.companies_using || 0),
            lastUsedAt: r.last_used_at ?? null,
            monthlyLimit: r.monthly_limit !== null && r.monthly_limit !== undefined ? Number(r.monthly_limit) : null,
            usageRate: (() => {
                const total = r.monthly_limit !== null && r.monthly_limit !== undefined ? Number(r.monthly_limit) : null;
                if (total === null || total <= 0)
                    return null;
                const remaining = r.monthly_remaining !== null && r.monthly_remaining !== undefined ? Number(r.monthly_remaining) : null;
                if (remaining !== null && remaining >= 0) {
                    const used = Math.max(total - remaining, 0);
                    if (used > 0) {
                        return Math.min(100, Math.round((used / total) * 100));
                    }
                }
                const rewardPerPlay = r.reward_per_play !== null && r.reward_per_play !== undefined ? Number(r.reward_per_play) : null;
                const earned = r.earned !== null && r.earned !== undefined ? Number(r.earned) : 0;
                if (rewardPerPlay !== null && rewardPerPlay > 0 && earned > 0) {
                    const usedEst = Math.floor(earned / rewardPerPlay);
                    return Math.min(100, Math.round((usedEst / total) * 100));
                }
                const validPlays = r.valid_plays !== null && r.valid_plays !== undefined ? Number(r.valid_plays) : 0;
                if (validPlays > 0) {
                    const usedEst = Math.min(validPlays, total);
                    return Math.min(100, Math.round((usedEst / total) * 100));
                }
                return 0;
            })(),
            rewardPerPlay: r.reward_per_play !== null && r.reward_per_play !== undefined ? Number(r.reward_per_play) : null,
        }));
        const total = Number(countRes.rows?.[0]?.total || 0);
        return { yearMonth: ym, total, page: p, limit: l, items };
    }
    async getMonthlyRewards(musicId, query) {
        const endYM = query.endYearMonth ? (0, date_util_2.resolveYearMonthKST)(query.endYearMonth) : (0, date_util_1.getDefaultYearMonthKST)();
        const [endYear, endMonth] = endYM.split('-').map(Number);
        const months = Math.min(Math.max(query.months ?? 12, 1), 24);
        const sqlQuery = (0, monthly_queries_1.buildMusicMonthlyRewardsQuery)({
            musicId,
            endYear,
            endMonth,
            months,
        });
        const res = await this.db.execute(sqlQuery);
        const rows = res.rows || [];
        const items = rows.map((r) => {
            const label = r.label;
            const validPlays = Number(r.valid_plays || 0);
            const companiesUsing = Number(r.companies_using || 0);
            const monthlyLimit = r.monthly_limit !== null && r.monthly_limit !== undefined ? Number(r.monthly_limit) : null;
            const monthlyRemaining = r.monthly_remaining !== null && r.monthly_remaining !== undefined ? Number(r.monthly_remaining) : null;
            const rewardPerPlay = r.reward_per_play !== null && r.reward_per_play !== undefined ? Number(r.reward_per_play) : null;
            const earned = Number(r.earned || 0);
            const usageRate = (() => {
                if (monthlyLimit === null || monthlyLimit <= 0)
                    return null;
                if (monthlyRemaining !== null && monthlyRemaining >= 0) {
                    const used = Math.max(monthlyLimit - monthlyRemaining, 0);
                    if (used > 0)
                        return Math.min(100, Math.round((used / monthlyLimit) * 100));
                }
                if (rewardPerPlay !== null && rewardPerPlay > 0 && earned > 0) {
                    const usedEst = Math.floor(earned / rewardPerPlay);
                    return Math.min(100, Math.round((usedEst / monthlyLimit) * 100));
                }
                if (validPlays > 0) {
                    const usedEst = Math.min(validPlays, monthlyLimit);
                    return Math.min(100, Math.round((usedEst / monthlyLimit) * 100));
                }
                return 0;
            })();
            return {
                label,
                validPlays,
                companiesUsing,
                monthlyLimit,
                usageRate,
                earned,
                rewardPerPlay,
            };
        });
        return {
            labels: items.map(i => i.label),
            items,
            meta: { endYearMonth: endYM, months },
        };
    }
    async create(createMusicDto) {
        try {
            const categoryExists = await this.db
                .select({ id: schema_1.music_categories.id, name: schema_1.music_categories.name })
                .from(schema_1.music_categories)
                .where((0, drizzle_orm_1.eq)(schema_1.music_categories.name, createMusicDto.category))
                .limit(1);
            if (categoryExists.length === 0) {
                throw new Error(`카테고리를 찾을 수 없습니다.`);
            }
            const categoryId = categoryExists[0].id;
            const duplicateMusic = await this.db.select().from(schema_1.musics).where((0, drizzle_orm_1.eq)(schema_1.musics.file_path, createMusicDto.audioFilePath)).limit(1);
            if (duplicateMusic.length > 0) {
                throw new Error('동일한 경로의 음원이 존재합니다.');
            }
            const newMusic = await this.db.insert(schema_1.musics).values({
                file_path: createMusicDto.audioFilePath,
                title: createMusicDto.title,
                artist: createMusicDto.artist,
                category_id: categoryId,
                inst: createMusicDto.musicType === 'Inst',
                release_date: createMusicDto.releaseDate ? createMusicDto.releaseDate : null,
                duration_sec: createMusicDto.durationSec,
                price_per_play: createMusicDto.priceMusicOnly.toString(),
                lyrics_price: createMusicDto.priceLyricsOnly.toString(),
                isrc: createMusicDto.isrc || null,
                composer: createMusicDto.composer || null,
                music_arranger: createMusicDto.arranger || null,
                lyricist: createMusicDto.lyricist || null,
                lyrics_text: createMusicDto.lyricsText || null,
                cover_image_url: createMusicDto.coverImagePath || null,
                lyrics_file_path: createMusicDto.lyricsFilePath || null,
                total_valid_play_count: 0,
                total_play_count: 0,
                total_rewarded_amount: '0',
                total_revenue: '0',
                grade: createMusicDto.grade,
                file_size_bytes: 0,
                last_played_at: null
            }).returning();
            const musicId = newMusic[0].id;
            const rewardData = {
                music_id: musicId,
                year_month: new Date().toISOString().slice(0, 7),
                total_reward_count: createMusicDto.grade === 1 ? createMusicDto.maxPlayCount || 0 : 0,
                remaining_reward_count: createMusicDto.grade === 1 ? createMusicDto.maxPlayCount || 0 : 0,
                reward_per_play: createMusicDto.grade === 1 ? createMusicDto.rewardPerPlay.toString() : '0'
            };
            await this.db.insert(schema_1.monthly_music_rewards).values(rewardData);
            if (createMusicDto.tags && createMusicDto.tags.trim()) {
                const tagArr = createMusicDto.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                for (const tagText of tagArr) {
                    await this.db.insert(schema_1.music_tags).values({
                        music_id: musicId,
                        text: tagText,
                        raw_tag_id: null,
                    });
                }
            }
            return {
                message: '음원 등록 완료',
                music: {
                    id: musicId,
                    title: createMusicDto.title,
                    artist: createMusicDto.artist,
                    category: createMusicDto.category,
                    musicType: createMusicDto.musicType,
                    durationSec: createMusicDto.durationSec,
                    priceMusicOnly: createMusicDto.priceMusicOnly,
                    priceLyricsOnly: createMusicDto.priceLyricsOnly,
                    rewardPerPlay: createMusicDto.rewardPerPlay,
                    maxPlayCount: createMusicDto.maxPlayCount,
                    grade: createMusicDto.grade,
                    audioFilePath: createMusicDto.audioFilePath
                },
                id: musicId
            };
        }
        catch (error) {
            console.error('음원 등록 실패:', error);
            throw new Error(`음원 등록 실패: ${error.message}`);
        }
    }
    async createCategory(dto) {
        const name = dto.name.trim();
        const dup = await this.db
            .select({ id: schema_1.music_categories.id })
            .from(schema_1.music_categories)
            .where((0, drizzle_orm_1.sql) `LOWER(${schema_1.music_categories.name}) = LOWER(${name})`)
            .limit(1);
        if (dup.length > 0) {
            throw new common_1.BadRequestException('이미 존재하는 카테고리입니다.');
        }
        const inserted = await this.db
            .insert(schema_1.music_categories)
            .values({ name })
            .returning({ id: schema_1.music_categories.id, name: schema_1.music_categories.name });
        return { id: inserted[0].id, name };
    }
    async findOne(id) {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const query = (0, musics_queries_1.buildFindOneQuery)(id, currentMonth);
            const result = await this.db.execute(query);
            if (!result.rows || result.rows.length === 0) {
                throw new Error('음원을 찾을 수 없습니다.');
            }
            const row = result.rows[0];
            const instRaw = row.inst;
            const isInst = instRaw === true || instRaw === 't' || instRaw === 'true' || instRaw === 1 || instRaw === '1';
            return {
                id: row.id,
                title: row.title,
                artist: row.artist,
                category: row.category,
                musicType: isInst ? 'Inst' : '일반',
                tags: row.tags,
                normalizedTags: row.normalizedTags,
                releaseDate: row.releaseDate,
                durationSec: row.durationSec,
                isrc: row.isrc,
                lyricist: row.lyricist,
                composer: row.composer,
                arranger: row.arranger,
                coverImageUrl: row.coverImageUrl,
                audioFilePath: row.audioFilePath,
                createdAt: row.createdAt,
                lyricsText: row.lyricsText,
                lyricsFilePath: row.lyricsFilePath,
                priceMusicOnly: row.priceMusicOnly ? Number(row.priceMusicOnly) : undefined,
                priceLyricsOnly: row.priceLyricsOnly ? Number(row.priceLyricsOnly) : undefined,
                rewardPerPlay: row.rewardPerPlay ? Number(row.rewardPerPlay) : undefined,
                maxPlayCount: row.maxPlayCount ? Number(row.maxPlayCount) : undefined,
                maxRewardLimit: row.maxRewardLimit ? Number(row.maxRewardLimit) : 0,
                grade: row.grade
            };
        }
        catch (error) {
            console.error('음원 상세 조회 실패:', error);
            throw new Error(`음원 상세 조회 실패: ${error.message}`);
        }
    }
    async getLyricsFileInfo(musicId) {
        const rows = await this.db
            .select({ lyrics_text: schema_1.musics.lyrics_text, lyrics_file_path: schema_1.musics.lyrics_file_path })
            .from(schema_1.musics)
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId))
            .limit(1);
        if (!rows || rows.length === 0) {
            throw new Error('음원을 찾을 수 없습니다.');
        }
        const { lyrics_text, lyrics_file_path } = rows[0];
        if (lyrics_text && String(lyrics_text).trim().length > 0) {
            return { hasText: true, text: String(lyrics_text), hasFile: false };
        }
        if (!lyrics_file_path) {
            return { hasText: false, hasFile: false };
        }
        const baseDir = process.env.LYRICS_BASE_DIR
            ? path.resolve(process.env.LYRICS_BASE_DIR)
            : path.resolve(process.cwd(), 'lyrics');
        let relativePath = String(lyrics_file_path).replace(/^[/\\]+/, '');
        relativePath = relativePath.replace(/^lyrics[\\/]/i, '');
        const absPath = path.resolve(baseDir, relativePath);
        if (!absPath.startsWith(baseDir)) {
            throw new Error('잘못된 파일 경로입니다.');
        }
        const filename = path.basename(relativePath) || 'lyrics.txt';
        return { hasText: false, hasFile: true, absPath, filename };
    }
    async getRewardsTrend(musicId, query) {
        const segment = (query.segment ?? 'category');
        if (query.granularity === 'daily') {
            const ym = (0, date_util_2.resolveYearMonthKST)(query.yearMonth);
            const [y, m] = ym.split('-').map(Number);
            const sqlQ = (0, trend_queries_1.buildMusicTrendDailyQuery)({
                musicId,
                year: y,
                month: m,
                type: query.type,
                segment,
            });
            const res = await this.db.execute(sqlQ);
            const labels = [];
            const current = [];
            const industry = [];
            for (const row of res.rows) {
                labels.push(String(row.label));
                current.push(Number(row.current_cnt || 0));
                industry.push(Number(row.industry_avg || 0));
            }
            return {
                labels,
                series: [
                    { label: '현재 음원', data: current },
                    { label: '업계 평균', data: industry },
                ],
                meta: { granularity: 'daily', type: query.type, segment, yearMonth: ym },
            };
        }
        else {
            const now = new Date();
            const kst = new Date(now.getTime() + 9 * 3600 * 1000);
            const endYear = kst.getUTCFullYear();
            const endMonth = kst.getUTCMonth() + 1;
            const months = query.months && query.months > 0 ? query.months : 12;
            const sqlQ = (0, trend_queries_1.buildMusicTrendMonthlyQuery)({
                musicId,
                endYear,
                endMonth,
                months,
                type: query.type,
                segment,
            });
            const res = await this.db.execute(sqlQ);
            const labels = [];
            const current = [];
            const industry = [];
            for (const row of res.rows) {
                labels.push(String(row.label));
                current.push(Number(row.current_cnt || 0));
                industry.push(Number(row.industry_avg || 0));
            }
            return {
                labels,
                series: [
                    { label: '현재 음원', data: current },
                    { label: '업계 평균', data: industry },
                ],
                meta: { granularity: 'monthly', type: query.type, segment, months },
            };
        }
    }
    async getCompanyUsage(musicId, query) {
        const ym = (0, date_util_2.resolveYearMonthKST)(query.yearMonth);
        const [y, m] = ym.split('-').map(Number);
        const { page = 1, limit = 20, search } = query;
        const { offset, page: p, limit: l } = (0, pagination_util_1.normalizePagination)(page, limit, 100);
        const listSql = (0, company_usage_queries_1.buildMusicCompanyUsageListQuery)({ musicId, year: y, month: m, search, limit: l, offset });
        const countSql = (0, company_usage_queries_1.buildMusicCompanyUsageCountQuery)({ musicId, year: y, month: m, search });
        const [listRes, countRes] = await Promise.all([this.db.execute(listSql), this.db.execute(countSql)]);
        const items = (listRes.rows || []).map((r, idx) => ({
            rank: offset + idx + 1,
            companyId: Number(r.company_id),
            companyName: r.company_name,
            tier: (String(r.grade || '')[0].toUpperCase() + String(r.grade || '').slice(1)),
            monthlyEarned: Number(r.monthly_earned || 0),
            monthlyPlays: Number(r.monthly_plays || 0),
        }));
        const total = Number(countRes.rows?.[0]?.total || 0);
        return { yearMonth: ym, total, page: p, limit: l, items };
    }
    async getTotalCount(query) {
        const ym = query.yearMonth ?? (0, date_util_1.getDefaultYearMonthKST)();
        const [y, m] = ym.split('-').map(Number);
        const endTsSql = (0, drizzle_orm_1.sql) `
      (make_timestamptz(${y}, ${m}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second'
    `;
        const q = (0, drizzle_orm_1.sql) `
      SELECT COUNT(*)::int AS total
      FROM ${schema_1.musics} m
      WHERE m.created_at <= ${endTsSql}
    `;
        const res = await this.db.execute(q);
        const total = Number(res.rows?.[0]?.total ?? 0);
        return { total, asOf: ym };
    }
    async getValidPlaysStats(query) {
        const ym = query.yearMonth ?? (0, date_util_1.getDefaultYearMonthKST)();
        const [y, m] = ym.split('-').map(Number);
        const cte = (0, date_util_3.buildMonthRangeCTE)(y, m);
        const q = (0, drizzle_orm_1.sql) `
      ${cte}
      SELECT
        COUNT(*) FILTER (WHERE mp.is_valid_play = true)::bigint AS valid_plays,
        COUNT(*)::bigint AS total_plays,
        COUNT(*) FILTER (WHERE mp.is_valid_play = true AND mp.reward_code = '1')::bigint AS rewarded_plays
      FROM music_plays mp, month_range mr
      WHERE mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
    `;
        const res = await this.db.execute(q);
        const row = res.rows?.[0] || {};
        const validPlays = Number(row.valid_plays ?? 0);
        const rewardedPlays = Number(row.rewarded_plays ?? 0);
        const rewardRate = validPlays > 0 ? Math.round((rewardedPlays / validPlays) * 100) : 0;
        return {
            validPlays,
            totalPlays: Number(row.total_plays ?? 0),
            rewardedPlays,
            rewardRate,
            asOf: ym,
        };
    }
    async getRevenueForecast(query) {
        const ym = query.yearMonth ?? (0, date_util_1.getDefaultYearMonthKST)();
        const [y, m] = ym.split('-').map(Number);
        const current = (0, date_util_3.isCurrentYM)(ym);
        const cte = (0, date_util_3.buildMonthRangeCTE)(y, m);
        const qCurrent = (0, drizzle_orm_1.sql) `
      ${cte}
      SELECT 
        COALESCE(SUM(subscription_revenue), 0) - COALESCE(SUM(usage_revenue), 0) AS mtd
      FROM (
        -- 구독료 (결제일 기준)
        SELECT 
          COALESCE(SUM(cs.actual_paid_amount), 0) AS subscription_revenue,
          0 AS usage_revenue
        FROM company_subscriptions cs
        JOIN companies c ON c.id = cs.company_id
        CROSS JOIN month_range mr
        WHERE c.grade <> 'free'
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') >= mr.month_start
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') <= NOW()
        
        UNION ALL
        
        -- 사용료 (유효재생 기준) - 차감
        SELECT 
          0 AS subscription_revenue,
          COALESCE(SUM(
            CASE 
              WHEN mp.use_case = '0' OR mp.use_case = '1' THEN m.price_per_play::numeric
              WHEN mp.use_case = '2' AND m.inst = false THEN m.lyrics_price::numeric
              ELSE 0
            END
          ), 0) AS usage_revenue
        FROM music_plays mp
        JOIN musics m ON m.id = mp.music_id
        CROSS JOIN month_range mr
        WHERE mp.is_valid_play = true
          AND mp.created_at >= mr.month_start
          AND mp.created_at <= NOW()
      ) revenue_data
    `;
        const qPast = (0, drizzle_orm_1.sql) `
      ${cte}
      SELECT 
        COALESCE(SUM(subscription_revenue), 0) - COALESCE(SUM(usage_revenue), 0) AS mtd
      FROM (
        -- 구독료 (결제일 기준)
        SELECT 
          COALESCE(SUM(cs.actual_paid_amount), 0) AS subscription_revenue,
          0 AS usage_revenue
        FROM company_subscriptions cs
        JOIN companies c ON c.id = cs.company_id
        CROSS JOIN month_range mr
        WHERE c.grade <> 'free'
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') >= mr.month_start
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') <= mr.month_end
        
        UNION ALL
        
        -- 사용료 (유효재생 기준) - 차감
        SELECT 
          0 AS subscription_revenue,
          COALESCE(SUM(
            CASE 
              WHEN mp.use_case = '0' OR mp.use_case = '1' THEN m.price_per_play::numeric
              WHEN mp.use_case = '2' AND m.inst = false THEN m.lyrics_price::numeric
              ELSE 0
            END
          ), 0) AS usage_revenue
        FROM music_plays mp
        JOIN musics m ON m.id = mp.music_id
        CROSS JOIN month_range mr
        WHERE mp.is_valid_play = true
          AND mp.created_at >= mr.month_start
          AND mp.created_at <= mr.month_end
      ) revenue_data
    `;
        const res = await this.db.execute(current ? qCurrent : qPast);
        const row = res.rows?.[0] || {};
        const mtd = Number(row.mtd ?? 0);
        return { mtd, forecast: mtd, asOf: ym };
    }
    async getRewardsFilledStats(query) {
        const ym = (0, date_util_3.resolveYearMonthKST)(query.yearMonth);
        const [y, m] = ym.split('-').map(Number);
        const cte = (0, date_util_3.buildMonthRangeCTE)(y, m);
        const q = (0, drizzle_orm_1.sql) `
      ${cte}
        , plays AS (
        SELECT 
          mp.music_id,
          COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS valid_plays,
          COALESCE(SUM(CASE WHEN mp.is_valid_play = true AND mp.reward_code = '1' THEN mp.reward_amount::numeric ELSE 0 END), 0) AS earned,
          COUNT(*) FILTER (WHERE mp.is_valid_play = true AND mp.reward_code IN ('2', '3')) AS limit_exhausted_plays
        FROM music_plays mp, month_range mr
        WHERE mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
        GROUP BY mp.music_id
      )
      SELECT
        COUNT(*) FILTER (WHERE mmr.total_reward_count > 0)::bigint AS eligible,
        COUNT(*) FILTER (
          WHERE mmr.total_reward_count > 0 AND COALESCE(p.limit_exhausted_plays, 0) > 0
        )::bigint AS filled
      FROM monthly_music_rewards mmr
      LEFT JOIN plays p ON p.music_id = mmr.music_id
      WHERE mmr.year_month = ${ym}
    `;
        const res = await this.db.execute(q);
        const row = res.rows?.[0] || {};
        const eligible = Number(row.eligible ?? 0);
        const filled = Number(row.filled ?? 0);
        const ratio = eligible > 0 ? Math.round((filled / eligible) * 100) : null;
        return { eligible, filled, ratio, asOf: ym };
    }
    async getCategoryTop5(query) {
        const ym = (0, date_util_3.resolveYearMonthKST)(query.yearMonth);
        const [y, m] = ym.split('-').map(Number);
        const limit = Math.min(Math.max(query.limit ?? 5, 1), 20);
        const tz = 'Asia/Seoul';
        const q = (0, stats_queries_1.buildCategoryTop5Query)(y, m, tz, limit);
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const items = rows.map((r) => ({
            category: r.category || '미분류',
            validPlays: Number(r.valid_plays || 0),
            rank: Number(r.rank || 0),
        }));
        return { yearMonth: ym, items };
    }
    async getRealtimeApiStatus(query) {
        const limit = Math.min(Math.max(query.limit ?? 5, 1), 20);
        const q = (0, drizzle_orm_1.sql) `
      SELECT 
        mp.created_at,
        CASE WHEN mp.is_valid_play THEN 'success' ELSE 'error' END AS status,
        CASE 
          WHEN mp.use_case = '0' THEN '/api/music/play'
          WHEN mp.use_case = '1' THEN '/api/music/play'
          WHEN mp.use_case = '2' THEN '/api/lyrics/get'
          ELSE '/api/unknown'
        END AS endpoint,
        CASE 
          WHEN mp.use_case = '0' THEN '음원 호출'
          WHEN mp.use_case = '1' THEN '음원 호출'
          WHEN mp.use_case = '2' THEN '가사 호출'
          ELSE '알 수 없음'
        END AS call_type,
        CASE 
          WHEN mp.is_valid_play THEN '유효재생'
          ELSE '무효재생'
        END AS validity,
        c.name AS company
      FROM music_plays mp
      JOIN companies c ON c.id = mp.using_company_id
      ORDER BY mp.created_at DESC
      LIMIT ${limit}
    `;
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const items = rows.map((r) => ({
            status: r.status === 'success' ? 'success' : 'error',
            endpoint: r.endpoint || '/api/unknown',
            callType: r.call_type || '알 수 없음',
            validity: r.validity || '무효재생',
            company: r.company || 'Unknown',
            timestamp: r.timestamp || '00:00:00',
        }));
        return { items };
    }
    async getRealtimeApiCalls(query) {
        const limit = Math.min(Math.max(query.limit ?? 5, 1), 20);
        const q = (0, drizzle_orm_1.sql) `
      SELECT 
        mp.created_at,
        CASE WHEN mp.is_valid_play THEN 'success' ELSE 'error' END AS status,
        CASE 
          WHEN mp.use_case = '0' THEN '/api/music/play'
          WHEN mp.use_case = '1' THEN '/api/music/play'
          WHEN mp.use_case = '2' THEN '/api/lyrics/get'
          ELSE '/api/unknown'
        END AS endpoint,
        CASE 
          WHEN mp.use_case = '0' THEN '음원 호출'
          WHEN mp.use_case = '1' THEN '음원 호출'
          WHEN mp.use_case = '2' THEN '가사 호출'
          ELSE '알 수 없음'
        END AS call_type,
        CASE 
          WHEN mp.is_valid_play THEN '유효재생'
          ELSE '무효재생'
        END AS validity,
        c.name AS company
      FROM music_plays mp
      JOIN companies c ON c.id = mp.using_company_id
      ORDER BY mp.created_at DESC
      LIMIT ${limit}
    `;
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const items = rows.map((r) => ({
            status: r.status === 'success' ? 'success' : 'error',
            endpoint: r.endpoint || '/api/unknown',
            callType: r.call_type || '알 수 없음',
            validity: r.validity || '무효재생',
            company: r.company || 'Unknown',
            timestamp: r.timestamp || '00:00:00',
        }));
        return { items };
    }
    async getRealtimeTopTracks(query) {
        const limit = Math.min(Math.max(query.limit ?? 10, 1), 50);
        const q = (0, stats_queries_1.buildRealtimeTopTracksQuery)(limit);
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const items = rows.map((r) => ({
            rank: Number(r.rank || 0),
            title: r.title || 'Unknown Track',
            validPlays: Number(r.valid_plays || 0),
            totalPlays: Number(r.total_plays || 0),
            validRate: Number(r.valid_rate || 0),
        }));
        return { items };
    }
    async getRealtimeTransactions(query) {
        const limit = Math.min(Math.max(query.limit ?? 3, 1), 10);
        const q = (0, stats_queries_1.buildRealtimeTransactionsQuery)(limit);
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const items = rows.map((r) => ({
            timestamp: r.timestamp || '00:00:00',
            status: r.status === 'success' ? 'success' : r.status === 'pending' ? 'pending' : 'failed',
            processedCount: r.processed_count || '0/0',
            gasFee: r.gas_fee || '0.000 ETH',
            hash: r.hash || '0x0000...0000',
        }));
        return { items };
    }
    sanitizeFilename(name) {
        const base = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
        return base.replace(/[^a-zA-Z0-9._-]+/g, '_');
    }
    async saveUploadedFiles(files) {
        try {
            const musicBaseDir = process.env.MUSIC_BASE_DIR
                ? path.resolve(process.env.MUSIC_BASE_DIR)
                : path.resolve(process.cwd(), 'music');
            const lyricsBaseDir = process.env.LYRICS_BASE_DIR
                ? path.resolve(process.env.LYRICS_BASE_DIR)
                : path.resolve(process.cwd(), 'lyrics');
            const imagesBaseDir = process.env.IMAGES_BASE_DIR
                ? path.resolve(process.env.IMAGES_BASE_DIR)
                : path.resolve(process.cwd(), 'images');
            await fs.mkdir(musicBaseDir, { recursive: true });
            await fs.mkdir(lyricsBaseDir, { recursive: true });
            await fs.mkdir(imagesBaseDir, { recursive: true });
            let audioFilePath;
            let lyricsFilePath;
            let coverImagePath;
            if (files.audio && files.audio[0]) {
                const file = files.audio[0];
                const original = this.sanitizeFilename(file.originalname || 'audio');
                const timestamp = Date.now();
                const filename = `${timestamp}_${original}`;
                const abs = path.resolve(musicBaseDir, filename);
                await fs.writeFile(abs, file.buffer);
                audioFilePath = filename;
            }
            if (files.lyrics && files.lyrics[0]) {
                const file = files.lyrics[0];
                const original = this.sanitizeFilename(file.originalname || 'lyrics.txt');
                const timestamp = Date.now();
                const filename = `${timestamp}_${original}`;
                const abs = path.resolve(lyricsBaseDir, filename);
                let outBuffer = file.buffer;
                if (outBuffer.length >= 2) {
                    const b0 = outBuffer[0];
                    const b1 = outBuffer[1];
                    if (b0 === 0xFF && b1 === 0xFE) {
                        const td = new TextDecoder('utf-16le');
                        const text = td.decode(outBuffer.subarray(2));
                        outBuffer = Buffer.from(text, 'utf-8');
                    }
                    else if (b0 === 0xFE && b1 === 0xFF) {
                        const swapped = Buffer.alloc(outBuffer.length - 2);
                        for (let i = 2; i < outBuffer.length; i += 2) {
                            const hi = outBuffer[i];
                            const lo = outBuffer[i + 1] ?? 0x00;
                            swapped[i - 2] = lo;
                            swapped[i - 1] = hi;
                        }
                        const td = new TextDecoder('utf-16le');
                        const text = td.decode(swapped);
                        outBuffer = Buffer.from(text, 'utf-8');
                    }
                }
                await fs.writeFile(abs, outBuffer);
                lyricsFilePath = filename;
            }
            if (files.cover && files.cover[0]) {
                const file = files.cover[0];
                const original = this.sanitizeFilename(file.originalname || 'cover');
                const timestamp = Date.now();
                const filename = `${timestamp}_${original}`;
                const abs = path.resolve(imagesBaseDir, filename);
                await fs.writeFile(abs, file.buffer);
                coverImagePath = filename;
            }
            return { audioFilePath, lyricsFilePath, coverImagePath };
        }
        catch (error) {
            throw new Error(`파일 저장 실패: ${error.message}`);
        }
    }
    async getCoverFile(id) {
        const rows = await this.db
            .select({ cover_image_url: schema_1.musics.cover_image_url })
            .from(schema_1.musics)
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, id))
            .limit(1);
        if (!rows || rows.length === 0) {
            throw new Error('음원을 찾을 수 없습니다.');
        }
        const cover = rows[0].cover_image_url;
        if (!cover) {
            throw new Error('커버 이미지가 없습니다.');
        }
        if (/^https?:\/\//i.test(cover)) {
            return { url: cover, isUrl: true };
        }
        const imagesBaseDir = process.env.IMAGES_BASE_DIR
            ? path.resolve(process.env.IMAGES_BASE_DIR)
            : path.resolve(process.cwd(), 'images');
        const relative = String(cover).replace(/^[/\\]+/, '');
        const absPath = path.resolve(imagesBaseDir, relative);
        if (!absPath.startsWith(imagesBaseDir)) {
            throw new Error('잘못된 파일 경로입니다.');
        }
        const ext = path.extname(relative).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const filename = path.basename(relative);
        return { absPath, filename, contentType, isUrl: false };
    }
    async update(id, updateMusicDto) {
        const forbiddenKeys = ['audioFilePath', 'coverImagePath', 'isrc', 'musicType'];
        for (const key of forbiddenKeys) {
            if (updateMusicDto[key] !== undefined) {
                throw new common_1.BadRequestException('음원 파일, 썸네일, ISRC, 음원 유형은 수정할 수 없습니다.');
            }
        }
        const updates = {};
        if (updateMusicDto.title !== undefined)
            updates.title = updateMusicDto.title;
        if (updateMusicDto.artist !== undefined)
            updates.artist = updateMusicDto.artist;
        if (updateMusicDto.releaseDate !== undefined)
            updates.release_date = updateMusicDto.releaseDate || null;
        if (updateMusicDto.priceMusicOnly !== undefined)
            updates.price_per_play = updateMusicDto.priceMusicOnly.toString();
        if (updateMusicDto.priceLyricsOnly !== undefined)
            updates.lyrics_price = updateMusicDto.priceLyricsOnly.toString();
        if (updateMusicDto.grade !== undefined)
            updates.grade = updateMusicDto.grade;
        if (updateMusicDto.lyricsFilePath !== undefined) {
            updates.lyrics_file_path = updateMusicDto.lyricsFilePath || null;
            updates.lyrics_text = null;
        }
        else if (updateMusicDto.lyricsText !== undefined) {
            updates.lyrics_text = updateMusicDto.lyricsText || null;
            updates.lyrics_file_path = null;
        }
        let oldCategoryId = null;
        if (updateMusicDto.category !== undefined) {
            const before = await this.db.select({ id: schema_1.musics.category_id }).from(schema_1.musics).where((0, drizzle_orm_1.eq)(schema_1.musics.id, id)).limit(1);
            oldCategoryId = before.length ? before[0].id : null;
        }
        if (updateMusicDto.category !== undefined) {
            const category = await this.db
                .select({ id: schema_1.music_categories.id })
                .from(schema_1.music_categories)
                .where((0, drizzle_orm_1.eq)(schema_1.music_categories.name, updateMusicDto.category))
                .limit(1);
            if (category.length === 0) {
                throw new common_1.BadRequestException('카테고리를 찾을 수 없습니다.');
            }
            updates.category_id = category[0].id;
        }
        if (Object.keys(updates).length > 0) {
            await this.db.update(schema_1.musics).set(updates).where((0, drizzle_orm_1.eq)(schema_1.musics.id, id));
        }
        if (updateMusicDto.tags !== undefined) {
            const tagArr = updateMusicDto.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);
            await this.db.delete(schema_1.music_tags).where((0, drizzle_orm_1.eq)(schema_1.music_tags.music_id, id));
            for (const tagText of tagArr) {
                await this.db.insert(schema_1.music_tags).values({ music_id: id, text: tagText, raw_tag_id: null });
            }
        }
        if (updateMusicDto.category !== undefined && oldCategoryId && updates.category_id && oldCategoryId !== updates.category_id) {
            await this.cleanupOrphanCategories();
        }
        return { message: '음원 정보가 수정되었습니다.', id };
    }
    async cleanupOrphanCategories() {
        await this.db.execute((0, musics_queries_1.buildCleanupOrphanCategoriesQuery)());
    }
    async delete(ids) {
        try {
            const existingMusics = await this.db.select({ id: schema_1.musics.id }).from(schema_1.musics).where((0, drizzle_orm_1.inArray)(schema_1.musics.id, ids));
            const existingIds = existingMusics.map(m => m.id);
            const missingIds = ids.filter(id => !existingIds.includes(id));
            if (missingIds.length > 0) {
                throw new Error(`음원 ID ${missingIds.join(', ')}를 찾을 수 없습니다.`);
            }
            await this.db.delete(schema_1.monthly_music_rewards).where((0, drizzle_orm_1.inArray)(schema_1.monthly_music_rewards.music_id, ids));
            await this.db.delete(schema_1.music_tags).where((0, drizzle_orm_1.inArray)(schema_1.music_tags.music_id, ids));
            await this.db.delete(schema_1.music_plays).where((0, drizzle_orm_1.inArray)(schema_1.music_plays.music_id, ids));
            await this.db.delete(schema_1.musics).where((0, drizzle_orm_1.inArray)(schema_1.musics.id, ids));
            await this.cleanupOrphanCategories();
            const message = ids.length === 1
                ? `음원 ID ${ids[0]} 삭제 완료`
                : `${ids.length}개 음원 일괄 삭제 완료`;
            return {
                message,
                deletedIds: ids,
                summary: {
                    total: ids.length,
                    success: ids.length,
                    failed: 0
                }
            };
        }
        catch (error) {
            throw new Error(`음원 삭제 실패: ${error.message}`);
        }
    }
    async updateNextMonthRewards(musicId, dto) {
        const now = new Date();
        const y = now.getUTCFullYear();
        const m = now.getUTCMonth();
        const current = new Date(Date.UTC(y, m, 1));
        const ym = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}`;
        const currentData = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT total_reward_count, remaining_reward_count
      FROM monthly_music_rewards
      WHERE music_id = ${musicId} AND year_month = ${ym}
    `);
        console.log('조회된 데이터:', {
            musicId,
            yearMonth: ym,
            rowsCount: currentData.rows?.length || 0,
            rows: currentData.rows
        });
        const usedCountResult = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT COALESCE(SUM(use_price), 0) as used_count
      FROM music_plays 
      WHERE music_id = ${musicId} 
        AND is_valid_play = true
        AND EXTRACT(YEAR FROM created_at) = ${parseInt(ym.split('-')[0])}
        AND EXTRACT(MONTH FROM created_at) = ${parseInt(ym.split('-')[1])}
    `);
        const usedCount = Number(usedCountResult.rows?.[0]?.used_count || 0);
        let newRemainingCount = dto.totalRewardCount;
        if (dto.totalRewardCount > usedCount) {
            newRemainingCount = dto.totalRewardCount - usedCount;
        }
        else {
            newRemainingCount = 0;
        }
        console.log('리워드 수정 로직:', {
            musicId,
            yearMonth: ym,
            usedCount,
            newTotal: dto.totalRewardCount,
            newRemaining: newRemainingCount
        });
        try {
            if (dto.removeReward === true) {
                await this.db
                    .update(schema_1.musics)
                    .set({ grade: dto.grade || 0 })
                    .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId));
                const existingRecord = await this.db
                    .select()
                    .from(schema_1.monthly_music_rewards)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId), (0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.year_month, ym)))
                    .limit(1);
                if (existingRecord.length > 0) {
                    await this.db
                        .update(schema_1.monthly_music_rewards)
                        .set({
                        total_reward_count: 0,
                        remaining_reward_count: 0,
                        reward_per_play: '0',
                        updated_at: new Date(),
                    })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId), (0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.year_month, ym)));
                }
                else {
                    await this.db
                        .insert(schema_1.monthly_music_rewards)
                        .values({
                        music_id: musicId,
                        year_month: ym,
                        total_reward_count: 0,
                        remaining_reward_count: 0,
                        reward_per_play: '0',
                    });
                }
            }
            else {
                await this.db
                    .update(schema_1.musics)
                    .set({ grade: 1 })
                    .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId));
                const existingRecord = await this.db
                    .select()
                    .from(schema_1.monthly_music_rewards)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId), (0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.year_month, ym)))
                    .limit(1);
                if (existingRecord.length > 0) {
                    await this.db
                        .update(schema_1.monthly_music_rewards)
                        .set({
                        total_reward_count: dto.totalRewardCount,
                        remaining_reward_count: newRemainingCount,
                        reward_per_play: dto.rewardPerPlay.toString(),
                        updated_at: new Date(),
                    })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.music_id, musicId), (0, drizzle_orm_1.eq)(schema_1.monthly_music_rewards.year_month, ym)));
                }
                else {
                    await this.db
                        .insert(schema_1.monthly_music_rewards)
                        .values({
                        music_id: musicId,
                        year_month: ym,
                        total_reward_count: dto.totalRewardCount,
                        remaining_reward_count: newRemainingCount,
                        reward_per_play: dto.rewardPerPlay.toString(),
                    });
                }
            }
        }
        catch (error) {
            console.error('리워드 업데이트 실패:', error);
            throw error;
        }
        return { message: '현재 달 리워드가 업데이트되었습니다.', musicId, yearMonth: ym };
    }
};
exports.MusicsService = MusicsService;
exports.MusicsService = MusicsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [Object])
], MusicsService);
//# sourceMappingURL=musics.service.js.map