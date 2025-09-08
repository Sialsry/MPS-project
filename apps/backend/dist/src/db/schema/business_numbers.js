"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.business_numbersRelations = exports.business_numbers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const companies_1 = require("./companies");
exports.business_numbers = (0, pg_core_1.pgTable)('business_numbers', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    company_id: (0, pg_core_1.bigint)('company_id', { mode: 'number' }).notNull(),
    number: (0, pg_core_1.text)('number').notNull(),
});
exports.business_numbersRelations = (0, drizzle_orm_1.relations)(exports.business_numbers, ({ one }) => ({
    company: one(companies_1.companies, {
        fields: [exports.business_numbers.company_id],
        references: [companies_1.companies.id],
    }),
}));
//# sourceMappingURL=business_numbers.js.map