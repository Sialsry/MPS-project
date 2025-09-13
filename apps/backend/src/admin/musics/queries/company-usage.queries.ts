import { SQL, sql } from 'drizzle-orm'

export function buildMusicCompanyUsageListQuery(params: {
  musicId: number
  year: number
  month: number
  search?: string
  limit: number
  offset: number
}): SQL {
  const { musicId, year, month, search, limit, offset } = params
  return sql`
WITH month_range AS (
  SELECT
    make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') AS month_start,
    (make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second' AS month_end
)
, plays AS (
  SELECT mp.using_company_id AS company_id,
         COUNT(*) AS monthly_plays,
         COALESCE(SUM(r.amount::numeric), 0) AS monthly_earned
  FROM rewards r
  JOIN music_plays mp ON mp.id = r.play_id
  , month_range mr
  WHERE r.music_id = ${musicId}
    AND r.created_at >= mr.month_start AND r.created_at <= mr.month_end
    AND r.reward_code = '1'
  GROUP BY mp.using_company_id
)
SELECT 
  p.company_id AS company_id,
  COALESCE(c.name, 'Unknown') AS company_name,
  COALESCE(c.grade, 'free') AS grade,
  COALESCE(p.monthly_plays, 0) AS monthly_plays,
  COALESCE(p.monthly_earned, 0) AS monthly_earned
FROM plays p
LEFT JOIN companies c ON c.id = p.company_id
${search ? sql` AND (c.name ILIKE '%' || ${search} || '%' OR c.id::text ILIKE '%' || ${search} || '%')` : sql``}
ORDER BY p.monthly_earned DESC, p.monthly_plays DESC
OFFSET ${offset} LIMIT ${limit}
  `
}

export function buildMusicCompanyUsageCountQuery(params: {
  musicId: number
  year: number
  month: number
  search?: string
}): SQL {
  const { musicId, year, month, search } = params
  return sql`
WITH month_range AS (
  SELECT
    make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') AS month_start,
    (make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second' AS month_end
)
, plays AS (
  SELECT mp.using_company_id AS company_id
  FROM rewards r
  JOIN music_plays mp ON mp.id = r.play_id
  , month_range mr
  WHERE r.music_id = ${musicId}
    AND r.created_at >= mr.month_start AND r.created_at <= mr.month_end
    AND r.reward_code = '1'
  GROUP BY mp.using_company_id
)
SELECT COUNT(*) AS total
FROM plays p
LEFT JOIN companies c ON c.id = p.company_id
${search ? sql` AND (c.name ILIKE '%' || ${search} || '%' OR c.id::text ILIKE '%' || ${search} || '%')` : sql``}
  `
} 