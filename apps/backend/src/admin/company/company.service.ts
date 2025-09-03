import { Injectable, Inject } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import type { DB } from '../../db/client';
import { sql } from 'drizzle-orm';

export type RewardsSummaryQuery = {
  yearMonth?: string
  search?: string
  tier?: 'free' | 'standard' | 'business' | 'all'
  page?: string
  limit?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

@Injectable()
export class CompanyService {
  constructor(@Inject('DB') private readonly db: DB) {}

  async getRewardsSummary(params: RewardsSummaryQuery) {
    const tz = 'Asia/Seoul';
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const year = kstTime.getUTCFullYear();
    const month = kstTime.getUTCMonth() + 1;
    const defaultYm = `${year}-${String(month).padStart(2, '0')}`;

    const yearMonth = (params.yearMonth && /^\d{4}-\d{2}$/.test(params.yearMonth)) ? params.yearMonth : defaultYm;
    const [ymYear, ymMonth] = yearMonth.split('-').map(Number);

    const page = Math.max(parseInt(params.page || '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(params.limit || '10', 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const search = (params.search || '').trim();
    const hasSearch = search.length > 0;
    const tier = params.tier && params.tier !== 'all' ? params.tier : null;

    // 정렬
    const sortBy = params.sortBy || 'company_id';
    const order = (params.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
    const validSortColumns = new Set(['company_id', 'name', 'grade', 'total_tokens', 'monthly_earned', 'monthly_used', 'usage_rate', 'active_tracks']);
    const sortColumn = validSortColumns.has(sortBy) ? sortBy : 'company_id';
    const baseQuery = sql`
      WITH month_range AS (
        SELECT 
          make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) AS month_start,
          (make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) + interval '1 month') - interval '1 second' AS month_end
      ),
      plays AS (
        SELECT mp.using_company_id AS company_id,
          COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS valid_play_count,
          COUNT(DISTINCT CASE WHEN mp.is_valid_play = true THEN mp.music_id END) AS active_tracks,
          COALESCE(SUM(CASE WHEN mp.is_valid_play = true THEN mp.reward_amount::numeric ELSE 0 END), 0) AS monthly_earned
        FROM music_plays mp, month_range mr
        WHERE mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
        GROUP BY mp.using_company_id
      ),
      subs AS (
        SELECT cs.company_id,
        COALESCE(SUM(cs.discount_amount::numeric), 0) AS monthly_used
        FROM company_subscriptions cs, month_range mr
        WHERE cs.start_date >= mr.month_start AND cs.start_date <= mr.month_end
        GROUP BY cs.company_id
      )
      SELECT 
        c.id AS company_id,
        c.name,
        c.grade,
        (c.total_rewards_earned::numeric - c.total_rewards_used::numeric) AS total_tokens,
        COALESCE(p.monthly_earned, 0) AS monthly_earned,
        COALESCE(s.monthly_used, 0) AS monthly_used,
        CASE 
          WHEN (c.total_rewards_earned::numeric - c.total_rewards_used::numeric) > 0 
            THEN ROUND((COALESCE(s.monthly_used, 0) / (c.total_rewards_earned::numeric - c.total_rewards_used::numeric)) * 100, 2)
          ELSE 0
        END AS usage_rate,
        COALESCE(p.active_tracks, 0) AS active_tracks
      FROM companies c
      LEFT JOIN plays p ON p.company_id = c.id
      LEFT JOIN subs s ON s.company_id = c.id
      WHERE 1=1
      ${hasSearch ? sql`AND (c.name ILIKE ${'%' + search + '%'} OR CAST(c.id AS TEXT) ILIKE ${'%' + search + '%'})` : sql``}
      ${tier ? sql`AND c.grade = ${tier}` : sql``}
    `;

    const totalResult = await this.db.execute(sql`SELECT COUNT(*) as count FROM (${baseQuery}) t`);
    const totalRows = (totalResult as any).rows ?? [];
    const total = Number(totalRows[0]?.count ?? 0);
    const pageResult = await this.db.execute(sql`${baseQuery} ORDER BY ${sql.raw(sortColumn)} ${sql.raw(order)} LIMIT ${limit} OFFSET ${offset}`);
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
