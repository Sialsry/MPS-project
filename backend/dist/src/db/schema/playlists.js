"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playlistsRelations = exports.playlists = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const companies_1 = require("./companies");
const playlist_items_1 = require("./playlist_items");
exports.playlists = (0, pg_core_1.pgTable)('playlists', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    company_id: (0, pg_core_1.bigint)('company_id', { mode: 'number' }).notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.playlistsRelations = (0, drizzle_orm_1.relations)(exports.playlists, ({ one, many }) => ({
    company: one(companies_1.companies, {
        fields: [exports.playlists.company_id],
        references: [companies_1.companies.id],
    }),
    items: many(playlist_items_1.playlist_items),
}));
//# sourceMappingURL=playlists.js.map