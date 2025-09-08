// apps/backend/src/client/me/me.service.ts
import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import { sql, eq, desc, and, gt } from 'drizzle-orm';
import {
  companies,
  company_subscriptions,
  musics,
  company_musics,
} from '../../db/schema';

@Injectable()
export class MeService {
  private readonly logger = new Logger(MeService.name);
  constructor(@Inject('DB') private readonly db: any) {}

  // 구독 월정액 (원)
  private PLAN_PRICE: Record<'standard' | 'business', number> = {
    standard: 19000,
    business: 29000,
  };

  /** 안전 select 유틸: undefined/null 키 제거 + 사전 검증 */
  private buildSelect<T extends Record<string, any>>(entries: Array<[keyof T & string, any]>): T {
    const filtered = entries.filter(([, v]) => v !== undefined && v !== null);
    const obj = Object.fromEntries(filtered) as T;
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null) {
        throw new Error(`[buildSelect] "${k}" is ${v}`);
      }
    }
    return obj;
  }

  /** 내 정보 + 구독/사용 요약 */
  async getMe(companyId: number) {
    // --- Company
    const companySelect = this.buildSelect([
      ['id', companies.id],
      ['name', companies.name],
      ['grade', companies.grade],
      ['ceo_name', companies.ceo_name],
      ['phone', companies.phone],
      ['homepage_url', companies.homepage_url],
      ['profile_image_url', companies.profile_image_url],
      ['smart_account_address', companies.smart_account_address],
      ['total_rewards_earned', companies.total_rewards_earned],
      ['total_rewards_used', companies.total_rewards_used],
    ]);

    const [company] = await this.db
      .select(companySelect)
      .from(companies)
      .where(eq(companies.id, (companyId)))
      .limit(1);

    // --- Subscription (reserved_mileage_next_payment 컬럼이 없을 수도 있음)
    const reservedCol =
      (company_subscriptions as any).reserved_mileage_next_payment as any | undefined;

    const subSelect = {
      id: company_subscriptions.id,
      company_id: company_subscriptions.company_id,
      tier: company_subscriptions.tier,
      start_date: company_subscriptions.start_date,
      end_date: company_subscriptions.end_date,
      ...(reservedCol ? { reserved_next: reservedCol } : {}),
    } as const;

    const [sub] = await this.db
      .select(subSelect)
      .from(company_subscriptions)
      .where(eq(company_subscriptions.company_id, companyId))
      .orderBy(desc(company_subscriptions.end_date), desc(company_subscriptions.start_date))
      .limit(1);

    // --- Using summary/list  (company_musics + musics)
    // 총 사용(보유) 곡 수: company_musics에서 회사에 연결된 곡 수
    const usingCountP = this.db.execute(sql`
      SELECT COUNT(*) AS cnt
      FROM ${company_musics} cm
      WHERE cm.company_id = ${companyId}
    `);

    // 최근 목록: company_musics ↔ musics 조인
    // last_used_at은 지금은 NULL (로그 테이블 생기면 MAX(created_at)로 치환 가능)
    const usingListP = this.db.execute(sql`
      SELECT
        m.id               AS music_id,
        m.title,
        m.artist,
        m.cover_image_url,
        NULL::timestamptz  AS last_used_at
      FROM ${company_musics} cm
      JOIN ${musics} m ON m.id = cm.music_id
      WHERE cm.company_id = ${companyId}
      ORDER BY COALESCE(m.updated_at, m.created_at) DESC NULLS LAST
      LIMIT 10
    `);

    const [usingCountRow, usingRows] = await Promise.all([usingCountP, usingListP]);

    // --- Derived values
    const earned = Number(company?.total_rewards_earned ?? 0);
    const used   = Number(company?.total_rewards_used ?? 0);
    const rewardBalance = Math.max(0, earned - used);

    const today = dayjs();
    const end = sub?.end_date ? dayjs(sub.end_date) : null;
    const remainingDays = end ? Math.max(0, end.diff(today, 'day')) : null;

    const planPrice = sub?.tier && this.PLAN_PRICE[sub.tier as 'standard' | 'business'];
    const capByPlan = planPrice ? Math.floor(planPrice * 0.3) : 0;
    const maxUsableNextPayment = Math.max(0, Math.min(rewardBalance, capByPlan));
    const reservedNext = Number((sub as any)?.reserved_next ?? 0);

    const bigintReplacer = (_: string, v: any) => (typeof v === 'bigint' ? v.toString() : v);
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
        using_count: Number((usingCountRow as any)?.rows?.[0]?.cnt ?? 0),
      },

      using_list:
        (usingRows as any)?.rows?.map((r: any) => ({
          id: r.music_id,
          title: r.title,
          artist: r.artist,
          cover: r.cover_image_url,
          lastUsedAt: r.last_used_at, // 현재는 NULL
        })) ?? [],
    };
  }

  /** 프로필 편집 */
  async updateProfile(
    companyId: number,
    dto: { ceo_name?: string; phone?: string; homepage_url?: string; profile_image_url?: string },
  ) {
    const setPayload: Record<string, any> = {
      ...(dto.ceo_name !== undefined ? { ceo_name: dto.ceo_name } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.homepage_url !== undefined ? { homepage_url: dto.homepage_url } : {}),
      ...(dto.profile_image_url !== undefined ? { profile_image_url: dto.profile_image_url } : {}),
      ...(('updated_at' in companies) ? { updated_at: sql`now()` } : {}),
    };

    if (Object.keys(setPayload).length) {
      await this.db
        .update(companies)
        .set(setPayload)
        .where(eq(companies.id, (companyId)));
    }
    return this.getMe(companyId);
  }

  /** 구독 구매 (즉시 결제) */
  async subscribe(companyId: number, dto: { tier: 'standard' | 'business'; use_rewards: number }) {
    const price = this.PLAN_PRICE[dto.tier];
    if (!price) throw new BadRequestException('invalid tier');

    const now = new Date();
    const start_date = dayjs(now).startOf('day').toDate();
    const end_date = dayjs(start_date).add(1, 'month').toDate();

    return await this.db.transaction(async (tx) => {
      // 1) 회사 잠금 후 보유 리워드 확인
      const { rows } = await tx.execute(sql`
        SELECT total_rewards_earned, total_rewards_used
        FROM companies
        WHERE id = ${BigInt(companyId)}
        FOR UPDATE
      `);
      const c = rows?.[0];
      if (!c) throw new BadRequestException('company not found');

      const earned = Number(c.total_rewards_earned ?? 0);
      const used = Number(c.total_rewards_used ?? 0);
      const balance = Math.max(0, earned - used);

      // 2) 30% 캡
      const cap = Math.floor((price * 3) / 10);
      const wantUse = Math.max(0, Math.floor(dto.use_rewards || 0));
      const use = Math.min(wantUse, cap, balance);
      const actualPaid = Math.max(0, price - use);

      // 3) 구독 생성
      await tx.insert(company_subscriptions).values({
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
      } as any);

      // 4) 리워드 사용 누적
      await tx
        .update(companies)
        .set({
          grade: dto.tier,
          total_rewards_used: sql`${companies.total_rewards_used} + ${use}`,
          updated_at: now,
        } as any)
        .where(eq(companies.id, (companyId)));

      // 5) 최신 상태 반환
      return this.getMe(companyId);
    });
  }

  /**
   * 다음 결제에 사용할 리워드 예약값 갱신
   * - 예약만 저장(실제 차감은 결제 처리 시점)
   * - 사유는 '구독권 할인'으로 고정
   */
  async updateSubscriptionSettings(
    companyIdNum: number,
    dto: { useMileage: number; reset?: boolean },
  ) {
    const companyId = companyIdNum; // company_subscriptions.company_id는 number 모드

    return await this.db.transaction(async (tx: any) => {
      // 1) 최신 활성 구독 조회 (end_date > now)
      const reservedCol =
        (company_subscriptions as any).reserved_mileage_next_payment as any | undefined;

      const subSelect = {
        id: company_subscriptions.id,
        company_id: company_subscriptions.company_id,
        tier: company_subscriptions.tier,
        end_date: company_subscriptions.end_date,
        ...(reservedCol ? { reserved_next: reservedCol } : {}),
      } as const;

      const [sub] = await tx
        .select(subSelect)
        .from(company_subscriptions)
        .where(and(eq(company_subscriptions.company_id, companyId), gt(company_subscriptions.end_date, sql`now()`)))
        .orderBy(desc(company_subscriptions.end_date))
        .limit(1);

      if (!sub) {
        throw new BadRequestException('활성화된 구독이 없습니다.');
      }

      // 2) 회사 보유 리워드 확보(잠금)
      const { rows } = await tx.execute(sql`
        SELECT total_rewards_earned, total_rewards_used
        FROM companies
        WHERE id = ${BigInt(companyId)}
        FOR UPDATE
      `);
      const c = rows?.[0];
      if (!c) throw new BadRequestException('company not found');

      const earned = Number(c.total_rewards_earned ?? 0);
      const used = Number(c.total_rewards_used ?? 0);
      const balance = Math.max(0, earned - used);

      // 3) 플랜 가격 기반 30% 캡
      const planPrice = this.PLAN_PRICE[sub.tier as 'standard' | 'business'];
      if (!planPrice) throw new BadRequestException('invalid plan for reservation');
      const cap = Math.floor(planPrice * 0.3);

      // 4) 요청값 클램프(0 ~ min(balance, cap))
      const requested = dto.reset ? 0 : Math.max(0, Math.floor(Number(dto.useMileage || 0)));
      const maxUsable = Math.max(0, Math.min(balance, cap));
      const clamped = Math.min(requested, maxUsable);

      const prevReserved = Number((sub as any).reserved_next ?? 0);
      if (clamped === prevReserved) {
        return {
          ok: true,
          reserved_rewards_next_payment: clamped,
          max_usable_next_payment: maxUsable,
          reason: '구독권 할인',
          unchanged: true,
        };
      }

      // 5) 예약값 업데이트 (컬럼명 안전 폴백)
      const reservedName =
        (company_subscriptions as any).reserved_mileage_next_payment?.name ??
        'reserved_mileage_next_payment';

      await tx
        .update(company_subscriptions)
        .set({
          [reservedName]: clamped as any,
          updated_at: sql`now()`,
        } as any)
        .where(eq(company_subscriptions.id, sub.id));

      return {
        ok: true,
        reserved_rewards_next_payment: clamped,
        max_usable_next_payment: maxUsable,
        reason: '구독권 할인',
      };
    });
  }

  async getHistory(companyIdNum: number) {
    const companyId = BigInt(companyIdNum);

    const sel: Record<string, any> = {
      id: company_subscriptions.id,
      company_id: company_subscriptions.company_id,
      tier: company_subscriptions.tier,
      start_date: company_subscriptions.start_date,
    };
    if ((company_subscriptions as any).created_at) {
      sel.created_at = (company_subscriptions as any).created_at;
    }
    if ((company_subscriptions as any).total_paid_amount) {
      sel.total_paid_amount = (company_subscriptions as any).total_paid_amount;
    }
    if ((company_subscriptions as any).actual_paid_amount) {
      sel.actual_paid_amount = (company_subscriptions as any).actual_paid_amount;
    }
    if ((company_subscriptions as any).discount_amount) {
      sel.discount_amount = (company_subscriptions as any).discount_amount;
    }

    const rows = await this.db
      .select(sel)
      .from(company_subscriptions)
      .where(eq(company_subscriptions.company_id, companyId as any))
      .orderBy(
        (sel as any).created_at ? desc((company_subscriptions as any).created_at)
                                : desc(company_subscriptions.start_date),
        desc(company_subscriptions.id),
      )
      .limit(50);

    const toNum = (v: any) => {
      const n = typeof v === 'string' ? Number(v) : Number(v ?? 0);
      return Number.isFinite(n) ? n : 0;
    };
    const fmt = (v: any) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '');

    // 구매내역
    const purchases = rows.map((r: any) => ({
      id: String(r.id),
      date: fmt(r.start_date ?? r.created_at),
      item: String(r.tier ?? '').toLowerCase() === 'business' ? 'Business 월 구독' : 'Standard 월 구독',
      amount: toNum(r.actual_paid_amount ?? r.total_paid_amount),
    }));

    // 마일리지(할인) 내역
    const mileageLogs = rows
      .filter((r: any) => toNum(r.discount_amount) > 0)
      .map((r: any) => ({
        id: `m_${r.id}`,
        at: fmt(r.start_date ?? r.created_at),
        reason: '구독권 할인',
        delta: -Math.abs(toNum(r.discount_amount)),
      }));

    return { purchases, mileageLogs };
  }
}
