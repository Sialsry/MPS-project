export declare class MusicCompanyUsageQueryDto {
    yearMonth?: string;
    limit?: number;
    page?: number;
    search?: string;
}
export declare class MusicCompanyUsageItemDto {
    rank: number;
    companyId: number;
    companyName: string;
    tier: 'Free' | 'Standard' | 'Business';
    monthlyEarned: number;
    monthlyPlays: number;
}
export declare class MusicCompanyUsageResponseDto {
    yearMonth: string;
    total: number;
    page: number;
    limit: number;
    items: MusicCompanyUsageItemDto[];
}
