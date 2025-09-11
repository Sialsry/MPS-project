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
exports.PlaylistService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_introspected_1 = require("../../db/schema.introspected");
let PlaylistService = class PlaylistService {
    db;
    constructor(db) {
        this.db = db;
    }
    rows(ret) {
        return Array.isArray(ret) ? ret : (ret?.rows ?? []);
    }
    firstRow(ret) {
        const r = this.rows(ret);
        return r[0];
    }
    async assertOwn(companyId, playlistId) {
        const [row] = await this.db
            .select({ id: schema_introspected_1.playlists.id, companyId: schema_introspected_1.playlists.companyId })
            .from(schema_introspected_1.playlists)
            .where((0, drizzle_orm_1.eq)(schema_introspected_1.playlists.id, BigInt(playlistId)))
            .limit(1);
        if (!row)
            throw new common_1.NotFoundException('Playlist not found');
        if (Number(row.companyId) !== companyId)
            throw new common_1.ForbiddenException('Not your playlist');
    }
    async list(companyId) {
        const raw = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        p.id                AS id,        -- bigint
        p.name              AS name,
        COALESCE(cnt.cnt,0) AS count,     -- int
        cov.cover_url       AS cover      -- text|null
      FROM playlists p
      LEFT JOIN (
        SELECT playlist_id, COUNT(*) AS cnt
        FROM playlist_items GROUP BY playlist_id
      ) cnt ON cnt.playlist_id = p.id
      LEFT JOIN LATERAL (
        SELECT m.cover_image_url AS cover_url
        FROM playlist_items pi JOIN musics m ON m.id = pi.music_id
        WHERE pi.playlist_id = p.id
        ORDER BY pi.added_at ASC, pi.id ASC
        LIMIT 1
      ) cov ON TRUE
      WHERE p.company_id = ${companyId}
      ORDER BY p.created_at DESC, p.id DESC
    `);
        return this.rows(raw).map((r) => ({
            id: Number(r.id),
            name: String(r.name ?? ''),
            count: Number(r.count ?? r.cnt ?? 0),
            cover: r.cover ?? r.cover_url ?? null,
        }));
    }
    async detail(companyId, playlistId) {
        await this.assertOwn(companyId, playlistId);
        const raw = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT p.id::bigint AS id, p.name, p.created_at, p.updated_at
      FROM playlists p WHERE p.id = ${playlistId}::bigint
    `);
        const row = this.firstRow(raw);
        if (!row)
            throw new common_1.NotFoundException('Playlist not found');
        return {
            id: Number(row.id),
            name: String(row.name ?? ''),
            created_at: String(row.created_at ?? ''),
            updated_at: String(row.updated_at ?? ''),
        };
    }
    async tracks(companyId, playlistId) {
        await this.assertOwn(companyId, playlistId);
        const raw = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        m.id::bigint                 AS id,
        m.title                      AS title,
        COALESCE(m.artist,'Various') AS artist,
        m.cover_image_url            AS "coverUrl",
        m.file_path                  AS "audioUrl",
        COALESCE(m.duration_sec,0)   AS "durationSec"
      FROM playlist_items pi
      JOIN musics m ON m.id = pi.music_id
      WHERE pi.playlist_id = ${playlistId}::bigint
      ORDER BY pi.added_at ASC, pi.id ASC
    `);
        return this.rows(raw).map((r) => ({
            id: Number(r.id),
            title: String(r.title ?? ''),
            artist: String(r.artist ?? 'Various'),
            coverUrl: r.coverUrl ?? null,
            audioUrl: String(r.audioUrl ?? ''),
            durationSec: Number(r.durationSec ?? 0),
        }));
    }
    async replaceTracks(companyId, playlistId, trackIds) {
        await this.assertOwn(companyId, playlistId);
        if (!Array.isArray(trackIds))
            throw new common_1.BadRequestException('trackIds must be an array');
        await this.db.transaction(async (tx) => {
            await tx.delete(schema_introspected_1.playlistItems).where((0, drizzle_orm_1.eq)(schema_introspected_1.playlistItems.playlistId, Number(playlistId)));
            if (trackIds.length) {
                const valid = await tx
                    .select({ id: schema_introspected_1.musics.id })
                    .from(schema_introspected_1.musics)
                    .where((0, drizzle_orm_1.inArray)(schema_introspected_1.musics.id, trackIds.map(BigInt)));
                const ids = this.rows(valid).map((v) => Number(v.id));
                if (ids.length) {
                    await tx.execute((0, drizzle_orm_1.sql) `
            INSERT INTO playlist_items (playlist_id, music_id, added_at)
            SELECT ${playlistId}::bigint, m_id::bigint, now()
            FROM unnest(${ids}::bigint[]) AS m_id
            ON CONFLICT (playlist_id, music_id) DO NOTHING
          `);
                }
            }
            await tx.update(schema_introspected_1.playlists)
                .set({ updatedAt: (0, drizzle_orm_1.sql) `now()` })
                .where((0, drizzle_orm_1.eq)(schema_introspected_1.playlists.id, BigInt(playlistId)));
        });
        const cntRaw = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*)::int AS count FROM playlist_items WHERE playlist_id = ${playlistId}::bigint
    `);
        const cntRow = this.firstRow(cntRaw);
        return { playlistId, count: Number(cntRow?.count ?? 0) };
    }
    async removeTracks(companyId, playlistId, trackIds) {
        await this.assertOwn(companyId, playlistId);
        if (!Array.isArray(trackIds) || trackIds.length === 0) {
            throw new common_1.BadRequestException('trackIds required');
        }
        const pid = Number(playlistId);
        return this.db.transaction(async (tx) => {
            await tx
                .delete(schema_introspected_1.playlistItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_introspected_1.playlistItems.playlistId, pid), (0, drizzle_orm_1.inArray)(schema_introspected_1.playlistItems.musicId, trackIds.map(Number))));
            const [{ count }] = await tx
                .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
                .from(schema_introspected_1.playlistItems)
                .where((0, drizzle_orm_1.eq)(schema_introspected_1.playlistItems.playlistId, pid));
            let playlistDeleted = false;
            if ((count ?? 0) === 0) {
                await tx.delete(schema_introspected_1.playlists).where((0, drizzle_orm_1.eq)(schema_introspected_1.playlists.id, BigInt(pid)));
                playlistDeleted = true;
            }
            return { playlistId: pid, count: count ?? 0, playlistDeleted };
        });
    }
    async create(companyId, dto) {
        const name = dto.name?.trim();
        if (!name)
            throw new common_1.BadRequestException('name required');
        return this.db.transaction(async (tx) => {
            const inserted = await tx
                .insert(schema_introspected_1.playlists)
                .values({
                companyId,
                name,
                createdAt: (0, drizzle_orm_1.sql) `now()`,
                updatedAt: (0, drizzle_orm_1.sql) `now()`,
            })
                .returning({ id: schema_introspected_1.playlists.id });
            const newIdBig = inserted?.[0]?.id;
            if (newIdBig === undefined || newIdBig === null) {
                throw new common_1.BadRequestException('failed to create playlist');
            }
            const newIdNum = Number(newIdBig);
            if (dto.trackIds?.length) {
                const valid = await tx
                    .select({ id: schema_introspected_1.musics.id })
                    .from(schema_introspected_1.musics)
                    .where((0, drizzle_orm_1.inArray)(schema_introspected_1.musics.id, dto.trackIds.map(BigInt)));
                const musicIdsBig = valid.map((v) => v.id);
                if (musicIdsBig.length) {
                    await tx.execute((0, drizzle_orm_1.sql) `
            INSERT INTO playlist_items (playlist_id, music_id, added_at)
            SELECT ${newIdBig}::bigint, m_id::bigint, now()
            FROM unnest(${musicIdsBig}::bigint[]) AS m_id
            ON CONFLICT (playlist_id, music_id) DO NOTHING
          `);
                }
            }
            return {
                id: newIdNum,
                name,
                count: dto.trackIds?.length ? dto.trackIds.length : 0,
                cover: null,
            };
        });
    }
    async remove(companyId, playlistId) {
        await this.assertOwn(companyId, playlistId);
        await this.db.transaction(async (tx) => {
            await tx.delete(schema_introspected_1.playlistItems).where((0, drizzle_orm_1.eq)(schema_introspected_1.playlistItems.playlistId, Number(playlistId)));
            await tx.delete(schema_introspected_1.playlists).where((0, drizzle_orm_1.eq)(schema_introspected_1.playlists.id, BigInt(playlistId)));
        });
        return { deleted: true };
    }
    async use(companyId, playlistId, dto) {
        await this.assertOwn(companyId, playlistId);
        const baseIds = dto.trackIds?.length
            ? dto.trackIds
            : this.rows(await this.db
                .select({ id: schema_introspected_1.playlistItems.musicId })
                .from(schema_introspected_1.playlistItems)
                .where((0, drizzle_orm_1.eq)(schema_introspected_1.playlistItems.playlistId, Number(playlistId)))).map((r) => Number(r.id));
        if (!baseIds.length)
            return { count: 0 };
        const found = await this.db
            .select({ id: schema_introspected_1.musics.id })
            .from(schema_introspected_1.musics)
            .where((0, drizzle_orm_1.inArray)(schema_introspected_1.musics.id, baseIds.map(BigInt)));
        return { count: this.rows(found).length };
    }
};
exports.PlaylistService = PlaylistService;
exports.PlaylistService = PlaylistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [Object])
], PlaylistService);
//# sourceMappingURL=playlists.service.js.map