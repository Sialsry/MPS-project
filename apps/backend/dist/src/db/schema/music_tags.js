"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.music_tagsRelations = exports.music_tags = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const musics_1 = require("./musics");
const raw_tags_1 = require("./raw_tags");
exports.music_tags = (0, pg_core_1.pgTable)('music_tags', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    text: (0, pg_core_1.text)('text').notNull(),
    music_id: (0, pg_core_1.bigint)('music_id', { mode: 'number' }).notNull(),
    raw_tag_id: (0, pg_core_1.integer)('raw_tag_id').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.music_tagsRelations = (0, drizzle_orm_1.relations)(exports.music_tags, ({ one }) => ({
    music: one(musics_1.musics, {
        fields: [exports.music_tags.music_id],
        references: [musics_1.musics.id],
    }),
    raw_tag: one(raw_tags_1.raw_tags, {
        fields: [exports.music_tags.raw_tag_id],
        references: [raw_tags_1.raw_tags.id],
    }),
}));
//# sourceMappingURL=music_tags.js.map