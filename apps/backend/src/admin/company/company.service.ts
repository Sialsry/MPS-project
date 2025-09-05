import { Injectable, Inject } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import type { DB } from '../../db/client';
import { sql } from 'drizzle-orm';
import type { RewardsSummaryQueryDto } from './dto/rewards-summary.query.dto';
import { getDefaultYearMonthKST, isValidYearMonth, resolveYearMonthKST } from '../../common/utils/date.util';
import { normalizePagination } from '../../common/utils/pagination.util';
import { normalizeSort } from '../../common/utils/sort.util';
import { buildSummaryQuery, buildDailyQuery, buildByMusicQuery, buildSummaryListBaseQuery, buildDailyIndustryAvgQuery, buildMonthlyCompanyQuery, buildMonthlyIndustryAvgQuery } from './queries/rewards.queries';

@Injectable()
export class CompanyService {
  constructor(@Inject('DB') private readonly db: DB) {}

  async getRewardsSummary(params: RewardsSummaryQueryDto) {
    const tz = 'Asia/Seoul';

    const yearMonth = isValidYearMonth(params.yearMonth) ? params.yearMonth! : getDefaultYearMonthKST();
    const [ymYear, ymMonth] = yearMonth.split('-').map(Number);

    const { page, limit, offset } = normalizePagination(params.page, params.limit, 100);

    const search = (params.search || '').trim();
    const hasSearch = search.length > 0;
    const tier = params.tier && params.tier !== 'all' ? params.tier : null;

    const { sortBy, order } = normalizeSort(
      params.sortBy,
      params.order,
      ['company_id', 'name', 'grade', 'total_tokens', 'monthly_earned', 'monthly_used', 'usage_rate', 'active_tracks']
    );

    const baseQuery = buildSummaryListBaseQuery(ymYear, ymMonth, tz);
    const filtered = sql`${baseQuery}
      ${hasSearch ? sql`AND (c.name ILIKE ${'%' + search + '%'} OR CAST(c.id AS TEXT) ILIKE ${'%' + search + '%'})` : sql``}
      ${tier ? sql`AND c.grade = ${tier}` : sql``}
    `;

    const totalResult = await this.db.execute(sql`SELECT COUNT(*) as count FROM (${filtered}) t`);
    const totalRows = (totalResult as any).rows ?? [];
    const total = Number(totalRows[0]?.count ?? 0);

    const pageResult = await this.db.execute(sql`${filtered} ORDER BY ${sql.raw(sortBy)} ${sql.raw(order)} LIMIT ${limit} OFFSET ${offset}`);
    const rows = (pageResult as any).rows ?? [];

    const items = rows.map((r: any) => ({
      companyId: Number(r.company_id),
      name: r.name as string,
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

  async getRewardsDetail(companyId: number, yearMonth?: string) {
    const tz = 'Asia/Seoul'
    const ym = resolveYearMonthKST(yearMonth)
    const [ymYear, ymMonth] = ym.split('-').map(Number)

    const summaryRes = await this.db.execute(buildSummaryQuery(companyId, ymYear, ymMonth, tz))
    const base = (summaryRes as any).rows?.[0]
    if (!base) {
      return { company: { id: companyId, name: '', tier: 'free' }, summary: { totalTokens: 0, monthlyEarned: 0, monthlyUsed: 0, usageRate: 0, activeTracks: 0, yearMonth: ym }, daily: [], dailyIndustryAvg: [], monthly: [], monthlyIndustryAvg: [], byMusic: [] }
    }

    const [dailyRes, dailyIndustryRes, byMusicRes, monthlyCompanyRes, monthlyIndustryRes] = await Promise.all([
      this.db.execute(buildDailyQuery(companyId, ymYear, ymMonth, tz)),
      this.db.execute(buildDailyIndustryAvgQuery(ymYear, ymMonth, tz)),
      this.db.execute(buildByMusicQuery(companyId, ymYear, ymMonth, tz)),
      this.db.execute(buildMonthlyCompanyQuery(companyId, ymYear, ymMonth, 12, tz)),
      this.db.execute(buildMonthlyIndustryAvgQuery(ymYear, ymMonth, 12, tz)),
    ])

    const tierText = String(base.grade) === 'business' ? 'Business' : String(base.grade) === 'standard' ? 'Standard' : 'Free'

    const fmt = (d?: any) => (d ? new Date(d).toISOString().slice(0, 10) : undefined)

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
      daily: ((dailyRes as any).rows || []).map((r: any) => ({ date: r.date, earned: Number(r.earned || 0), used: Number(r.used || 0) })),
      dailyIndustryAvg: ((dailyIndustryRes as any).rows || []).map((r: any) => ({ date: r.date, earned: Number(r.earned || 0) })),
      monthly: ((monthlyCompanyRes as any).rows || []).map((r: any) => ({ yearMonth: r.year_month, earned: Number(r.earned || 0) })),
      monthlyIndustryAvg: ((monthlyIndustryRes as any).rows || []).map((r: any) => ({ yearMonth: r.year_month, earned: Number(r.earned || 0) })),
      byMusic: ((byMusicRes as any).rows || []).map((r: any) => ({ musicId: Number(r.music_id), title: r.title, artist: r.artist, category: r.category ?? null, validPlays: Number(r.valid_plays || 0), earned: Number(r.earned || 0), lastUsedAt: r.last_used_at || null })),
    }
  }

  create(createCompanyDto: CreateCompanyDto) {
    return 'This action adds a new company';
  }

  findAll() {
    return `This action returns all company`;
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
