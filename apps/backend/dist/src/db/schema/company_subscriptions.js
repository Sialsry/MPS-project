"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.company_subscriptionsRelations = exports.company_subscriptions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const companies_1 = require("./companies");
exports.company_subscriptions = (0, pg_core_1.pgTable)('company_subscriptions', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    company_id: (0, pg_core_1.bigint)('company_id', { mode: 'number' }).notNull(),
    tier: (0, pg_core_1.varchar)('tier', { length: 20 }).notNull(),
    start_date: (0, pg_core_1.timestamp)('start_date', { withTimezone: true }).notNull(),
    end_date: (0, pg_core_1.timestamp)('end_date', { withTimezone: true }).notNull(),
    total_paid_amount: (0, pg_core_1.decimal)('total_paid_amount', { precision: 10, scale: 2 }),
    payment_count: (0, pg_core_1.integer)('payment_count'),
    discount_amount: (0, pg_core_1.decimal)('discount_amount', { precision: 10, scale: 2 }),
    actual_paid_amount: (0, pg_core_1.decimal)('actual_paid_amount', { precision: 10, scale: 2 }),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.company_subscriptionsRelations = (0, drizzle_orm_1.relations)(exports.company_subscriptions, ({ one }) => ({
    company: one(companies_1.companies, {
        fields: [exports.company_subscriptions.company_id],
        references: [companies_1.companies.id],
    }),
}));
//# sourceMappingURL=company_subscriptions.js.map