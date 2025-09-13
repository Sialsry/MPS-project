export declare class MusicMonthlyRewardsQueryDto {
    endYearMonth?: string;
    months?: number;
}
export declare class MusicMonthlyRewardsItemDto {
    label: string;
    validPlays: number;
    companiesUsing: number;
    monthlyLimit: number | null;
    usageRate: number | null;
    earned: number;
    rewardPerPlay: number | null;
}
export declare class MusicMonthlyRewardsResponseDto {
    labels: string[];
    items: MusicMonthlyRewardsItemDto[];
    meta: {
        endYearMonth: string;
        months: number;
    };
}
