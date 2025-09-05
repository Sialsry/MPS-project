-- 기업 3개, 30일치 music_plays 더미 데이터 생성
-- 기업 ID: 1, 2, 3 (실제 기업 ID에 맞게 수정 필요)

-- 1. 기업 1 (현재 기업 - 높은 사용량)
INSERT INTO music_plays (
  music_id, 
  using_company_id, 
  is_valid_play, 
  reward_amount, 
  reward_code,
  use_case,
  use_price,
  play_duration_sec,
  created_at
)
SELECT 
  (random() * 7 + 18)::int as music_id,  -- 음원 ID 18-25
  1 as using_company_id,                -- 기업 ID 1
  true as is_valid_play,
  0.007 as reward_amount,
  (ARRAY['0', '1', '2', '3'])[floor(random() * 4 + 1)] as reward_code,
  (ARRAY['0', '1', '2'])[floor(random() * 3 + 1)] as use_case,
  0.01 as use_price,
  (60 + random() * 120)::int as play_duration_sec,  -- 60-180초
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
  reward_code,
  use_case,
  use_price,
  play_duration_sec,
  created_at
)
SELECT 
  (random() * 7 + 18)::int as music_id,
  2 as using_company_id,
  true as is_valid_play,
  0.007 as reward_amount,
  (ARRAY['0', '1', '2', '3'])[floor(random() * 4 + 1)] as reward_code,
  (ARRAY['0', '1', '2'])[floor(random() * 3 + 1)] as use_case,
  0.01 as use_price,
  (60 + random() * 120)::int as play_duration_sec,  -- 60-180초
  base_date + (random() * 86400)::int * '1 second'::interval as created_at
FROM (
  SELECT 
    base_date,
    row_number() OVER (ORDER BY random()) as rn
  FROM (
    SELECT 
      generate_series('2025-01-01'::date, '2025-01-31'::date, '1 day'::interval)::date as base_date
  ) dates
  CROSS JOIN generate_series(1, 20)  -- 하루 최대 20회
) ranked
WHERE rn <= (15 + random() * 6)::int;  -- 하루 15-20회

-- 3. 기업 3 (낮은 사용량)
INSERT INTO music_plays (
  music_id, 
  using_company_id, 
  is_valid_play, 
  reward_amount, 
  reward_code,
  use_case,
  use_price,
  play_duration_sec,
  created_at
)
SELECT 
  (random() * 7 + 18)::int as music_id,
  3 as using_company_id,
  true as is_valid_play,
  0.007 as reward_amount,
  (ARRAY['0', '1', '2', '3'])[floor(random() * 4 + 1)] as reward_code,
  (ARRAY['0', '1', '2'])[floor(random() * 3 + 1)] as use_case,
  0.01 as use_price,
  (60 + random() * 120)::int as play_duration_sec,  -- 60-180초
  base_date + (random() * 86400)::int * '1 second'::interval as created_at
FROM (
  SELECT 
    base_date,
    row_number() OVER (ORDER BY random()) as rn
  FROM (
    SELECT 
      generate_series('2025-01-01'::date, '2025-01-31'::date, '1 day'::interval)::date as base_date
  ) dates
  CROSS JOIN generate_series(1, 10)  -- 하루 최대 10회
) ranked
WHERE rn <= (5 + random() * 6)::int;  -- 하루 5-10회
