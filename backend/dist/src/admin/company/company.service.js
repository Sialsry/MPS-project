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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const date_util_1 = require("../../common/utils/date.util");
const pagination_util_1 = require("../../common/utils/pagination.util");
const sort_util_1 = require("../../common/utils/sort.util");
const rewards_queries_1 = require("./queries/rewards.queries");
const stats_queries_1 = require("./queries/stats.queries");
const app_config_1 = require("../../config/app.config");
let CompanyService = class CompanyService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getRewardsSummary(params) {
        const tz = 'Asia/Seoul';
        const yearMonth = (0, date_util_1.isValidYearMonth)(params.yearMonth) ? params.yearMonth : (0, date_util_1.getDefaultYearMonthKST)();
        const [ymYear, ymMonth] = yearMonth.split('-').map(Number);
        const { page, limit, offset } = (0, pagination_util_1.normalizePagination)(params.page, params.limit, 100);
        const search = (params.search || '').trim();
        const hasSearch = search.length > 0;
        const tier = params.tier && params.tier !== 'all' ? params.tier : null;
        const { sortBy, order } = (0, sort_util_1.normalizeSort)(params.sortBy, params.order, ['company_id', 'name', 'grade', 'total_tokens', 'monthly_earned', 'monthly_used', 'usage_rate', 'active_tracks']);
        const baseQuery = (0, rewards_queries_1.buildSummaryListBaseQuery)(ymYear, ymMonth, tz);
        const filtered = (0, drizzle_orm_1.sql) `${baseQuery}
      ${hasSearch ? (0, drizzle_orm_1.sql) `AND (c.name ILIKE ${'%' + search + '%'} OR CAST(c.id AS TEXT) ILIKE ${'%' + search + '%'})` : (0, drizzle_orm_1.sql) ``}
      ${tier ? (0, drizzle_orm_1.sql) `AND c.grade = ${tier}` : (0, drizzle_orm_1.sql) ``}
    `;
        const totalResult = await this.db.execute((0, drizzle_orm_1.sql) `SELECT COUNT(*) as count FROM (${filtered}) t`);
        const totalRows = totalResult.rows ?? [];
        const total = Number(totalRows[0]?.count ?? 0);
        const pageResult = await this.db.execute((0, drizzle_orm_1.sql) `${filtered} ORDER BY ${drizzle_orm_1.sql.raw(sortBy)} ${drizzle_orm_1.sql.raw(order)} LIMIT ${limit} OFFSET ${offset}`);
        const rows = pageResult.rows ?? [];
        const items = rows.map((r) => ({
            companyId: Number(r.company_id),
            name: r.name,
            tier: String(r.grade),
            totalTokens: Number(r.total_tokens ?? 0),
            monthlyEarned: Number(r.monthly_earned ?? 0),
            monthlyUsed: Number(r.monthly_used ?? 0),
            usageRate: Number(r.usage_rate ?? 0),
            activeTracks: Number(r.active_tracks ?? 0),
            action: 'detail',
        }));
        return { items, page, limit, total, yearMonth };
    }
    async getRewardsDetail(companyId, yearMonth) {
        const tz = 'Asia/Seoul';
        const ym = (0, date_util_1.resolveYearMonthKST)(yearMonth);
        const [ymYear, ymMonth] = ym.split('-').map(Number);
        const summaryRes = await this.db.execute((0, rewards_queries_1.buildSummaryQuery)(companyId, ymYear, ymMonth, tz));
        const base = summaryRes.rows?.[0];
        if (!base) {
            return { company: { id: companyId, name: '', tier: 'free' }, summary: { totalTokens: 0, monthlyEarned: 0, monthlyUsed: 0, usageRate: 0, activeTracks: 0, yearMonth: ym }, daily: [], dailyIndustryAvg: [], monthly: [], monthlyIndustryAvg: [], byMusic: [] };
        }
        const [dailyRes, dailyIndustryRes, byMusicRes, monthlyCompanyRes, monthlyIndustryRes] = await Promise.all([
            this.db.execute((0, rewards_queries_1.buildDailyQuery)(companyId, ymYear, ymMonth, tz)),
            this.db.execute((0, rewards_queries_1.buildDailyIndustryAvgQuery)(ymYear, ymMonth, tz)),
            this.db.execute((0, rewards_queries_1.buildByMusicQuery)(companyId, ymYear, ymMonth, tz)),
            this.db.execute((0, rewards_queries_1.buildMonthlyCompanyQuery)(companyId, ymYear, ymMonth, 12, tz)),
            this.db.execute((0, rewards_queries_1.buildMonthlyIndustryAvgQuery)(ymYear, ymMonth, 12, tz)),
        ]);
        const tierText = String(base.grade) === 'business' ? 'Business' : String(base.grade) === 'standard' ? 'Standard' : 'Free';
        const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
        return {
            company: {
                id: Number(base.company_id),
                name: base.name,
                tier: tierText,
                businessNumber: base.business_number,
                contactEmail: base.email,
                contactPhone: base.phone,
                homepageUrl: base.homepage_url,
                profileImageUrl: base.profile_image_url,
                smartAccountAddress: base.smart_account_address,
                ceoName: base.ceo_name,
                createdAt: fmt(base.created_at),
                updatedAt: fmt(base.updated_at),
                subscriptionStart: fmt(base.subscription_start),
                subscriptionEnd: fmt(base.subscription_end),
            },
            summary: {
                totalTokens: Number(base.total_tokens || 0),
                monthlyEarned: Number(base.monthly_earned || 0),
                monthlyUsed: Number(base.monthly_used || 0),
                usageRate: Number(base.usage_rate || 0),
                activeTracks: Number(base.active_tracks || 0),
                yearMonth: ym,
                earnedTotal: Number(base.earned_total || 0),
                usedTotal: Number(base.used_total || 0),
            },
            daily: (dailyRes.rows || []).map((r) => ({ date: r.date, earned: Number(r.earned || 0), used: Number(r.used || 0) })),
            dailyIndustryAvg: (dailyIndustryRes.rows || []).map((r) => ({ date: r.date, earned: Number(r.earned || 0) })),
            monthly: (monthlyCompanyRes.rows || []).map((r) => ({ yearMonth: r.year_month, earned: Number(r.earned || 0) })),
            monthlyIndustryAvg: (monthlyIndustryRes.rows || []).map((r) => ({ yearMonth: r.year_month, earned: Number(r.earned || 0) })),
            byMusic: (byMusicRes.rows || []).map((r) => ({ musicId: Number(r.music_id), title: r.title, artist: r.artist, category: r.category ?? null, musicCalls: Number(r.music_calls || 0), lyricsCalls: Number(r.lyrics_calls || 0), earned: Number(r.earned || 0), lastUsedAt: r.last_used_at || null })),
        };
    }
    create(createCompanyDto) {
        return 'This action adds a new company';
    }
    findAll() {
        return `This action returns all company`;
    }
    findOne(id) {
        return `This action returns a #${id} company`;
    }
    update(id, updateCompanyDto) {
        return `This action updates a #${id} company`;
    }
    remove(id) {
        return `This action removes a #${id} company`;
    }
    async getTotalCount(query) {
        const ym = query.yearMonth ?? (0, date_util_1.getDefaultYearMonthKST)();
        const [y, m] = ym.split('-').map(Number);
        const endTsSql = (0, drizzle_orm_1.sql) `
      (make_timestamptz(${y}, ${m}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second'
    `;
        const q = (0, drizzle_orm_1.sql) `SELECT COUNT(*)::int AS total FROM companies c WHERE c.created_at <= ${endTsSql}`;
        const res = await this.db.execute(q);
        const total = Number(res.rows?.[0]?.total ?? 0);
        return { total, asOf: ym };
    }
    async getRenewalStats(query) {
        const tz = 'Asia/Seoul';
        const ym = (0, date_util_1.resolveYearMonthKST)(query.yearMonth);
        const [y, m] = ym.split('-').map(Number);
        const prevY = m === 1 ? y - 1 : y;
        const prevM = m === 1 ? 12 : (m - 1);
        const q = (0, stats_queries_1.buildRenewalStatsQuery)(y, m, tz);
        const res = await this.db.execute(q);
        const row = res.rows?.[0] || {};
        const prevActive = Number(row.prev_active || 0);
        const currActive = Number(row.curr_active || 0);
        const retained = Number(row.retained || 0);
        const churned = Number(row.churned || 0);
        const reactivated = Number(row.reactivated || 0);
        const rate = prevActive > 0 ? Math.round((retained / prevActive) * 100) : null;
        return { asOf: ym, prevActive, currActive, retained, churned, reactivated, rate };
    }
    async getHourlyValidPlays(query) {
        const tz = 'Asia/Seoul';
        const toDate = (s) => {
            if (s && /^\d{4}-\d{2}-\d{2}$/.test(s))
                return s;
            const now = new Date();
            const kst = new Date(now.getTime() + 9 * 3600 * 1000);
            const y = kst.getUTCFullYear();
            const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
            const d = String(kst.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };
        const date = toDate(query.date);
        const [y, m, d] = date.split('-').map(Number);
        const q = (0, stats_queries_1.buildHourlyValidPlaysQuery)(y, m, d, tz);
        const res = await this.db.execute(q);
        const rows = res.rows || [];
        const labels = rows.map((r) => `${Number(r.h)}시`);
        const free = rows.map((r) => ({
            total: Number(r.free_total || 0),
            valid: Number(r.free_valid || 0),
            lyrics: Number(r.free_lyrics || 0)
        }));
        const standard = rows.map((r) => ({
            total: Number(r.standard_total || 0),
            valid: Number(r.standard_valid || 0),
            lyrics: Number(r.standard_lyrics || 0)
        }));
        const business = rows.map((r) => ({
            total: Number(r.business_total || 0),
            valid: Number(r.business_valid || 0),
            lyrics: Number(r.business_lyrics || 0)
        }));
        const prevAvg = rows.map((r) => Number(r.prev_avg || 0));
        return { date, labels, free, standard, business, prevAvg };
    }
    async getTierDistribution(query) {
        const tz = 'Asia/Seoul';
        const ym = (0, date_util_1.resolveYearMonthKST)(query.yearMonth);
        const [y, m] = ym.split('-').map(Number);
        const q = (0, stats_queries_1.buildTierDistributionQuery)(y, m, tz);
        const res = await this.db.execute(q);
        const row = res.rows?.[0] || {};
        const free = Number(row.free || 0);
        const standard = Number(row.standard || 0);
        const business = Number(row.business || 0);
        const total = Number(row.total || 0);
        return { yearMonth: ym, free, standard, business, total };
    }
    async getRevenueCalendar(query) {
        const ym = (0, date_util_1.resolveYearMonthKST)(query.yearMonth);
        const [y, m] = ym.split('-').map(Number);
        const tz = 'Asia/Seoul';
        const q = (0, stats_queries_1.buildRevenueCalendarQuery)(y, m, tz);
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const days = rows.map((r) => ({
            date: r.date || '',
            subscriptionRevenue: Number(r.subscription_revenue || 0),
            usageRevenue: Number(r.usage_revenue || 0),
            totalRevenue: Number(r.total_revenue || 0),
        }));
        const monthlySummary = {
            subscriptionRevenue: days.reduce((sum, day) => sum + day.subscriptionRevenue, 0),
            usageRevenue: days.reduce((sum, day) => sum + day.usageRevenue, 0),
            totalRevenue: days.reduce((sum, day) => sum + day.totalRevenue, 0),
        };
        return { yearMonth: ym, days, monthlySummary };
    }
    async getRevenueTrends(query) {
        const startYear = query.year ?? 2024;
        const startMonth = 10;
        const months = Math.min(Math.max(query.months ?? 15, 1), 24);
        const q = (0, stats_queries_1.buildRevenueTrendsQuery)(startYear, startMonth, months);
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const items = rows.map((r) => {
            const standardSub = Number(r.standard_subscription || 0);
            const businessSub = Number(r.business_subscription || 0);
            const generalUsage = Number(r.general_usage || 0);
            const lyricsUsage = Number(r.lyrics_usage || 0);
            const instrumentalUsage = Number(r.instrumental_usage || 0);
            const year = r.year || app_config_1.APP_CONFIG.REVENUE.DEFAULT_START_YEAR + 1;
            const monthNum = r.month || 1;
            const monthLabel = year === app_config_1.APP_CONFIG.REVENUE.DEFAULT_START_YEAR ? `${monthNum}월(24)` : `${monthNum}월`;
            return {
                month: monthLabel,
                subscriptionRevenue: {
                    standard: standardSub,
                    business: businessSub,
                    total: standardSub + businessSub,
                },
                usageRevenue: {
                    general: generalUsage,
                    lyrics: lyricsUsage,
                    instrumental: instrumentalUsage,
                    total: generalUsage + lyricsUsage + instrumentalUsage,
                },
                totalRevenue: standardSub + businessSub + generalUsage + lyricsUsage + instrumentalUsage,
            };
        });
        return { year: startYear, items };
    }
    async getRevenueCompanies(query) {
        const grade = query.grade || 'standard';
        const limit = Math.min(Math.max(query.limit ?? 5, 1), 20);
        const q = (0, stats_queries_1.buildRevenueCompaniesCumulativeQuery)(grade, limit);
        const res = await this.db.execute(q);
        const rows = (res.rows || []);
        const items = rows.map((r) => ({
            rank: Number(r.rank || 0),
            companyId: Number(r.company_id || 0),
            companyName: r.company_name || 'Unknown',
            grade: r.grade || grade,
            subscriptionRevenue: Number(r.subscription_revenue || 0),
            usageRevenue: Number(r.usage_revenue || 0),
            totalRevenue: Number(r.total_revenue || 0),
            percentage: Number(r.percentage || 0),
            growth: '+0.0%',
        }));
        const now = new Date();
        const ymStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return { yearMonth: ymStr, grade, items };
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [Object])
], CompanyService);
//# sourceMappingURL=company.service.js.map