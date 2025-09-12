"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const toBool = (v) => v === true || v === 't' || v === 'T' || v === 1 || v === '1';
let MusicsService = class MusicsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async searchList(params) {
        const { grade, isAuth, query } = params;
        const limit = query.limit ?? 20;
        let cursorCreatedAt;
        let cursorId;
        if (query.cursor && (query.sort === 'newest' || !query.sort)) {
            try {
                const parsed = JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf8'));
                cursorCreatedAt = parsed.ca;
                cursorId = parsed.id;
            }
            catch { }
        }
        const wheres = [(0, drizzle_orm_1.sql) `1=1`];
        if (query.q && (query.mode === 'keyword' || !query.mode)) {
            wheres.push((0, drizzle_orm_1.sql) `(m.title ILIKE ${'%' + query.q + '%'} OR m.artist ILIKE ${'%' + query.q + '%'})`);
        }
        if (query.category_id !== undefined && query.category_id !== null && query.category_id !== '') {
            const n = Number(query.category_id);
            if (Number.isFinite(n)) {
                wheres.push((0, drizzle_orm_1.sql) `m.category_id = ${n}`);
            }
        }
        if (query.reward_max != null) {
            wheres.push((0, drizzle_orm_1.sql) `mm.reward_per_play <= ${query.reward_max}`);
        }
        if (query.remaining_reward_max != null) {
            wheres.push((0, drizzle_orm_1.sql) `(mm.remaining_reward_count * mm.reward_per_play) <= ${query.remaining_reward_max}`);
        }
        const days = 30;
        const sort = query.sort ?? 'newest';
        const orderBy = sort === 'newest'
            ? (0, drizzle_orm_1.sql) `m.created_at DESC, m.id DESC`
            : sort === 'most_played'
                ? (0, drizzle_orm_1.sql) `COALESCE(pop.recent_valid_plays,0) DESC, m.created_at DESC, m.id DESC`
                : sort === 'remaining_reward'
                    ? (0, drizzle_orm_1.sql) `(mm.remaining_reward_count * mm.reward_per_play) DESC NULLS LAST, m.created_at DESC, m.id DESC`
                    :
                        (0, drizzle_orm_1.sql) `COALESCE(pop.recent_valid_plays,0) DESC, m.created_at DESC, m.id DESC`;
        if ((query.sort === 'newest' || !query.sort) && cursorCreatedAt && cursorId) {
            wheres.push((0, drizzle_orm_1.sql) `(m.created_at, m.id) < (${cursorCreatedAt}::timestamptz, ${cursorId})`);
        }
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      WITH my AS (
        SELECT CASE ${grade}::text
          WHEN 'free' THEN 0
          WHEN 'standard' THEN 1
          WHEN 'business' THEN 2
          ELSE 0
        END AS lvl
      ),
      mm AS (
        SELECT music_id, total_reward_count, remaining_reward_count, reward_per_play
        FROM monthly_music_rewards
        WHERE year_month = to_char(now(), 'YYYY-MM')
      ),
      pop AS (
        SELECT music_id, COUNT(*)::int AS recent_valid_plays
        FROM music_plays
        WHERE is_valid_play = true
          AND created_at >= now() - (${days} || ' days')::interval
        GROUP BY music_id
      )
      SELECT
        m.id,
        m.title,
        m.artist,
        m.cover_image_url,
        m.inst,
        (m.lyrics_text IS NOT NULL OR m.lyrics_file_path IS NOT NULL) AS has_lyrics_raw,
        m.grade_required,
        CASE WHEN (SELECT lvl FROM my) = 0 THEN (m.grade_required = 0) ELSE TRUE END AS can_use_sql,
        m.category_id,  -- 필요하면 dto에 category_id로 반영
        mm.reward_per_play,
        mm.total_reward_count,
        mm.remaining_reward_count,
        (mm.total_reward_count * mm.reward_per_play)     AS reward_total,
        (mm.remaining_reward_count * mm.reward_per_play) AS reward_remain,
        COALESCE(pop.recent_valid_plays, 0)              AS popularity,
        m.created_at
      FROM musics m
      LEFT JOIN mm  ON mm.music_id  = m.id
      LEFT JOIN pop ON pop.music_id = m.id
      WHERE ${drizzle_orm_1.sql.join(wheres, (0, drizzle_orm_1.sql) ` AND `)}
      ORDER BY ${orderBy}
      LIMIT ${limit + 1}
    `);
        const rows = Array.isArray(result) ? result : (result?.rows ?? []);
        const items = rows.slice(0, limit).map((r) => {
            const required = Number(r.grade_required);
            const gradePass = required === 0 ? true : (grade !== 'free');
            const canUse = !!isAuth && gradePass;
            const inst = toBool(r.inst);
            const hasLyricsRaw = toBool(r.has_lyrics_raw);
            const dto = {
                id: Number(r.id),
                title: r.title,
                artist: r.artist,
                cover_image_url: r.cover_image_url ?? null,
                format: inst ? 'INSTRUMENTAL' : 'FULL',
                has_lyrics: hasLyricsRaw && !inst,
                grade_required: required,
                can_use: canUse,
                reward: {
                    reward_one: r.reward_per_play ?? null,
                    reward_total: r.reward_total ?? null,
                    reward_remain: r.reward_remain ?? null,
                    total_count: r.total_reward_count ?? null,
                    remain_count: r.remaining_reward_count ?? null,
                },
                popularity: Number(r.popularity ?? 0),
                created_at: r.created_at,
            };
            return dto;
        });
        const hasMore = rows.length > limit;
        let nextCursor = null;
        if ((query.sort === 'newest' || !query.sort) && hasMore && items.length) {
            const last = items[items.length - 1];
            nextCursor = Buffer.from(JSON.stringify({ ca: last.created_at, id: last.id }), 'utf8').toString('base64url');
        }
        return { items, nextCursor };
    }
    async listCategories() {
        try {
            const res = await this.db.execute((0, drizzle_orm_1.sql) `
        SELECT c.id AS category_id, c.name AS category_name
        FROM categories c
        ORDER BY c.name ASC, c.id ASC
      `);
            const rows = Array.isArray(res) ? res : (res?.rows ?? []);
            return rows.map((r) => ({
                category_id: Number(r.category_id),
                category_name: String(r.category_name ?? ''),
            }));
        }
        catch {
            try {
                const res2 = await this.db.execute((0, drizzle_orm_1.sql) `
          SELECT DISTINCT m.category_id AS category_id
          FROM musics m
          WHERE m.category_id IS NOT NULL
          ORDER BY m.category_id ASC
        `);
                const rows2 = Array.isArray(res2) ? res2 : (res2?.rows ?? []);
                return rows2.map((r) => ({
                    category_id: Number(r.category_id),
                    category_name: String(r.category_id),
                }));
            }
            catch {
                return [];
            }
        }
    }
    async getDetail(params) {
        const { companyId, grade, isAuth, musicId } = params;
        const days = 30;
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      WITH my AS (
        SELECT CASE
          WHEN ${grade}::text = 'free' THEN 0
          WHEN ${grade}::text = 'standard' THEN 1
          WHEN ${grade}::text = 'business' THEN 2
          ELSE 0
        END AS lvl
      ),
      mm AS (
        SELECT music_id, total_reward_count, remaining_reward_count, reward_per_play
        FROM monthly_music_rewards
        WHERE year_month = to_char(now(), 'YYYY-MM')
      ),
      pop AS (
        SELECT music_id, COUNT(*)::int AS recent_valid_plays
        FROM music_plays
        WHERE is_valid_play = true
          AND created_at >= now() - (${days} || ' days')::interval
        GROUP BY music_id
      )
      SELECT
        m.id, m.title, m.artist, m.cover_image_url, m.inst,
        (m.lyrics_text IS NOT NULL OR m.lyrics_file_path IS NOT NULL) AS has_lyrics_raw,
        m.lyrics_text, m.lyrics_file_path,
        m.grade_required,
        CASE WHEN (SELECT lvl FROM my) = 0 THEN (m.grade_required = 0) ELSE TRUE END AS can_use_sql,
        m.category_id, c.name AS category_name,
        m.duration_sec, m.price_per_play,
        mm.reward_per_play, mm.total_reward_count, mm.remaining_reward_count,
        (mm.total_reward_count * mm.reward_per_play)     AS reward_total,
        (mm.remaining_reward_count * mm.reward_per_play) AS reward_remain,
        COALESCE(pop.recent_valid_plays,0)               AS popularity,
        m.created_at,
        (cm.id IS NOT NULL)                              AS is_using
      FROM musics m
      LEFT JOIN mm  ON mm.music_id  = m.id
      LEFT JOIN pop ON pop.music_id = m.id
      LEFT JOIN music_categories c ON c.id = m.category_id
      LEFT JOIN company_musics cm
        ON cm.music_id = m.id AND cm.company_id = ${companyId}
      WHERE m.id = ${musicId}
      LIMIT 1
    `);
        const row = Array.isArray(result) ? result[0] : result?.rows?.[0];
        if (!row)
            throw new Error('Music not found');
        const required = Number(row.grade_required);
        const gradePass = required === 0 ? true : (grade !== 'free');
        const canUse = !!isAuth && gradePass;
        const inst = toBool(row.inst);
        const hasLyricsRaw = toBool(row.has_lyrics_raw);
        const dto = {
            id: Number(row.id),
            title: row.title,
            artist: row.artist,
            cover_image_url: row.cover_image_url ?? null,
            format: inst ? 'INSTRUMENTAL' : 'FULL',
            has_lyrics: hasLyricsRaw && !inst,
            lyrics_text: row.lyrics_text ?? null,
            lyrics_file_path: row.lyrics_file_path ?? null,
            grade_required: required,
            can_use: canUse,
            reward: {
                reward_one: row.reward_per_play ?? null,
                reward_total: row.reward_total ?? null,
                reward_remain: row.reward_remain ?? null,
                total_count: row.total_reward_count ?? null,
                remain_count: row.remaining_reward_count ?? null,
            },
            popularity: Number(row.popularity ?? 0),
            created_at: row.created_at,
            category_id: row.category_id ?? null,
            category_name: row.category_name ?? null,
            duration_sec: row.duration_sec ?? null,
            price_per_play: row.price_per_play ?? null,
            is_using: !!row.is_using,
        };
        return dto;
    }
    async useMusic(companyId, musicId) {
        const found = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT id
      FROM company_musics
      WHERE company_id = ${companyId} AND music_id = ${musicId}
      LIMIT 1
    `);
        const one = Array.isArray(found) ? found[0] : found?.rows?.[0];
        if (one?.id) {
            return { using_id: Number(one.id), is_using: true };
        }
        const ins = await this.db.execute((0, drizzle_orm_1.sql) `
      INSERT INTO company_musics (company_id, music_id)
      VALUES (${companyId}, ${musicId})
      RETURNING id
    `);
        const row = Array.isArray(ins) ? ins[0] : ins?.rows?.[0];
        return { using_id: Number(row.id), is_using: true };
    }
};
exports.MusicsService = MusicsService;
exports.MusicsService = MusicsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [Object])
], MusicsService);
//# sourceMappingURL=musics.service.js.map