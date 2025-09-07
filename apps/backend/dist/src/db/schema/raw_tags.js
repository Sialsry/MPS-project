"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raw_tagsRelations = exports.raw_tags = exports.typeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const music_tags_1 = require("./music_tags");
exports.typeEnum = (0, pg_core_1.pgEnum)('raw_tag_type', ['genre', 'mood', 'context']);
exports.raw_tags = (0, pg_core_1.pgTable)('raw_tags', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    slug: (0, pg_core_1.text)('slug').notNull().unique(),
    type: (0, exports.typeEnum)('type').notNull(),
});
exports.raw_tagsRelations = (0, drizzle_orm_1.relations)(exports.raw_tags, ({ many }) => ({
    music_tags: many(music_tags_1.music_tags),
}));
//# sourceMappingURL=raw_tags.js.map