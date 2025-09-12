"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthly_music_rewardsRelations = exports.monthly_music_rewards = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const musics_1 = require("./musics");
exports.monthly_music_rewards = (0, pg_core_1.pgTable)('monthly_music_rewards', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    music_id: (0, pg_core_1.bigint)('music_id', { mode: 'number' }).notNull(),
    year_month: (0, pg_core_1.varchar)('year_month', { length: 7 }).notNull(),
    total_reward_count: (0, pg_core_1.integer)('total_reward_count').notNull(),
    remaining_reward_count: (0, pg_core_1.integer)('remaining_reward_count').notNull(),
    reward_per_play: (0, pg_core_1.numeric)('reward_per_play').notNull(),
    is_auto_reset: (0, pg_core_1.boolean)('is_auto_reset').default(true),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.monthly_music_rewardsRelations = (0, drizzle_orm_1.relations)(exports.monthly_music_rewards, ({ one }) => ({
    music: one(musics_1.musics, {
        fields: [exports.monthly_music_rewards.music_id],
        references: [musics_1.musics.id],
    }),
}));
//# sourceMappingURL=monthly_music_rewards.js.map