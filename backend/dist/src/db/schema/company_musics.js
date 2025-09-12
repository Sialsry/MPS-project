"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.company_musicsRelations = exports.company_musics = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_orm_2 = require("drizzle-orm");
const companies_1 = require("./companies");
const musics_1 = require("./musics");
exports.company_musics = (0, pg_core_1.pgTable)('company_musics', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    company_id: (0, pg_core_1.bigint)('company_id', { mode: 'number' })
        .notNull()
        .references(() => companies_1.companies.id, { onDelete: 'cascade' }),
    music_id: (0, pg_core_1.bigint)('music_id', { mode: 'number' })
        .notNull()
        .references(() => musics_1.musics.id, { onDelete: 'cascade' }),
    created_at: (0, pg_core_1.date)('created_at', { mode: 'date' })
        .notNull()
        .default((0, drizzle_orm_2.sql) `CURRENT_DATE`),
}, (t) => ({
    uqCompanyMusic: (0, pg_core_1.unique)('uq_company_musics_company_id_music_id').on(t.company_id, t.music_id),
}));
exports.company_musicsRelations = (0, drizzle_orm_1.relations)(exports.company_musics, ({ one }) => ({
    company: one(companies_1.companies, {
        fields: [exports.company_musics.company_id],
        references: [companies_1.companies.id],
    }),
    music: one(musics_1.musics, {
        fields: [exports.company_musics.music_id],
        references: [musics_1.musics.id],
    }),
}));
//# sourceMappingURL=company_musics.js.map