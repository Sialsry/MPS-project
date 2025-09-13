import { companies, company_subscriptions } from '../../db/schema';
export type CompanyRow = typeof companies.$inferSelect;
export type CompanySubscriptionRow = typeof company_subscriptions.$inferSelect;
export declare class CompaniesRepository {
    private readonly db;
    constructor(db: any);
    findDuplicate(email: string, name: string, bizno: string): import("drizzle-orm/pg-core/query-builders/query").PgRelationalQuery<{
        id: number;
    } | undefined>;
    existsBizno(bizno: string): Promise<boolean>;
    insert(values: typeof companies.$inferInsert): Promise<{
        id: number;
        name: string;
        created_at: Date | null;
        updated_at: Date | null;
        business_number: string;
        email: string;
        password_hash: string;
        phone: string | null;
        grade: "free" | "standard" | "business";
        ceo_name: string | null;
        profile_image_url: string | null;
        homepage_url: string | null;
        smart_account_address: string | null;
        api_key_hash: string | null;
        total_rewards_earned: string | null;
        total_rewards_used: string | null;
    }[]>;
    findLatestSubscription(companyId: number): Promise<{
        id: number;
        company_id: number;
        tier: string;
        start_date: Date;
        end_date: Date;
        total_paid_amount: string | null;
        payment_count: number | null;
        discount_amount: string | null;
        actual_paid_amount: string | null;
        created_at: Date | null;
        updated_at: Date | null;
    } | undefined>;
    findById(id: number): import("drizzle-orm/pg-core/query-builders/query").PgRelationalQuery<{
        id: number;
        name: string;
        created_at: Date | null;
        updated_at: Date | null;
        business_number: string;
        email: string;
        password_hash: string;
        phone: string | null;
        grade: "free" | "standard" | "business";
        ceo_name: string | null;
        profile_image_url: string | null;
        homepage_url: string | null;
        smart_account_address: string | null;
        api_key_hash: string | null;
        total_rewards_earned: string | null;
        total_rewards_used: string | null;
    } | undefined>;
    findByEmail(email: string): import("drizzle-orm/pg-core/query-builders/query").PgRelationalQuery<{
        id: number;
        name: string;
        created_at: Date | null;
        updated_at: Date | null;
        business_number: string;
        email: string;
        password_hash: string;
        phone: string | null;
        grade: "free" | "standard" | "business";
        ceo_name: string | null;
        profile_image_url: string | null;
        homepage_url: string | null;
        smart_account_address: string | null;
        api_key_hash: string | null;
        total_rewards_earned: string | null;
        total_rewards_used: string | null;
    } | undefined>;
    updateApiKeyByCompanyId(companyId: number | string, data: {
        api_key_hash: string;
        api_key_id?: string | null;
        api_key_last4?: string | null;
        api_key_version?: number | null;
    }): Promise<void>;
    updateSmartAccountAddress(companyId: number, smartAccountAddress: string): Promise<void>;
}
