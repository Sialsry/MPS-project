import { SQL, sql } from 'drizzle-orm'

export type MusicRewardsSortKey = 'music_id' | 'title' | 'artist' | 'category' | 'grade' | 'validPlays' | 'earned' | 'companiesUsing' | 'lastUsedAt'

export function buildMusicRewardsSummaryQuery(params: {
  year: number
  month: number
  search?: string
  categoryId?: number
  grade?: number
  musicType?: boolean // true: Inst, false: 일반
  offset: number
  limit: number
  orderBySql: SQL
}) {
  const { year, month, search, categoryId, grade, musicType, offset, limit, orderBySql } = params

  const ym = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`

  const base = sql`
WITH month_range AS (
  SELECT
    make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') AS month_start,
    (make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second' AS month_end
),
plays AS (
  SELECT
    mp.music_id,
    COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS valid_plays,
    COALESCE(SUM(CASE WHEN mp.is_valid_play = true THEN mp.reward_amount::numeric ELSE 0 END), 0) AS earned,
    COUNT(DISTINCT CASE WHEN mp.is_valid_play = true THEN mp.using_company_id END) AS companies_using,
    MAX(mp.created_at) AS last_used_at
  FROM music_plays mp, month_range mr
  WHERE mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
  GROUP BY mp.music_id
)
SELECT
  m.id AS music_id,
  m.title,
  m.artist,
  mc.name AS category,
  m.grade_required AS grade,
  m.inst AS music_type,
  COALESCE(p.valid_plays, 0) AS valid_plays,
  COALESCE(p.earned, 0) AS earned,
  COALESCE(p.companies_using, 0) AS companies_using,
  to_char(p.last_used_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS last_used_at,
  mmr.total_reward_count AS monthly_limit,
  mmr.remaining_reward_count AS monthly_remaining,
  mmr.reward_per_play AS reward_per_play
FROM musics m
LEFT JOIN plays p ON p.music_id = m.id
LEFT JOIN music_categories mc ON mc.id = m.category_id
LEFT JOIN monthly_music_rewards mmr ON mmr.music_id = m.id AND mmr.year_month = ${ym}
WHERE 1=1
${search ? sql` AND (m.title ILIKE '%' || ${search} || '%' OR m.artist ILIKE '%' || ${search} || '%')` : sql``}
${typeof categoryId === 'number' && Number.isFinite(categoryId) ? sql` AND m.category_id = ${categoryId}` : sql``}
${typeof grade === 'number' ? sql` AND m.grade_required = ${grade}` : sql``}
${typeof musicType === 'boolean' ? (musicType ? sql` AND m.inst = true` : sql` AND m.inst = false`) : sql``}
ORDER BY ${orderBySql}
OFFSET ${offset} LIMIT ${limit}
  `

  return base
}

export function buildMusicRewardsSummaryCountQuery(params: {
  year: number
  month: number
  search?: string
  categoryId?: number
  grade?: number
  musicType?: boolean
}) {
  const { year, month, search, categoryId, grade, musicType } = params
  const q = sql`
WITH month_range AS (
  SELECT
    make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') AS month_start,
    (make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second' AS month_end
)
SELECT COUNT(*) AS total
FROM musics m
LEFT JOIN music_categories mc ON mc.id = m.category_id
WHERE 1=1
${search ? sql` AND (m.title ILIKE '%' || ${search} || '%' OR m.artist ILIKE '%' || ${search} || '%')` : sql``}
${typeof categoryId === 'number' && Number.isFinite(categoryId) ? sql` AND m.category_id = ${categoryId}` : sql``}
${typeof grade === 'number' ? sql` AND m.grade_required = ${grade}` : sql``}
${typeof musicType === 'boolean' ? (musicType ? sql` AND m.inst = true` : sql` AND m.inst = false`) : sql``}
  `
  return q
} 