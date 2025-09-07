import { sql } from 'drizzle-orm'
import { buildMonthRangeCTE } from '../../../common/utils/date.util'

export const buildCategoryTop5Query = (ymYear: number, ymMonth: number, tz: string, limit: number = 5) => sql`
  WITH month_range AS (
    SELECT 
      make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) AS month_start,
      (make_timestamptz(${ymYear}, ${ymMonth}, 1, 0, 0, 0, ${tz}) + interval '1 month') - interval '1 second' AS month_end
  ),
  category_plays AS (
    SELECT 
      COALESCE(mc.name, '미분류') AS category,
      COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS valid_plays
    FROM music_plays mp
    JOIN musics m ON m.id = mp.music_id
    LEFT JOIN music_categories mc ON mc.id = m.category_id
    , month_range mr
    WHERE mp.created_at >= mr.month_start 
      AND mp.created_at <= mr.month_end
    GROUP BY mc.name
  ),
  ranked AS (
    SELECT 
      category,
      valid_plays,
      ROW_NUMBER() OVER (ORDER BY valid_plays DESC) AS rank
    FROM category_plays
  )
  SELECT category, valid_plays, rank
  FROM ranked
  WHERE rank <= ${limit}
  ORDER BY rank ASC
`
