export declare const REWARD_CODE_EARNING: '0' | '1' | '2' | '3';
export declare class GetMeRewardsQueryDto {
    days?: number;
    musicId?: number;
}
export declare class MeRewardDailyDto {
    date: string;
    amount: number;
}
export declare class MeRewardItemDto {
    musicId: number;
    title: string | null;
    coverImageUrl: string | null;
    playEndpoint?: string;
    lyricsEndpoint?: string;
    startDate: string | null;
    monthBudget: number;
    monthSpent: number;
    monthRemaining: number;
    rewardPerPlay: number | null;
    remainingByPlanCount: number | null;
    remainingByPlanAmount: number | null;
    lifetimeExtracted: number;
    lastUsedAt: string | null;
    daily: MeRewardDailyDto[];
}
export declare class MeRewardsTotalsDto {
    monthBudget: number;
    monthSpent: number;
    monthRemaining: number;
    lifetimeExtracted: number;
}
export declare class MeRewardsResponseDto {
    month: string;
    days: number;
    items: MeRewardItemDto[];
    totals: MeRewardsTotalsDto;
}
