"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companiesRelations = exports.companies = exports.companyGradeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const company_subscriptions_1 = require("./company_subscriptions");
const playlists_1 = require("./playlists");
const music_plays_1 = require("./music_plays");
const rewards_1 = require("./rewards");
const business_numbers_1 = require("./business_numbers");
exports.companyGradeEnum = (0, pg_core_1.pgEnum)('company_grade', ['free', 'standard', 'business']);
exports.companies = (0, pg_core_1.pgTable)('companies', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    business_number: (0, pg_core_1.text)('business_number').notNull().unique(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    password_hash: (0, pg_core_1.text)('password_hash').notNull(),
    phone: (0, pg_core_1.text)('phone'),
    grade: (0, exports.companyGradeEnum)('grade').notNull().default('free'),
    ceo_name: (0, pg_core_1.text)('ceo_name'),
    profile_image_url: (0, pg_core_1.text)('profile_image_url'),
    homepage_url: (0, pg_core_1.text)('homepage_url'),
    smart_account_address: (0, pg_core_1.text)('smart_account_address').unique(),
    api_key_hash: (0, pg_core_1.text)('api_key_hash'),
    total_rewards_earned: (0, pg_core_1.numeric)('total_rewards_earned').default('0'),
    total_rewards_used: (0, pg_core_1.numeric)('total_rewards_used').default('0'),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.companiesRelations = (0, drizzle_orm_1.relations)(exports.companies, ({ many }) => ({
    subscriptions: many(company_subscriptions_1.company_subscriptions),
    playlists: many(playlists_1.playlists),
    music_plays: many(music_plays_1.music_plays),
    rewards: many(rewards_1.rewards),
    business_numbers: many(business_numbers_1.business_numbers),
}));
//# sourceMappingURL=companies.js.map