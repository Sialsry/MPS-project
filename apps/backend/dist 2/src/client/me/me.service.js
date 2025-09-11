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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeService = void 0;
const common_1 = require("@nestjs/common");
const dayjs_1 = __importDefault(require("dayjs"));
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const me_rewards_dto_1 = require("./dto/me-rewards.dto");
const TZ = 'Asia/Seoul';
let MeService = MeService_1 = class MeService {
    db;
    logger = new common_1.Logger(MeService_1.name);
    constructor(db) {
        this.db = db;
    }
    PLAN_PRICE = {
        standard: 19000,
        business: 29000,
    };
    buildSelect(entries) {
        const filtered = entries.filter(([, v]) => v !== undefined && v !== null);
        const obj = Object.fromEntries(filtered);
        for (const [k, v] of Object.entries(obj)) {
            if (v === undefined || v === null) {
                throw new Error(`[buildSelect] "${k}" is ${v}`);
            }
        }
        return obj;
    }
    async getMe(companyId) {
        const companySelect = this.buildSelect([
            ['id', schema_1.companies.id],
            ['name', schema_1.companies.name],
            ['grade', schema_1.companies.grade],
            ['ceo_name', schema_1.companies.ceo_name],
            ['phone', schema_1.companies.phone],
            ['homepage_url', schema_1.companies.homepage_url],
            ['profile_image_url', schema_1.companies.profile_image_url],
            ['smart_account_address', schema_1.companies.smart_account_address],
            ['total_rewards_earned', schema_1.companies.total_rewards_earned],
            ['total_rewards_used', schema_1.companies.total_rewards_used],
        ]);
        const [company] = await this.db
            .select(companySelect)
            .from(schema_1.companies)
            .where((0, drizzle_orm_1.eq)(schema_1.companies.id, (companyId)))
            .limit(1);
        const reservedCol = schema_1.company_subscriptions.reserved_mileage_next_payment;
        const subSelect = {
            id: schema_1.company_subscriptions.id,
            company_id: schema_1.company_subscriptions.company_id,
            tier: schema_1.company_subscriptions.tier,
            start_date: schema_1.company_subscriptions.start_date,
            end_date: schema_1.company_subscriptions.end_date,
            ...(reservedCol ? { reserved_next: reservedCol } : {}),
        };
        const [sub] = await this.db
            .select(subSelect)
            .from(schema_1.company_subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.company_subscriptions.company_id, companyId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.company_subscriptions.end_date), (0, drizzle_orm_1.desc)(schema_1.company_subscriptions.start_date))
            .limit(1);
        const usingCountP = this.db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*) AS cnt
      FROM ${schema_1.company_musics} cm
      WHERE cm.company_id = ${companyId}
    `);
        const usingListP = this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        m.id              AS music_id,
        m.title,
        m.artist,
        CASE
          WHEN m.cover_image_url IS NULL OR m.cover_image_url = '' THEN NULL
          WHEN m.cover_image_url LIKE 'http%' THEN m.cover_image_url
          WHEN m.cover_image_url LIKE '/uploads/%' THEN m.cover_image_url
          ELSE '/uploads/images/' || m.cover_image_url
        END               AS cover_image_url,
        NULL::timestamptz AS last_used_at
      FROM ${schema_1.company_musics} cm
      JOIN ${schema_1.musics} m ON m.id = cm.music_id
      WHERE cm.company_id = ${companyId}
      ORDER BY COALESCE(m.updated_at, m.created_at) DESC NULLS LAST
      LIMIT 10
    `);
        const [usingCountRow, usingRows] = await Promise.all([usingCountP, usingListP]);
        const earned = Number(company?.total_rewards_earned ?? 0);
        const used = Number(company?.total_rewards_used ?? 0);
        const rewardBalance = Math.max(0, earned - used);
        const today = (0, dayjs_1.default)();
        const end = sub?.end_date ? (0, dayjs_1.default)(sub.end_date) : null;
        const remainingDays = end ? Math.max(0, end.diff(today, 'day')) : null;
        const planPrice = sub?.tier && this.PLAN_PRICE[sub.tier];
        const capByPlan = planPrice ? Math.floor(planPrice * 0.3) : 0;
        const maxUsableNextPayment = Math.max(0, Math.min(rewardBalance, capByPlan));
        const reservedNext = Number(sub?.reserved_next ?? 0);
        const bigintReplacer = (_, v) => (typeof v === 'bigint' ? v.toString() : v);
        this.logger.debug('getMe.company = ' + JSON.stringify(company, bigintReplacer));
        return {
            company: company
                ? {
                    id: Number(company.id),
                    name: company.name,
                    grade: company.grade,
                    ceo_name: company.ceo_name ?? null,
                    phone: company.phone ?? null,
                    homepage_url: company.homepage_url ?? null,
                    profile_image_url: company.profile_image_url ?? null,
                    smart_account_address: company.smart_account_address ?? null,
                    total_rewards_earned: earned,
                    total_rewards_used: used,
                    reward_balance: rewardBalance,
                }
                : null,
            subscription: sub
                ? {
                    plan: sub.tier,
                    status: end && end.isAfter(today) ? 'active' : 'none',
                    start_date: sub.start_date,
                    end_date: sub.end_date,
                    next_billing_at: sub.end_date ?? null,
                    remaining_days: remainingDays,
                    reserved_rewards_next_payment: reservedNext,
                    max_usable_next_payment: maxUsableNextPayment,
                }
                : {
                    plan: 'free',
                    status: 'none',
                    remaining_days: null,
                    reserved_rewards_next_payment: 0,
                    max_usable_next_payment: 0,
                },
            api_key: { last4: null },
            using_summary: {
                using_count: Number(usingCountRow?.rows?.[0]?.cnt ?? 0),
            },
            using_list: usingRows?.rows?.map((r) => ({
                id: r.music_id,
                title: r.title,
                artist: r.artist,
                cover: r.cover_image_url,
                lastUsedAt: r.last_used_at,
            })) ?? [],
        };
    }
    async updateProfile(companyId, dto) {
        const setPayload = {
            ...(dto.ceo_name !== undefined ? { ceo_name: dto.ceo_name } : {}),
            ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
            ...(dto.homepage_url !== undefined ? { homepage_url: dto.homepage_url } : {}),
            ...(dto.profile_image_url !== undefined ? { profile_image_url: dto.profile_image_url } : {}),
            ...(('updated_at' in schema_1.companies) ? { updated_at: (0, drizzle_orm_1.sql) `now()` } : {}),
        };
        if (Object.keys(setPayload).length) {
            await this.db
                .update(schema_1.companies)
                .set(setPayload)
                .where((0, drizzle_orm_1.eq)(schema_1.companies.id, (companyId)));
        }
        return this.getMe(companyId);
    }
    async subscribe(companyId, dto) {
        const price = this.PLAN_PRICE[dto.tier];
        if (!price)
            throw new common_1.BadRequestException('invalid tier');
        const now = new Date();
        const start_date = (0, dayjs_1.default)(now).startOf('day').toDate();
        const end_date = (0, dayjs_1.default)(start_date).add(1, 'month').toDate();
        return await this.db.transaction(async (tx) => {
            const { rows } = await tx.execute((0, drizzle_orm_1.sql) `
        SELECT total_rewards_earned, total_rewards_used
        FROM ${schema_1.companies}
        WHERE id = ${BigInt(companyId)}
        FOR UPDATE
      `);
            const c = rows?.[0];
            if (!c)
                throw new common_1.BadRequestException('company not found');
            const earned = Number(c.total_rewards_earned ?? 0);
            const used = Number(c.total_rewards_used ?? 0);
            const balance = Math.max(0, earned - used);
            const cap = Math.floor((price * 3) / 10);
            const wantUse = Math.max(0, Math.floor(dto.use_rewards || 0));
            const use = Math.min(wantUse, cap, balance);
            const actualPaid = Math.max(0, price - use);
            await tx.insert(schema_1.company_subscriptions).values({
                company_id: companyId,
                tier: dto.tier,
                start_date,
                end_date,
                total_paid_amount: price,
                payment_count: 1,
                discount_amount: use,
                actual_paid_amount: actualPaid,
                created_at: now,
                updated_at: now,
            });
            await tx
                .update(schema_1.companies)
                .set({
                grade: dto.tier,
                total_rewards_used: (0, drizzle_orm_1.sql) `${schema_1.companies.total_rewards_used} + ${use}`,
                updated_at: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.companies.id, (companyId)));
            return this.getMe(companyId);
        });
    }
    async updateSubscriptionSettings(companyIdNum, dto) {
        const companyId = companyIdNum;
        return await this.db.transaction(async (tx) => {
            const reservedCol = schema_1.company_subscriptions.reserved_mileage_next_payment;
            const subSelect = {
                id: schema_1.company_subscriptions.id,
                company_id: schema_1.company_subscriptions.company_id,
                tier: schema_1.company_subscriptions.tier,
                end_date: schema_1.company_subscriptions.end_date,
                ...(reservedCol ? { reserved_next: reservedCol } : {}),
            };
            const [sub] = await tx
                .select(subSelect)
                .from(schema_1.company_subscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.company_subscriptions.company_id, companyId), (0, drizzle_orm_1.gt)(schema_1.company_subscriptions.end_date, (0, drizzle_orm_1.sql) `now()`)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.company_subscriptions.end_date))
                .limit(1);
            if (!sub) {
                throw new common_1.BadRequestException('활성화된 구독이 없습니다.');
            }
            const { rows } = await tx.execute((0, drizzle_orm_1.sql) `
        SELECT total_rewards_earned, total_rewards_used
        FROM ${schema_1.companies}
        WHERE id = ${BigInt(companyId)}
        FOR UPDATE
      `);
            const c = rows?.[0];
            if (!c)
                throw new common_1.BadRequestException('company not found');
            const earned = Number(c.total_rewards_earned ?? 0);
            const used = Number(c.total_rewards_used ?? 0);
            const balance = Math.max(0, earned - used);
            const planPrice = this.PLAN_PRICE[sub.tier];
            if (!planPrice)
                throw new common_1.BadRequestException('invalid plan for reservation');
            const cap = Math.floor(planPrice * 0.3);
            const requested = dto.reset ? 0 : Math.max(0, Math.floor(Number(dto.useMileage || 0)));
            const maxUsable = Math.max(0, Math.min(balance, cap));
            const clamped = Math.min(requested, maxUsable);
            const prevReserved = Number(sub.reserved_next ?? 0);
            if (clamped === prevReserved) {
                return {
                    ok: true,
                    reserved_rewards_next_payment: clamped,
                    max_usable_next_payment: maxUsable,
                    reason: '구독권 할인',
                    unchanged: true,
                };
            }
            const reservedName = schema_1.company_subscriptions.reserved_mileage_next_payment?.name ??
                'reserved_mileage_next_payment';
            await tx
                .update(schema_1.company_subscriptions)
                .set({
                [reservedName]: clamped,
                updated_at: (0, drizzle_orm_1.sql) `now()`,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.company_subscriptions.id, sub.id));
            return {
                ok: true,
                reserved_rewards_next_payment: clamped,
                max_usable_next_payment: maxUsable,
                reason: '구독권 할인',
            };
        });
    }
    async getHistory(companyIdNum) {
        const companyId = BigInt(companyIdNum);
        const sel = {
            id: schema_1.company_subscriptions.id,
            company_id: schema_1.company_subscriptions.company_id,
            tier: schema_1.company_subscriptions.tier,
            start_date: schema_1.company_subscriptions.start_date,
        };
        if (schema_1.company_subscriptions.created_at) {
            sel.created_at = schema_1.company_subscriptions.created_at;
        }
        if (schema_1.company_subscriptions.total_paid_amount) {
            sel.total_paid_amount = schema_1.company_subscriptions.total_paid_amount;
        }
        if (schema_1.company_subscriptions.actual_paid_amount) {
            sel.actual_paid_amount = schema_1.company_subscriptions.actual_paid_amount;
        }
        if (schema_1.company_subscriptions.discount_amount) {
            sel.discount_amount = schema_1.company_subscriptions.discount_amount;
        }
        const rows = await this.db
            .select(sel)
            .from(schema_1.company_subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.company_subscriptions.company_id, companyId))
            .orderBy(sel.created_at ? (0, drizzle_orm_1.desc)(schema_1.company_subscriptions.created_at)
            : (0, drizzle_orm_1.desc)(schema_1.company_subscriptions.start_date), (0, drizzle_orm_1.desc)(schema_1.company_subscriptions.id))
            .limit(50);
        const toNum = (v) => {
            const n = typeof v === 'string' ? Number(v) : Number(v ?? 0);
            return Number.isFinite(n) ? n : 0;
        };
        const fmt = (v) => (v ? (0, dayjs_1.default)(v).format('YYYY-MM-DD HH:mm') : '');
        const purchases = rows.map((r) => ({
            id: String(r.id),
            date: fmt(r.start_date ?? r.created_at),
            item: String(r.tier ?? '').toLowerCase() === 'business' ? 'Business 월 구독' : 'Standard 월 구독',
            amount: toNum(r.actual_paid_amount ?? r.total_paid_amount),
        }));
        const mileageLogs = rows
            .filter((r) => toNum(r.discount_amount) > 0)
            .map((r) => ({
            id: `m_${r.id}`,
            at: fmt(r.start_date ?? r.created_at),
            reason: '구독권 할인',
            delta: -Math.abs(toNum(r.discount_amount)),
        }));
        return { purchases, mileageLogs };
    }
    async getRewardsSummary(params) {
        const { companyId, musicId } = params;
        const days = Number(params.days ?? 7);
        if (!companyId)
            throw new common_1.BadRequestException('companyId missing');
        if (days <= 0 || days > 60)
            throw new common_1.BadRequestException('invalid days');
        const monthRes = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT to_char(timezone(${TZ}, now()), 'YYYY-MM') AS ym
    `);
        const month = monthRes.rows?.[0]?.ym ?? '';
        const musicFilter = musicId ? (0, drizzle_orm_1.sql) `AND cm.music_id = ${musicId}` : (0, drizzle_orm_1.sql) ``;
        const musicsRes = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT m.id AS music_id, m.title, m.cover_image_url
      FROM ${schema_1.company_musics} cm
      JOIN ${schema_1.musics} m ON m.id = cm.music_id
      WHERE cm.company_id = ${companyId}
      ${musicFilter}
      ORDER BY m.id
    `);
        const musicRows = musicsRes.rows ?? [];
        if (musicRows.length === 0) {
            return { month, days, items: [], totals: { monthBudget: 0, monthSpent: 0, monthRemaining: 0, lifetimeExtracted: 0 } };
        }
        const items = await Promise.all(musicRows.map(async (m) => {
            const mid = m.music_id;
            const planRes = await this.db.execute((0, drizzle_orm_1.sql) `
          SELECT reward_per_play::text, total_reward_count, remaining_reward_count
          FROM ${schema_1.monthly_music_rewards}
          WHERE music_id = ${mid}
            AND year_month = to_char(timezone(${TZ}, now()), 'YYYY-MM')
          LIMIT 1
        `);
            const plan = planRes.rows?.[0] ?? null;
            const rewardPerPlay = plan?.reward_per_play ? Number(plan.reward_per_play) : null;
            const totalRewardCount = plan?.total_reward_count ?? null;
            const remainingRewardCount = plan?.remaining_reward_count ?? null;
            const monthBudget = rewardPerPlay != null && totalRewardCount != null ? rewardPerPlay * totalRewardCount : 0;
            const remainingByPlanAmount = rewardPerPlay != null && remainingRewardCount != null ? rewardPerPlay * remainingRewardCount : null;
            const aggRes = await this.db.execute((0, drizzle_orm_1.sql) `
          WITH month_spent AS (
            SELECT COALESCE(SUM(amount),0)::numeric AS v
            FROM ${schema_1.rewards}
            WHERE company_id = ${companyId} AND music_id = ${mid}
              AND reward_code = ${me_rewards_dto_1.REWARD_CODE_EARNING}::reward_code
              AND status = ANY(${(0, drizzle_orm_1.sql) `ARRAY['pending'::reward_status,'successed'::reward_status]`})
              AND date_trunc('month', created_at AT TIME ZONE ${TZ})
                  = date_trunc('month', timezone(${TZ}, now()))
          ),
          lifetime AS (
            SELECT COALESCE(SUM(amount),0)::numeric AS v
            FROM ${schema_1.rewards}
            WHERE company_id = ${companyId} AND music_id = ${mid}
            AND reward_code = ${me_rewards_dto_1.REWARD_CODE_EARNING}::reward_code
            AND status IN ('pending'::reward_status,'successed'::reward_status)
          ),
         last_used AS (
            SELECT MAX(p.created_at) AS v
            FROM ${schema_1.music_plays} p
            WHERE p.using_company_id = ${companyId} AND p.music_id = ${mid}
          ),
          start_date AS (
            SELECT MIN(p.created_at) AS v
            FROM ${schema_1.music_plays} p
            WHERE p.using_company_id = ${companyId} AND p.music_id = ${mid}
          )
          SELECT
            month_spent.v::text AS month_spent,
            lifetime.v::text    AS lifetime,
            to_char(timezone(${TZ}, last_used.v),  'YYYY-MM-DD HH24:MI') AS last_used_at,
            to_char(timezone(${TZ}, start_date.v), 'YYYY-MM-DD HH24:MI') AS start_date
          FROM month_spent, lifetime, last_used, start_date
        `);
            const agg = aggRes.rows?.[0] ?? {};
            const monthSpent = Number(agg?.month_spent ?? '0');
            const lifetimeExtracted = Number(agg?.lifetime ?? '0');
            const lastUsedAt = agg?.last_used_at ?? null;
            const startDate = agg?.start_date ?? null;
            const monthRemaining = Math.max(monthBudget - monthSpent, 0);
            const dailyRes = await this.db.execute((0, drizzle_orm_1.sql) `
          WITH days AS (
            SELECT dd::date AS d
            FROM generate_series(
              (timezone(${TZ}, now())::date - (${days}::int - 1)),
              timezone(${TZ}, now())::date,
              interval '1 day'
            ) AS dd
          )
          SELECT to_char(d, 'YYYY-MM-DD') AS date,
                 COALESCE(SUM(r.amount),0)::numeric::text AS amount
          FROM days
          LEFT JOIN ${schema_1.rewards} r
            ON r.company_id = ${companyId} AND r.music_id = ${mid}
            AND r.reward_code = ${me_rewards_dto_1.REWARD_CODE_EARNING}::reward_code
            AND r.status IN ('pending'::reward_status,'successed'::reward_status)
            AND (r.created_at AT TIME ZONE ${TZ})::date = d
          GROUP BY d
          ORDER BY d
        `);
            const dailyRows = dailyRes.rows ?? [];
            return {
                musicId: mid,
                title: m.title,
                coverImageUrl: m.cover_image_url,
                playEndpoint: `/music/${mid}/play`,
                lyricsEndpoint: `/lyric/${mid}/download`,
                startDate,
                rewardPerPlay,
                monthBudget,
                monthSpent,
                monthRemaining,
                remainingByPlanCount: remainingRewardCount,
                remainingByPlanAmount,
                lifetimeExtracted,
                lastUsedAt,
                daily: dailyRows.map((x) => ({ date: x.date, amount: Number(x.amount) })),
                leadersEarned: lifetimeExtracted,
            };
        }));
        const totals = items.reduce((a, x) => {
            a.monthBudget += x.monthBudget;
            a.monthSpent += x.monthSpent;
            a.monthRemaining += x.monthRemaining;
            a.lifetimeExtracted += x.lifetimeExtracted;
            return a;
        }, { monthBudget: 0, monthSpent: 0, monthRemaining: 0, lifetimeExtracted: 0 });
        return { month, days, items, totals };
    }
    async getPlays(params) {
        const { companyId, musicId } = params;
        const page = Number(params.page ?? 1);
        const limit = Number(params.limit ?? 20);
        if (!companyId || !musicId)
            throw new common_1.BadRequestException('companyId/musicId missing');
        const offset = (page - 1) * limit;
        const cntRes = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*)::text AS c
      FROM ${schema_1.music_plays} p
      WHERE p.using_company_id = ${companyId} AND p.music_id = ${musicId}
    `);
        const total = Number(cntRes.rows?.[0]?.c ?? '0');
        const listRes = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        p.id AS play_id,
        to_char(timezone(${TZ}, p.created_at), 'YYYY-MM-DD HH24:MI') AS played_at,
        CASE
          WHEN r.id IS NOT NULL
           AND r.status = ANY(${(0, drizzle_orm_1.sql) `ARRAY['pending'::reward_status,'successed'::reward_status]`})
          THEN TRUE ELSE FALSE
        END AS is_valid,
        NULL::jsonb AS meta,                    -- ⬅⬅⬅ 여기!
        r.id   AS reward_id,
        r.reward_code,
        r.amount::text AS amount,
        r.status
      FROM ${schema_1.music_plays} p
      LEFT JOIN ${schema_1.rewards} r
        ON r.play_id = p.id
       AND r.reward_code = ${me_rewards_dto_1.REWARD_CODE_EARNING}::reward_code
      WHERE p.using_company_id = ${companyId} AND p.music_id = ${musicId}
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
        const rows = listRes.rows ?? [];
        return {
            page, limit, total,
            items: rows.map((r) => ({
                playId: r.play_id,
                playedAt: r.played_at,
                isValid: !!r.is_valid,
                meta: r.meta ?? null,
                rewardId: r.reward_id,
                rewardCode: r.reward_code,
                amount: r.amount != null ? Number(r.amount) : null,
                status: r.status,
            })),
        };
    }
    async removeUsing(companyIdNum, musicIdNum) {
        const companyId = companyIdNum;
        const musicId = musicIdNum;
        return await this.db.transaction(async (tx) => {
            const chk = await tx.execute((0, drizzle_orm_1.sql) `
        SELECT 1
        FROM ${schema_1.company_musics}
        WHERE company_id = ${companyId} AND music_id = ${musicId}
        LIMIT 1
      `);
            if (!chk?.rows?.length) {
                return this.getMe(companyId);
            }
            await tx.execute((0, drizzle_orm_1.sql) `
        DELETE FROM ${schema_1.company_musics}
        WHERE company_id = ${companyId} AND music_id = ${musicId}
      `);
            return this.getMe(companyId);
        });
    }
};
exports.MeService = MeService;
exports.MeService = MeService = MeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [Object])
], MeService);
//# sourceMappingURL=me.service.js.map