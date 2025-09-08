"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardsRelations = exports.rewards = exports.rewardCodeEnum2 = exports.rewardStatusEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const companies_1 = require("./companies");
const musics_1 = require("./musics");
const music_plays_1 = require("./music_plays");
exports.rewardStatusEnum = (0, pg_core_1.pgEnum)('reward_status', ['successed', 'falied', 'pending']);
exports.rewardCodeEnum2 = (0, pg_core_1.pgEnum)('reward_code', ['0', '1', '2', '3']);
exports.rewards = (0, pg_core_1.pgTable)('rewards', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    company_id: (0, pg_core_1.bigint)('company_id', { mode: 'number' }).notNull(),
    music_id: (0, pg_core_1.bigint)('music_id', { mode: 'number' }).notNull(),
    play_id: (0, pg_core_1.bigint)('play_id', { mode: 'number' }).notNull(),
    reward_code: (0, exports.rewardCodeEnum2)('reward_code').notNull(),
    amount: (0, pg_core_1.numeric)('amount').notNull(),
    status: (0, exports.rewardStatusEnum)('status').notNull().default('pending'),
    payout_tx_hash: (0, pg_core_1.text)('payout_tx_hash'),
    block_number: (0, pg_core_1.integer)('block_number'),
    gas_used: (0, pg_core_1.bigint)('gas_used', { mode: 'number' }),
    blockchain_recorded_at: (0, pg_core_1.timestamp)('blockchain_recorded_at'),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.rewardsRelations = (0, drizzle_orm_1.relations)(exports.rewards, ({ one }) => ({
    company: one(companies_1.companies, {
        fields: [exports.rewards.company_id],
        references: [companies_1.companies.id],
    }),
    music: one(musics_1.musics, {
        fields: [exports.rewards.music_id],
        references: [musics_1.musics.id],
    }),
    play: one(music_plays_1.music_plays, {
        fields: [exports.rewards.play_id],
        references: [music_plays_1.music_plays.id],
    }),
}));
//# sourceMappingURL=rewards.js.map