export declare class RewardsDetailDailyDto {
    date: string;
    earned: number;
    used: number;
}
export declare class RewardsDetailByMusicDto {
    musicId: number;
    title: string;
    artist: string;
    category: string | null;
    validPlays: number;
    earned: number;
}
export declare class RewardsDetailSummaryDto {
    totalTokens: number;
    monthlyEarned: number;
    monthlyUsed: number;
    usageRate: number;
    activeTracks: number;
    yearMonth: string;
}
export declare class RewardsDetailCompanyDto {
    id: number;
    name: string;
    tier: 'free' | 'standard' | 'business';
}
export declare class RewardsDetailResponseDto {
    company: RewardsDetailCompanyDto;
    summary: RewardsDetailSummaryDto;
    daily: RewardsDetailDailyDto[];
    byMusic: RewardsDetailByMusicDto[];
}
