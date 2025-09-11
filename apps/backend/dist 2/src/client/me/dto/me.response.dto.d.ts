export declare class CompanyDto {
    id: number;
    name: string;
    grade: 'Free' | 'Standard' | 'Business';
    profile_image_url?: string | null;
    smart_account_address?: string | null;
    total_rewards_earned: number;
    total_rewards_used: number;
    reward_balance: number;
}
export declare class SubscriptionDto {
    plan: 'free' | 'standard' | 'business';
    status: 'active' | 'none';
    start_date?: string | null;
    end_date?: string | null;
    next_billing_at?: string | null;
    remaining_days: number | null;
}
export declare class ApiKeyPreviewDto {
    last4: string | null;
}
export declare class UsingSummaryDto {
    using_count: number;
}
export declare class UsingItemDto {
    id: number;
    title: string;
    artist?: string | null;
    cover?: string | null;
    lastUsedAt?: string | null;
    leadersEarned?: number;
}
export declare class MeResponseDto {
    company: CompanyDto | null;
    subscription: SubscriptionDto;
    api_key: ApiKeyPreviewDto;
    using_summary: UsingSummaryDto;
    using_list: UsingItemDto[];
}
