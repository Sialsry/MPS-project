"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.music_categoriesRelations = exports.music_categories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const musics_1 = require("./musics");
exports.music_categories = (0, pg_core_1.pgTable)('music_categories', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
});
exports.music_categoriesRelations = (0, drizzle_orm_1.relations)(exports.music_categories, ({ many }) => ({
    musics: many(musics_1.musics),
}));
//# sourceMappingURL=music_categories.js.map