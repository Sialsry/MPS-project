declare const VALID_SORT_BY: readonly ["company_id", "name", "grade", "total_tokens", "monthly_earned", "monthly_used", "usage_rate", "active_tracks"];
export declare class RewardsSummaryQueryDto {
    yearMonth?: string;
    search?: string;
    tier?: 'free' | 'standard' | 'business' | 'all';
    page?: number;
    limit?: number;
    sortBy?: typeof VALID_SORT_BY[number];
    order?: 'asc' | 'desc';
}
export {};
