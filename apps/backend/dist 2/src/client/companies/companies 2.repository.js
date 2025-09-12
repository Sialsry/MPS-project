"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../db/client");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
let CompaniesRepository = class CompaniesRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findDuplicate(email, name, bizno) {
        return client_1.db.query.companies.findFirst({
            where: (c, { sql }) => sql `${c.email} = ${email} or ${c.name} = ${name} or ${c.business_number} = ${bizno}`,
            columns: { id: true },
        });
    }
    async existsBizno(bizno) {
        const row = await client_1.db.query.business_numbers.findFirst({
            where: (b, { sql }) => sql `regexp_replace(${b.number}, '\D', '', 'g') = ${bizno}`,
            columns: { id: true },
        });
        return !!row;
    }
    async insert(values) {
        return client_1.db.insert(schema_1.companies).values(values).returning();
    }
    async findLatestSubscription(companyId) {
        const [row] = await client_1.db
            .select()
            .from(schema_1.company_subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.company_subscriptions.company_id, companyId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.company_subscriptions.end_date))
            .limit(1);
        return row;
    }
    findById(id) {
        return client_1.db.query.companies.findFirst({
            where: (c, { sql }) => sql `${c.id} = ${id}`,
        });
    }
    findByEmail(email) {
        return client_1.db.query.companies.findFirst({
            where: (c, { sql }) => sql `${c.email} = ${email}`,
        });
    }
    async updateApiKeyByCompanyId(companyId, data) {
        const id = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
        await this.db
            .update(schema_1.companies)
            .set({
            api_key_hash: data.api_key_hash,
            ...(data.api_key_id !== undefined ? { api_key_id: data.api_key_id } : {}),
            ...(data.api_key_last4 !== undefined ? { api_key_last4: data.api_key_last4 } : {}),
            ...(data.api_key_version !== undefined ? { api_key_version: data.api_key_version } : {}),
            api_key_rotated_at: (0, drizzle_orm_1.sql) `now()`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.companies.id, id));
    }
    async updateSmartAccountAddress(companyId, smartAccountAddress) {
        await this.db
            .update(schema_1.companies)
            .set({
            smart_account_address: smartAccountAddress,
            updated_at: (0, drizzle_orm_1.sql) `now()`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.companies.id, companyId));
    }
};
exports.CompaniesRepository = CompaniesRepository;
exports.CompaniesRepository = CompaniesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [Object])
], CompaniesRepository);
//# sourceMappingURL=companies.repository.js.map