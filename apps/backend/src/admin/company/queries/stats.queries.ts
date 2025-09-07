import { sql } from 'drizzle-orm'
import { buildDayRangeCTE } from '../../../common/utils/date.util'

export const buildRenewalStatsQuery = (ymYear: number, ymMonth: number, tz: string) => sql`
  WITH anchor AS (
    SELECT make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) AS m
  ),
  cur AS (
    SELECT cs.company_id
    FROM company_subscriptions cs, anchor a
    WHERE cs.start_date < (a.m + interval '1 month')
      AND cs.end_date   >= a.m
    GROUP BY cs.company_id
  ),
  prev AS (
    SELECT cs.company_id
    FROM company_subscriptions cs, anchor a
    WHERE cs.start_date < ((a.m - interval '1 month') + interval '1 month')
      AND cs.end_date   >= (a.m - interval '1 month')
    GROUP BY cs.company_id
  )
  SELECT 
    (SELECT COUNT(*) FROM prev) AS prev_active,
    (SELECT COUNT(*) FROM cur) AS curr_active,
    (SELECT COUNT(*) FROM prev p INNER JOIN cur c ON c.company_id = p.company_id) AS retained,
    (SELECT COUNT(*) FROM prev p LEFT JOIN cur c ON c.company_id = p.company_id WHERE c.company_id IS NULL) AS churned,
    (SELECT COUNT(*) FROM cur c LEFT JOIN prev p ON p.company_id = c.company_id WHERE p.company_id IS NULL) AS reactivated
`

export const buildHourlyValidPlaysQuery = (y: number, m: number, d: number, tz: string) => {
  const dayCte = buildDayRangeCTE(y, m, d)
  return sql`
    ${dayCte}
    , hours AS (
      SELECT generate_series(0,23) AS h
    ),
    today AS (
      SELECT 
        EXTRACT(HOUR FROM (mp.created_at AT TIME ZONE ${tz}))::int AS h,
        c.grade,
        COUNT(*) AS cnt
      FROM music_plays mp
      JOIN companies c ON c.id = mp.using_company_id
      WHERE mp.is_valid_play = true
        AND mp.created_at >= (SELECT day_start FROM day_range)
        AND mp.created_at <  (SELECT day_end FROM day_range)
      GROUP BY 1, c.grade
    ),
    today_pivot AS (
      SELECT 
        h.h,
        COALESCE(SUM(t.cnt) FILTER (WHERE t.grade = 'free'), 0) AS free,
        COALESCE(SUM(t.cnt) FILTER (WHERE t.grade = 'standard'), 0) AS standard,
        COALESCE(SUM(t.cnt) FILTER (WHERE t.grade = 'business'), 0) AS business
      FROM hours h
      LEFT JOIN today t ON t.h = h.h
      GROUP BY h.h
    ),
    yday AS (
      SELECT 
        EXTRACT(HOUR FROM (mp.created_at AT TIME ZONE ${tz}))::int AS h,
        c.grade,
        COUNT(*) AS cnt
      FROM music_plays mp
      JOIN companies c ON c.id = mp.using_company_id
      WHERE mp.is_valid_play = true
        AND mp.created_at >= ((SELECT day_start FROM day_range) - interval '1 day')
        AND mp.created_at <  (SELECT day_start FROM day_range)
      GROUP BY 1, c.grade
    ),
    yday_pivot AS (
      SELECT 
        h.h,
        COALESCE(SUM(t.cnt) FILTER (WHERE t.grade = 'free'), 0) AS free,
        COALESCE(SUM(t.cnt) FILTER (WHERE t.grade = 'standard'), 0) AS standard,
        COALESCE(SUM(t.cnt) FILTER (WHERE t.grade = 'business'), 0) AS business
      FROM hours h
      LEFT JOIN yday t ON t.h = h.h
      GROUP BY h.h
    )
    SELECT 
      tp.h,
      tp.free,
      tp.standard,
      tp.business,
      ROUND(((yp.free + yp.standard + yp.business)::numeric / 3))::int AS prev_avg
    FROM today_pivot tp
    JOIN yday_pivot yp ON yp.h = tp.h
    ORDER BY tp.h ASC
  `
}

export const buildTierDistributionQuery = (ymYear: number, ymMonth: number, tz: string) => sql`
  WITH month_range AS (
    SELECT 
      make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) AS month_start,
      (make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) + interval '1 month') - interval '1 second' AS month_end
  ),
  active_companies AS (
    SELECT DISTINCT c.id, c.grade
    FROM companies c
    WHERE c.created_at <= (SELECT month_end FROM month_range)
  )
  SELECT 
    COUNT(*) FILTER (WHERE grade = 'free') AS free,
    COUNT(*) FILTER (WHERE grade = 'standard') AS standard,
    COUNT(*) FILTER (WHERE grade = 'business') AS business,
    COUNT(*) AS total
  FROM active_companies
`


