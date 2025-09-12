export declare class MusicRewardsSummaryQueryDto {
    yearMonth?: string;
    search?: string;
    categoryId?: number;
    musicType?: 'inst' | 'normal' | 'all';
    grade?: '0' | '1' | '2' | 'all';
    page?: number;
    limit?: number;
    sortBy?: 'music_id' | 'title' | 'artist' | 'category' | 'grade' | 'musicType' | 'monthlyLimit' | 'rewardPerPlay' | 'usageRate' | 'validPlays' | 'earned' | 'companiesUsing' | 'lastUsedAt';
    order?: 'asc' | 'desc';
}
export declare class MusicRewardsSummaryItemDto {
    musicId: number;
    title: string;
    artist: string;
    category: string | null;
    grade: 0 | 1 | 2;
    validPlays: number;
    earned: number;
    companiesUsing: number;
    lastUsedAt: string | null;
    monthlyLimit: number | null;
    usageRate: number | null;
    rewardPerPlay?: number | null;
}
export declare class MusicRewardsSummaryResponseDto {
    yearMonth: string;
    total: number;
    page: number;
    limit: number;
    items: MusicRewardsSummaryItemDto[];
}
