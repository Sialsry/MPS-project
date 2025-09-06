// apps/backend/src/client/me/me.service.ts
import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import { sql, eq, desc, and, gt } from 'drizzle-orm';
import {
  companies,
  companySubscriptions,
  musics,
  musicPlays,
  // 선택: 로그 테이블이 있다면 여기에 추가 import (예: mileageLogs)
} from '../../db/schema.introspected';

@Injectable()
export class MeService {
  private readonly logger = new Logger(MeService.name);
  constructor(@Inject('DB') private readonly db: any) {}

  // 구독 월정액 (원). 프론트 UI도 이 값을 기준으로 동작.
  private PLAN_PRICE: Record<'standard' | 'business', number> = {
    standard: 19000,
    business: 29000,
  };

  /** 안전 select 유틸: undefined/null 키 자동 제거 + 사전 검증 */
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
      ['ceo_name', companies.ceoName],
      ['phone', companies.phone],
      ['homepage_url', companies.homepageUrl],
      ['profileImageUrl', companies.profileImageUrl],
      ['smartAccountAddress', companies.smartAccountAddress],
      ['totalRewardsEarned', companies.totalRewardsEarned],
      ['totalRewardsUsed', companies.totalRewardsUsed],
    ]);

    const [company] = await this.db
      .select(companySelect)
      .from(companies)
      .where(eq(companies.id, BigInt(companyId)))
      .limit(1);

    // --- Subscription (reservedMileageNextPayment가 없으면 select에 추가하지 않음)
    const reservedCol = (companySubscriptions as any).reservedMileageNextPayment as any | undefined;

    const subSelect = {
      id: companySubscriptions.id,
      companyId: companySubscriptions.companyId,
      tier: companySubscriptions.tier,
      startDate: companySubscriptions.startDate,
      endDate: companySubscriptions.endDate,
      ...(reservedCol ? { reservedNext: reservedCol } : {}), // ← OK: as const 안 씀
    } as const;
    
    const [sub] = await this.db
      .select(subSelect)
      .from(companySubscriptions)
      .where(eq(companySubscriptions.companyId, companyId))
      .orderBy(desc(companySubscriptions.endDate), desc(companySubscriptions.startDate))
      .limit(1);

    // --- Using summary/list
    const usingCountP = this.db.execute(sql`
      SELECT COUNT(DISTINCT mp.music_id) AS cnt
      FROM ${musicPlays} mp
      WHERE mp.using_company_id = ${companyId}
        AND COALESCE(mp.is_valid_play, TRUE) = TRUE
    `);

    const usingListP = this.db.execute(sql`
      SELECT m.id AS music_id, m.title, m.artist, m.cover_image_url,
             MAX(mp.created_at) AS last_used_at
      FROM ${musicPlays} mp
      JOIN ${musics} m ON m.id = mp.music_id
      WHERE mp.using_company_id = ${companyId}
      GROUP BY m.id, m.title, m.artist, m.cover_image_url
      ORDER BY MAX(mp.created_at) DESC
      LIMIT 10
    `);

    const [usingCountRow, usingRows] = await Promise.all([usingCountP, usingListP]);

    // --- Derived values
    const earned = Number(company?.totalRewardsEarned ?? 0);
    const used   = Number(company?.totalRewardsUsed ?? 0);
    const rewardBalance = Math.max(0, earned - used);

    const today = dayjs();
    const end = sub?.endDate ? dayjs(sub.endDate) : null;
    const remainingDays = end ? Math.max(0, end.diff(today, 'day')) : null;

    const planPrice = sub?.tier && this.PLAN_PRICE[sub.tier as 'standard' | 'business'];
    const capByPlan = planPrice ? Math.floor(planPrice * 0.3) : 0;
    const maxUsableNextPayment = Math.max(0, Math.min(rewardBalance, capByPlan));
    const reservedNext = Number((sub as any)?.reservedNext ?? 0);

    const bigintReplacer = (_: string, v: any) => (typeof v === 'bigint' ? v.toString() : v);
    this.logger.debug('getMe.company = ' + JSON.stringify(company, bigintReplacer));

    return {
      company: company ? {
        id: Number(company.id),
        name: company.name,
        grade: company.grade,
        ceo_name: company.ceo_name ?? null,
        phone: company.phone ?? null,
        homepage_url: company.homepage_url ?? null,
        profile_image_url: company.profileImageUrl ?? null,
        smart_account_address: company.smartAccountAddress ?? null,
        total_rewards_earned: earned,
        total_rewards_used: used,
        reward_balance: rewardBalance,
      } : null,

      subscription: sub ? {
        plan: sub.tier,
        status: end && end.isAfter(today) ? 'active' : 'none',
        start_date: sub.startDate,
        end_date: sub.endDate,
        next_billing_at: sub.endDate ?? null,
        remaining_days: remainingDays,
        reserved_rewards_next_payment: reservedNext,
        max_usable_next_payment: maxUsableNextPayment,
      } : {
        plan: 'free',
        status: 'none',
        remaining_days: null,
        reserved_rewards_next_payment: 0,
        max_usable_next_payment: 0,
      },

      api_key: { last4: null },

      using_summary: { using_count: Number((usingCountRow as any)?.rows?.[0]?.cnt ?? 0) },

      using_list: (usingRows as any)?.rows?.map((r: any) => ({
        id: r.music_id,
        title: r.title,
        artist: r.artist,
        cover: r.cover_image_url,
        lastUsedAt: r.last_used_at,
      })) ?? [],
    };
  }

  /** 프로필 편집 */
  async updateProfile(
    companyId: number,
    dto: { ceo_name?: string; phone?: string; homepage_url?: string; profile_image_url?: string }
  ) {
    const setPayload: Record<string, any> = {
      ...(dto.ceo_name          !== undefined ? { ceoName: dto.ceo_name } : {}),
      ...(dto.phone             !== undefined ? { phone: dto.phone } : {}),
      ...(dto.homepage_url      !== undefined ? { homepageUrl: dto.homepage_url } : {}),
      ...(dto.profile_image_url !== undefined ? { profileImageUrl: dto.profile_image_url } : {}),
      ...(('updatedAt' in companies) ? { updatedAt: new Date() } : {}),
    };

    if (Object.keys(setPayload).length) {
      await this.db.update(companies).set(setPayload).where(eq(companies.id, BigInt(companyId)));
    }
    return this.getMe(companyId);
  }

  /** 구독 구매 (즉시 결제) */
  async subscribe(companyId: number, dto: { tier: 'standard' | 'business'; use_rewards: number }) {
    const price = this.PLAN_PRICE[dto.tier];
    if (!price) throw new BadRequestException('invalid tier');

    const now = new Date();
    const startDate = dayjs(now).startOf('day').toDate();
    const endDate   = dayjs(startDate).add(1, 'month').toDate();

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
      const used   = Number(c.total_rewards_used ?? 0);
      const balance = Math.max(0, earned - used);

      // 2) 30% 캡
      const cap = Math.floor((price * 3) / 10);
      const wantUse = Math.max(0, Math.floor(dto.use_rewards || 0));
      const use = Math.min(wantUse, cap, balance);

      const actualPaid = Math.max(0, price - use);

      // 3) (선택) 기존 활성 구독 종료/검증 로직 추가 권장

      // 4) 구독 생성
      await tx.insert(companySubscriptions).values({
        companyId,
        tier: dto.tier,
        startDate,
        endDate,
        totalPaidAmount: price,
        paymentCount: 1,
        discountAmount: use,
        actualPaidAmount: actualPaid,
        createdAt: now,
        updatedAt: now,
      });

      // 5) 리워드 사용 누적
      await tx
        .update(companies)
        .set({
          grade: dto.tier,
          totalRewardsUsed: sql`${companies.totalRewardsUsed} + ${use}`,
          updatedAt: now,
        })
        .where(eq(companies.id, BigInt(companyId)));

      // 6) (선택) 감사 로그 적재 가능

      // 7) 최신 상태 반환
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
    dto: { useMileage: number; reset?: boolean }
  ) {
    const companyId = companyIdNum; // company_subscriptions.company_id는 number 모드

    return await this.db.transaction(async (tx: any) => {
      // 1) 최신 활성 구독 조회 (endDate > now)
      const reservedCol = (companySubscriptions as any).reservedMileageNextPayment as any | undefined;

      const subSelect = {
        id: companySubscriptions.id,
        companyId: companySubscriptions.companyId,
        tier: companySubscriptions.tier,
        endDate: companySubscriptions.endDate,
        ...(reservedCol ? { reservedNext: reservedCol } : {}), // ← 동일 처리
      } as const;
      
      const [sub] = await tx
        .select(subSelect)
        .from(companySubscriptions)
        .where(
          and(
            eq(companySubscriptions.companyId, companyId),
            gt(companySubscriptions.endDate, sql`now()`)
          )
        )
        .orderBy(desc(companySubscriptions.endDate))
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
      const used   = Number(c.total_rewards_used ?? 0);
      const balance = Math.max(0, earned - used);

      // 3) 플랜 가격 기반 30% 캡
      const planPrice = this.PLAN_PRICE[sub.tier as 'standard' | 'business'];
      if (!planPrice) throw new BadRequestException('invalid plan for reservation');
      const cap = Math.floor(planPrice * 0.3);

      // 4) 요청값 클램프(0 ~ min(balance, cap))
      const requested = dto.reset ? 0 : Math.max(0, Math.floor(Number(dto.useMileage || 0)));
      const maxUsable = Math.max(0, Math.min(balance, cap));
      const clamped = Math.min(requested, maxUsable);

      const prevReserved = Number((sub as any).reservedNext ?? 0);
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
        (companySubscriptions as any).reservedMileageNextPayment?.name
        ?? 'reserved_mileage_next_payment';

      await tx
        .update(companySubscriptions)
        .set({
          [reservedName]: clamped as any,
          updatedAt: sql`now()`,
        } as any)
        .where(eq(companySubscriptions.id, sub.id));

      // 6) (선택) 로그 테이블 이력 적재 가능

      return {
        ok: true,
        reserved_rewards_next_payment: clamped,
        max_usable_next_payment: maxUsable,
        reason: '구독권 할인',
      };
    });
  }
  async getHistory(companyIdNum: number) {
    // company_id 가 bigint이면 BigInt로 맞춰 주세요
    const companyId = BigInt(companyIdNum);

    const sel: Record<string, any> = {
      id: companySubscriptions.id,
      companyId: companySubscriptions.companyId,
      tier: companySubscriptions.tier,
      startDate: companySubscriptions.startDate,
    };
    if ((companySubscriptions as any).createdAt) {
      sel.createdAt = (companySubscriptions as any).createdAt;
    }
    if ((companySubscriptions as any).totalPaidAmount) {
      sel.totalPaidAmount = (companySubscriptions as any).totalPaidAmount;
    }
    if ( (companySubscriptions as any).actualPaidAmount ) {
      sel.actualPaidAmount = (companySubscriptions as any).actualPaidAmount;
    }
    if ( (companySubscriptions as any).discountAmount ) {
      sel.discountAmount = (companySubscriptions as any).discountAmount;
    }

    // 🧪 없는 컬럼 넣으면 Drizzle이 바로 500냅니다. 위처럼 guard 해주세요.
    const rows = await this.db
      .select(sel)
      .from(companySubscriptions)
      .where(eq(companySubscriptions.companyId, companyId as any))
      .orderBy(
        (sel as any).createdAt ? desc((companySubscriptions as any).createdAt)
                               : desc(companySubscriptions.startDate),
        desc(companySubscriptions.id),
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
      date: fmt(r.startDate ?? r.createdAt),
      item:
        String(r.tier ?? '').toLowerCase() === 'business'
          ? 'Business 월 구독'
          : 'Standard 월 구독',
      amount: toNum(r.actualPaidAmount ?? r.totalPaidAmount),
      // method/maskedCard는 아직 미지원 → 모달에서 안 씀
    }));

    // 마일리지(할인) 내역
    const mileageLogs = rows
      .filter((r: any) => toNum(r.discountAmount) > 0)
      .map((r: any) => ({
        id: `m_${r.id}`,
        at: fmt(r.startDate ?? r.createdAt),
        reason: '구독권 할인',
        delta: -Math.abs(toNum(r.discountAmount)),
      }));

    return { purchases, mileageLogs };
  }
}
