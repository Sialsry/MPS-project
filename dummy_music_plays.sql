-- 기업 3개, 30일치 music_plays 더미 데이터 생성
-- 기업 ID: 1, 2, 3 (실제 기업 ID에 맞게 수정 필요)

-- 1. 기업 1 (현재 기업 - 높은 사용량)
INSERT INTO music_plays (
  music_id, 
  using_company_id, 
  is_valid_play, 
  reward_amount, 
  created_at
)
SELECT 
  (random() * 9 + 1)::int as music_id,  -- 음원 ID 1-10
  1 as using_company_id,                -- 기업 ID 1
  true as is_valid_play,
  0.007 as reward_amount,
  base_date + (random() * 86400)::int * '1 second'::interval as created_at
FROM (
  SELECT 
    base_date,
    row_number() OVER (ORDER BY random()) as rn
  FROM (
    SELECT 
      generate_series('2025-01-01'::date, '2025-01-31'::date, '1 day'::interval)::date as base_date
  ) dates
  CROSS JOIN generate_series(1, 35)  -- 하루 최대 35회
) ranked
WHERE rn <= (25 + random() * 11)::int;  -- 하루 25-35회

-- 2. 기업 2 (업계 평균 - 중간 사용량)
INSERT INTO music_plays (
  music_id, 
  using_company_id, 
  is_valid_play, 
  reward_amount, 
  created_at
)
SELECT 
  (random() * 9 + 1)::int as music_id,
  2 as using_company_id,
  true as is_valid_play,
  0.007 as reward_amount,
  base_date + (random() * 86400)::int * '1 second'::interval as created_at
FROM (
  SELECT 
    base_date,
    row_number() OVER (ORDER BY random()) as rn
  FROM (
    SELECT 
      generate_series('2025-01-01'::date, '2025-01-31'::date, '1 day'::interval)::date as base_date
  ) dates
  CROSS JOIN generate_series(1, 30)  -- 하루 최대 30회
) ranked
WHERE rn <= (18 + random() * 9)::int;  -- 하루 18-27회

-- 3. 기업 3 (업계 평균 - 낮은 사용량)
INSERT INTO music_plays (
  music_id, 
  using_company_id, 
  is_valid_play, 
  reward_amount, 
  created_at
)
SELECT 
  (random() * 9 + 1)::int as music_id,
  3 as using_company_id,
  true as is_valid_play,
  0.007 as reward_amount,
  base_date + (random() * 86400)::int * '1 second'::interval as created_at
FROM (
  SELECT 
    base_date,
    row_number() OVER (ORDER BY random()) as rn
  FROM (
    SELECT 
      generate_series('2025-01-01'::date, '2025-01-31'::date, '1 day'::interval)::date as base_date
  ) dates
  CROSS JOIN generate_series(1, 25)  -- 하루 최대 25회
) ranked
WHERE rn <= (12 + random() * 8)::int;  -- 하루 12-20회

-- 결과 확인용 쿼리
SELECT 
  using_company_id,
  COUNT(*) as total_plays,
  COUNT(*) FILTER (WHERE is_valid_play = true) as valid_plays,
  SUM(reward_amount) FILTER (WHERE is_valid_play = true) as total_rewards
FROM music_plays 
WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01'
GROUP BY using_company_id
ORDER BY using_company_id;
