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
exports.ExploreService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
function toBool(v) {
    return v === true || v === 't' || v === 'T' || v === 1 || v === '1';
}
let ExploreService = class ExploreService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSections(companyId, grade, isAuth) {
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
        SELECT
          music_id,
          total_reward_count,
          remaining_reward_count,
          reward_per_play
        FROM monthly_music_rewards
        WHERE year_month = to_char(now(), 'YYYY-MM')
      ),
      pop AS (
        SELECT music_id, COUNT(*)::int AS recent_valid_plays
        FROM music_plays
        WHERE is_valid_play = true
          AND created_at >= now() - interval '30 days'
        GROUP BY music_id
      )
      SELECT
        m.id,
        m.title,
        m.artist,
        m.cover_image_url,
        m.inst,
        (m.lyrics_text IS NOT NULL OR m.lyrics_file_path IS NOT NULL) AS has_lyrics_raw,
        m."grade_required" AS grade_required,
          CASE WHEN (SELECT lvl FROM my) = 0 THEN (m."grade_required" = 0) ELSE TRUE END AS can_use_sql,
        mm.reward_per_play,
        mm.total_reward_count,
        mm.remaining_reward_count,
        (mm.total_reward_count * mm.reward_per_play)       AS reward_total,
        (mm.remaining_reward_count * mm.reward_per_play)   AS reward_remain,
        COALESCE(pop.recent_valid_plays, 0)                AS popularity,
        m.created_at
      FROM musics m
      LEFT JOIN mm  ON mm.music_id  = m.id
      LEFT JOIN pop ON pop.music_id = m.id
      ORDER BY popularity DESC, m.created_at DESC
      LIMIT 60
    `);
        const rows = Array.isArray(result) ? result : (result?.rows ?? []);
        if (!Array.isArray(rows)) {
            throw new Error('Unexpected DB result shape from db.execute(sql`...`)');
        }
        const list = rows.map((r) => {
            const required = Number(r.grade_required);
            const gradePass = required === 0 ? true : (grade === 'standard' || grade === 'business');
            const canUse = !!isAuth && gradePass;
            const inst = toBool(r.inst);
            const hasLyricsRaw = toBool(r.has_lyrics_raw);
            const reason = !isAuth ? 'LOGIN_REQUIRED' : (gradePass ? 'OK' : 'SUBSCRIPTION_REQUIRED');
            return {
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
        });
        const featured = list.slice(0, 3);
        const news = {
            key: 'news',
            title: '새로 올라온 곡',
            items: [...list]
                .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
                .slice(0, 12),
        };
        const charts = {
            key: 'charts',
            title: '차트 Charts',
            items: [...list]
                .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
                .slice(0, 12),
        };
        const moods = {
            key: 'moods',
            title: '무드 & 장르',
            items: list.slice(0, 12),
        };
        return { featured, news, charts, moods };
    }
};
exports.ExploreService = ExploreService;
exports.ExploreService = ExploreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [Object])
], ExploreService);
//# sourceMappingURL=explore.service.js.map