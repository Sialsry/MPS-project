"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playlist_itemsRelations = exports.playlist_items = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const playlists_1 = require("./playlists");
const musics_1 = require("./musics");
exports.playlist_items = (0, pg_core_1.pgTable)('playlist_items', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    playlist_id: (0, pg_core_1.bigint)('playlist_id', { mode: 'number' }).notNull(),
    music_id: (0, pg_core_1.bigint)('music_id', { mode: 'number' }).notNull(),
    added_at: (0, pg_core_1.timestamp)('added_at', { withTimezone: true }).defaultNow(),
});
exports.playlist_itemsRelations = (0, drizzle_orm_1.relations)(exports.playlist_items, ({ one }) => ({
    playlist: one(playlists_1.playlists, {
        fields: [exports.playlist_items.playlist_id],
        references: [playlists_1.playlists.id],
    }),
    music: one(musics_1.musics, {
        fields: [exports.playlist_items.music_id],
        references: [musics_1.musics.id],
    }),
}));
//# sourceMappingURL=playlist_items.js.map