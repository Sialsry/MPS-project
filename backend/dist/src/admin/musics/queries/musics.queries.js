"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFindAllQuery = buildFindAllQuery;
exports.buildFindOneQuery = buildFindOneQuery;
exports.buildUpsertNextMonthRewardsQuery = buildUpsertNextMonthRewardsQuery;
exports.buildCleanupOrphanCategoriesQuery = buildCleanupOrphanCategoriesQuery;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../../db/schema");
function buildFindAllQuery(params) {
    const { search, categoryLabel, musicType, idSortFilter, releaseDateSortFilter, rewardLimitFilter, currentMonth, limit, offset, } = params;
    const conditions = [];
    if (search) {
        conditions.push((0, drizzle_orm_1.sql) `(musics.title ILIKE ${`%${search}%`} OR musics.artist ILIKE ${`%${search}%`} OR music_tags.text ILIKE ${`%${search}%`})`);
    }
    if (categoryLabel && categoryLabel !== '전체') {
        conditions.push((0, drizzle_orm_1.sql) `music_categories.name = ${categoryLabel}`);
    }
    if (musicType && musicType !== '전체') {
        if (musicType === 'Inst') {
            conditions.push((0, drizzle_orm_1.sql) `musics.inst = true`);
        }
        else if (musicType === '일반') {
            conditions.push((0, drizzle_orm_1.sql) `musics.inst = false`);
        }
    }
    const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.sql) `WHERE ${drizzle_orm_1.sql.join(conditions, (0, drizzle_orm_1.sql) ` AND `)}` : (0, drizzle_orm_1.sql) ``;
    let orderByClause = (0, drizzle_orm_1.sql) ``;
    if (idSortFilter === '오름차순')
        orderByClause = (0, drizzle_orm_1.sql) `ORDER BY musics.id ASC`;
    else if (idSortFilter === '내림차순')
        orderByClause = (0, drizzle_orm_1.sql) `ORDER BY musics.id DESC`;
    else if (releaseDateSortFilter === '오름차순')
        orderByClause = (0, drizzle_orm_1.sql) `ORDER BY musics.release_date ASC`;
    else if (releaseDateSortFilter === '내림차순')
        orderByClause = (0, drizzle_orm_1.sql) `ORDER BY musics.release_date DESC`;
    else if (rewardLimitFilter === '오름차순')
        orderByClause = (0, drizzle_orm_1.sql) `ORDER BY maxRewardLimit ASC`;
    else if (rewardLimitFilter === '내림차순')
        orderByClause = (0, drizzle_orm_1.sql) `ORDER BY maxRewardLimit DESC`;
    else
        orderByClause = (0, drizzle_orm_1.sql) `ORDER BY musics.created_at DESC`;
    const query = (0, drizzle_orm_1.sql) `
    SELECT
      musics.id,
      musics.title,
      musics.artist,
      musics.inst AS musicType,
      music_categories.name AS category,
      STRING_AGG(DISTINCT music_tags.text, ', ') AS tags,
      musics.release_date AS releaseDate,
      musics.grade_required AS grade,
      COALESCE(${schema_1.monthly_music_rewards.total_reward_count} * ${schema_1.monthly_music_rewards.reward_per_play}, 0) AS maxRewardLimit,
      musics.created_at AS createdAt
    FROM musics
    LEFT JOIN music_categories ON musics.category_id = music_categories.id
    LEFT JOIN music_tags ON musics.id = music_tags.music_id
    LEFT JOIN monthly_music_rewards ON musics.id = monthly_music_rewards.music_id AND monthly_music_rewards.year_month = ${currentMonth}
    ${whereClause}
    GROUP BY musics.id, musics.title, musics.artist, musics.inst, music_categories.name, musics.release_date, musics.grade_required, musics.created_at, monthly_music_rewards.total_reward_count, monthly_music_rewards.reward_per_play
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset}
  `;
    return query;
}
function buildFindOneQuery(id, currentMonth) {
    return (0, drizzle_orm_1.sql) `
    SELECT
      m.id,
      m.title,
      m.artist,
      m.inst AS "inst",
      mc.name AS "category",
      COALESCE(STRING_AGG(DISTINCT mt.text, ', '), '') AS "tags",
      COALESCE(STRING_AGG(DISTINCT rt.name, ', '), '') AS "normalizedTags",
      m.release_date AS "releaseDate",
      m.duration_sec AS "durationSec",
      m.isrc AS "isrc",
      m.lyricist AS "lyricist",
      m.composer AS "composer",
      m.music_arranger AS "arranger",
      m.lyrics_text AS "lyricsText",
      m.lyrics_file_path AS "lyricsFilePath",
      m.file_path AS "audioFilePath",
      m.cover_image_url AS "coverImageUrl",
      m.price_per_play AS "priceMusicOnly",
      m.lyrics_price AS "priceLyricsOnly",
      m.created_at AS "createdAt",
      m.grade_required AS "grade",
      COALESCE(mmr.total_reward_count * mmr.reward_per_play, 0) AS "maxRewardLimit",
      mmr.reward_per_play AS "rewardPerPlay",
      mmr.total_reward_count AS "maxPlayCount"
    FROM musics m
    LEFT JOIN music_categories mc ON m.category_id = mc.id
    LEFT JOIN music_tags mt ON m.id = mt.music_id
    LEFT JOIN raw_tags rt ON LOWER(rt.name) = LOWER(mt.text)
    LEFT JOIN monthly_music_rewards mmr ON m.id = mmr.music_id AND mmr.year_month = ${currentMonth}
    WHERE m.id = ${id}
    GROUP BY m.id, m.title, m.artist, m.inst, mc.name, m.release_date, m.duration_sec, m.isrc, m.lyricist, m.composer, m.music_arranger, m.lyrics_text, m.lyrics_file_path, m.file_path, m.cover_image_url, m.price_per_play, m.lyrics_price, m.created_at, m.grade_required, mmr.total_reward_count, mmr.reward_per_play
    LIMIT 1
  `;
}
function buildUpsertNextMonthRewardsQuery(params) {
    const { musicId, yearMonth, totalRewardCount, rewardPerPlay, remainingRewardCount } = params;
    return (0, drizzle_orm_1.sql) `
    WITH existing_record AS (
      SELECT id FROM ${schema_1.monthly_music_rewards} 
      WHERE music_id = ${musicId} AND year_month = ${yearMonth}
    ),
    updated AS (
      UPDATE ${schema_1.monthly_music_rewards} 
      SET 
        total_reward_count = ${totalRewardCount},
        remaining_reward_count = ${remainingRewardCount},
        reward_per_play = ${rewardPerPlay},
        updated_at = now()
      WHERE music_id = ${musicId} AND year_month = ${yearMonth}
      RETURNING music_id, year_month
    ),
    inserted AS (
      INSERT INTO ${schema_1.monthly_music_rewards} (music_id, year_month, total_reward_count, remaining_reward_count, reward_per_play)
      SELECT ${musicId}, ${yearMonth}, ${totalRewardCount}, ${remainingRewardCount}, ${rewardPerPlay}
      WHERE NOT EXISTS (SELECT 1 FROM existing_record)
      RETURNING music_id, year_month
    )
    SELECT music_id, year_month FROM updated
    UNION ALL
    SELECT music_id, year_month FROM inserted
  `;
}
function buildCleanupOrphanCategoriesQuery() {
    return (0, drizzle_orm_1.sql) `
    delete from ${schema_1.music_categories} c
    where not exists (
      select 1 from ${schema_1.musics} m where m.category_id = c.id
    )
  `;
}
//# sourceMappingURL=musics.queries.js.map