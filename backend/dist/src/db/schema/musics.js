"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.musicsRelations = exports.musics = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const music_categories_1 = require("./music_categories");
const music_tags_1 = require("./music_tags");
const music_plays_1 = require("./music_plays");
const rewards_1 = require("./rewards");
const playlist_items_1 = require("./playlist_items");
const monthly_music_rewards_1 = require("./monthly_music_rewards");
exports.musics = (0, pg_core_1.pgTable)('musics', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    file_path: (0, pg_core_1.varchar)('file_path', { length: 255 }).notNull().unique(),
    title: (0, pg_core_1.text)('title').notNull(),
    artist: (0, pg_core_1.text)('artist').notNull(),
    composer: (0, pg_core_1.text)('composer'),
    music_arranger: (0, pg_core_1.text)('music_arranger'),
    lyricist: (0, pg_core_1.text)('lyricist'),
    lyrics_text: (0, pg_core_1.text)('lyrics_text'),
    lyrics_file_path: (0, pg_core_1.text)('lyrics_file_path'),
    inst: (0, pg_core_1.boolean)('inst').notNull().default(false),
    isrc: (0, pg_core_1.text)('isrc'),
    duration_sec: (0, pg_core_1.integer)('duration_sec'),
    release_date: (0, pg_core_1.date)('release_date'),
    cover_image_url: (0, pg_core_1.text)('cover_image_url'),
    lyrics_download_count: (0, pg_core_1.bigint)('lyrics_download_count', { mode: 'number' }).default(0),
    price_per_play: (0, pg_core_1.numeric)('price_per_play'),
    lyrics_price: (0, pg_core_1.numeric)('lyrics_price'),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
    category_id: (0, pg_core_1.integer)('category_id'),
    grade: (0, pg_core_1.integer)('grade_required').notNull().default(0),
    total_valid_play_count: (0, pg_core_1.bigint)('valid_play_count', { mode: 'number' }).default(0),
    total_play_count: (0, pg_core_1.bigint)('total_play_count', { mode: 'number' }).default(0),
    total_rewarded_amount: (0, pg_core_1.numeric)('total_rewarded_amount').default('0'),
    total_revenue: (0, pg_core_1.numeric)('total_revenue').default('0'),
    file_size_bytes: (0, pg_core_1.bigint)('file_size_bytes', { mode: 'number' }),
    last_played_at: (0, pg_core_1.timestamp)('last_played_at', { withTimezone: true }),
});
exports.musicsRelations = (0, drizzle_orm_1.relations)(exports.musics, ({ many, one }) => ({
    category: one(music_categories_1.music_categories, {
        fields: [exports.musics.category_id],
        references: [music_categories_1.music_categories.id],
    }),
    tags: many(music_tags_1.music_tags),
    plays: many(music_plays_1.music_plays),
    rewards: many(rewards_1.rewards),
    playlist_items: many(playlist_items_1.playlist_items),
    monthly_rewards: many(monthly_music_rewards_1.monthly_music_rewards),
}));
//# sourceMappingURL=musics.js.map