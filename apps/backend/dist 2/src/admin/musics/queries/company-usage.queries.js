"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMusicCompanyUsageListQuery = buildMusicCompanyUsageListQuery;
exports.buildMusicCompanyUsageCountQuery = buildMusicCompanyUsageCountQuery;
const drizzle_orm_1 = require("drizzle-orm");
function buildMusicCompanyUsageListQuery(params) {
    const { musicId, year, month, search, limit, offset } = params;
    return (0, drizzle_orm_1.sql) `
WITH month_range AS (
  SELECT
    make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') AS month_start,
    (make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second' AS month_end
)
, plays AS (
  SELECT mp.using_company_id AS company_id,
         COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS monthly_plays,
         COALESCE(SUM(CASE WHEN mp.is_valid_play = true THEN mp.reward_amount::numeric ELSE 0 END), 0) AS monthly_earned
  FROM music_plays mp, month_range mr
  WHERE mp.music_id = ${musicId}
    AND mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
  GROUP BY mp.using_company_id
)
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.grade AS grade,
  COALESCE(p.monthly_plays, 0) AS monthly_plays,
  COALESCE(p.monthly_earned, 0) AS monthly_earned
FROM companies c
LEFT JOIN plays p ON p.company_id = c.id
WHERE p.company_id IS NOT NULL
${search ? (0, drizzle_orm_1.sql) ` AND (c.name ILIKE '%' || ${search} || '%' OR c.id::text ILIKE '%' || ${search} || '%')` : (0, drizzle_orm_1.sql) ``}
ORDER BY p.monthly_earned DESC, p.monthly_plays DESC
OFFSET ${offset} LIMIT ${limit}
  `;
}
function buildMusicCompanyUsageCountQuery(params) {
    const { musicId, year, month, search } = params;
    return (0, drizzle_orm_1.sql) `
WITH month_range AS (
  SELECT
    make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') AS month_start,
    (make_timestamptz(${year}, ${month}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second' AS month_end
)
, plays AS (
  SELECT mp.using_company_id AS company_id
  FROM music_plays mp, month_range mr
  WHERE mp.music_id = ${musicId}
    AND mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
    AND mp.is_valid_play = true
  GROUP BY mp.using_company_id
)
SELECT COUNT(*) AS total
FROM companies c
LEFT JOIN plays p ON p.company_id = c.id
WHERE p.company_id IS NOT NULL
${search ? (0, drizzle_orm_1.sql) ` AND (c.name ILIKE '%' || ${search} || '%' OR c.id::text ILIKE '%' || ${search} || '%')` : (0, drizzle_orm_1.sql) ``}
  `;
}
//# sourceMappingURL=company-usage.queries.js.map