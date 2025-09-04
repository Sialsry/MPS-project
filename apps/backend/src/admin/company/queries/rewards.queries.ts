import { sql } from 'drizzle-orm'

export const buildSummaryQuery = (companyId: number, ymYear: number, ymMonth: number, tz: string) => sql`
  WITH month_range AS (
    SELECT 
      make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) AS month_start,
      (make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) + interval '1 month') - interval '1 second' AS month_end
  ),
  plays AS (
    SELECT 
      COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS valid_play_count,
      COUNT(DISTINCT CASE WHEN mp.is_valid_play = true THEN mp.music_id END) AS active_tracks,
      COALESCE(SUM(CASE WHEN mp.is_valid_play = true THEN mp.reward_amount::numeric ELSE 0 END), 0) AS monthly_earned
    FROM music_plays mp, month_range mr
    WHERE mp.using_company_id = ${companyId}
      AND mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
  ),
  subs AS (
    SELECT COALESCE(SUM(cs.discount_amount::numeric), 0) AS monthly_used
    FROM company_subscriptions cs, month_range mr
    WHERE cs.company_id = ${companyId}
      AND cs.start_date >= mr.month_start AND cs.start_date <= mr.month_end
  ),
  latest_sub AS (
    SELECT start_date, end_date
    FROM company_subscriptions
    WHERE company_id = ${companyId}
    ORDER BY start_date DESC
    LIMIT 1
  )
  SELECT
    c.id AS company_id,
    c.name,
    c.grade,
    c.business_number,
    c.email,
    c.phone,
    c.homepage_url,
    c.profile_image_url,
    c.smart_account_address,
    c.ceo_name,
    c.created_at,
    c.updated_at,
    (c.total_rewards_earned::numeric - c.total_rewards_used::numeric) AS total_tokens,
    c.total_rewards_earned::numeric AS earned_total,
    c.total_rewards_used::numeric AS used_total,
    COALESCE(p.monthly_earned, 0) AS monthly_earned,
    COALESCE(s.monthly_used, 0) AS monthly_used,
    CASE 
      WHEN (c.total_rewards_earned::numeric - c.total_rewards_used::numeric) > 0 
        THEN ROUND((COALESCE(s.monthly_used, 0) / (c.total_rewards_earned::numeric - c.total_rewards_used::numeric)) * 100, 2)
      ELSE 0
    END AS usage_rate,
    COALESCE(p.active_tracks, 0) AS active_tracks,
    (SELECT start_date FROM latest_sub) AS subscription_start,
    (SELECT end_date FROM latest_sub) AS subscription_end
  FROM companies c
  LEFT JOIN plays p ON true
  LEFT JOIN subs s ON true
  WHERE c.id = ${companyId}
  LIMIT 1;
`

export const buildDailyQuery = (companyId: number, ymYear: number, ymMonth: number, tz: string) => sql`
  WITH month_range AS (
    SELECT 
      make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) AS month_start,
      (make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) + interval '1 month') - interval '1 second' AS month_end
  ),
  days AS (
    SELECT generate_series(
      (SELECT month_start FROM month_range),
      (SELECT month_end FROM month_range),
      interval '1 day'
    )::date AS d
  ),
  earned AS (
    SELECT DATE(mp.created_at AT TIME ZONE ${tz}) AS d,
           COALESCE(SUM(CASE WHEN mp.is_valid_play = true THEN mp.reward_amount::numeric ELSE 0 END), 0) AS earned
    FROM music_plays mp, month_range mr
    WHERE mp.using_company_id = ${companyId}
      AND mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
    GROUP BY 1
  ),
  used AS (
    SELECT DATE(cs.start_date AT TIME ZONE ${tz}) AS d,
           COALESCE(SUM(cs.discount_amount::numeric), 0) AS used
    FROM company_subscriptions cs, month_range mr
    WHERE cs.company_id = ${companyId}
      AND cs.start_date >= mr.month_start AND cs.start_date <= mr.month_end
    GROUP BY 1
  )
  SELECT 
    to_char(days.d, 'YYYY-MM-DD') AS date,
    COALESCE(e.earned, 0) AS earned,
    COALESCE(u.used, 0) AS used
  FROM days
  LEFT JOIN earned e ON e.d = days.d
  LEFT JOIN used u ON u.d = days.d
  ORDER BY days.d ASC;
`

export const buildByMusicQuery = (companyId: number, ymYear: number, ymMonth: number, tz: string) => sql`
  WITH month_range AS (
    SELECT 
      make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) AS month_start,
      (make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) + interval '1 month') - interval '1 second' AS month_end
  )
  SELECT 
    m.id AS music_id,
    m.title,
    m.artist,
    m.category_id::text AS category,
    COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS valid_plays,
    COALESCE(SUM(CASE WHEN mp.is_valid_play = true THEN mp.reward_amount::numeric ELSE 0 END), 0) AS earned
  FROM music_plays mp
  JOIN musics m ON m.id = mp.music_id
  , month_range mr
  WHERE mp.using_company_id = ${companyId}
    AND mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
  GROUP BY m.id, m.title, m.artist, m.category_id
  ORDER BY earned DESC, valid_plays DESC
  LIMIT 100;
`

export const buildSummaryListBaseQuery = (ymYear: number, ymMonth: number, tz: string) => sql`
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
`