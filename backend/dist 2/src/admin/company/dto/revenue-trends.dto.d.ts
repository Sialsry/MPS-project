export declare class RevenueTrendsQueryDto {
    year?: number;
    months?: number;
}
export interface RevenueTrendsItemDto {
    month: string;
    subscriptionRevenue: {
        standard: number;
        business: number;
        total: number;
    };
    usageRevenue: {
        general: number;
        lyrics: number;
        instrumental: number;
        total: number;
    };
    totalRevenue: number;
}
export interface RevenueTrendsResponseDto {
    year: number;
    items: RevenueTrendsItemDto[];
}
