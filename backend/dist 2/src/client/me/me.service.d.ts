export declare class MeService {
    private readonly db;
    private readonly logger;
    constructor(db: any);
    private PLAN_PRICE;
    private buildSelect;
    getMe(companyId: number): Promise<{
        company: {
            id: number;
            name: any;
            grade: any;
            ceo_name: any;
            phone: any;
            homepage_url: any;
            profile_image_url: any;
            smart_account_address: any;
            total_rewards_earned: number;
            total_rewards_used: number;
            reward_balance: number;
        } | null;
        subscription: {
            plan: any;
            status: string;
            start_date: any;
            end_date: any;
            next_billing_at: any;
            remaining_days: number | null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
        } | {
            plan: string;
            status: string;
            remaining_days: null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
            start_date?: undefined;
            end_date?: undefined;
            next_billing_at?: undefined;
        };
        api_key: {
            last4: null;
        };
        using_summary: {
            using_count: number;
        };
        using_list: any;
    }>;
    updateProfile(companyId: number, dto: {
        ceo_name?: string;
        phone?: string;
        homepage_url?: string;
        profile_image_url?: string;
    }): Promise<{
        company: {
            id: number;
            name: any;
            grade: any;
            ceo_name: any;
            phone: any;
            homepage_url: any;
            profile_image_url: any;
            smart_account_address: any;
            total_rewards_earned: number;
            total_rewards_used: number;
            reward_balance: number;
        } | null;
        subscription: {
            plan: any;
            status: string;
            start_date: any;
            end_date: any;
            next_billing_at: any;
            remaining_days: number | null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
        } | {
            plan: string;
            status: string;
            remaining_days: null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
            start_date?: undefined;
            end_date?: undefined;
            next_billing_at?: undefined;
        };
        api_key: {
            last4: null;
        };
        using_summary: {
            using_count: number;
        };
        using_list: any;
    }>;
    subscribe(companyId: number, dto: {
        tier: 'standard' | 'business';
        use_rewards: number;
    }): Promise<any>;
    updateSubscriptionSettings(companyIdNum: number, dto: {
        useMileage: number;
        reset?: boolean;
    }): Promise<any>;
    getHistory(companyIdNum: number): Promise<{
        purchases: any;
        mileageLogs: any;
    }>;
    getRewardsSummary(params: {
        companyId: number;
        days?: number;
        musicId?: number;
    }): Promise<{
        month: any;
        days: number;
        items: {
            musicId: number;
            title: string | null;
            coverImageUrl: string | null;
            playEndpoint: string;
            lyricsEndpoint: string;
            startDate: any;
            rewardPerPlay: number | null;
            monthBudget: number;
            monthSpent: number;
            monthRemaining: number;
            remainingByPlanCount: any;
            remainingByPlanAmount: number | null;
            lifetimeExtracted: number;
            lastUsedAt: any;
            daily: {
                date: string;
                amount: number;
            }[];
            leadersEarned: number;
        }[];
        totals: {
            monthBudget: number;
            monthSpent: number;
            monthRemaining: number;
            lifetimeExtracted: number;
        };
    }>;
    getPlays(params: {
        companyId: number;
        musicId: number;
        page?: number;
        limit?: number;
    }): Promise<{
        page: number;
        limit: number;
        total: number;
        items: {
            playId: number;
            playedAt: string;
            isValid: boolean;
            meta: any;
            rewardId: number | null;
            rewardCode: "0" | "1" | "2" | "3" | null;
            amount: number | null;
            status: "successed" | "pending" | null;
        }[];
    }>;
    removeUsing(companyIdNum: number, musicIdNum: number): Promise<any>;
}
