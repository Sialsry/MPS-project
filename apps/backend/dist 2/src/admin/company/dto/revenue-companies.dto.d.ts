export declare class RevenueCompaniesQueryDto {
    yearMonth?: string;
    grade?: 'standard' | 'business';
    limit?: number;
}
export interface RevenueCompaniesItemDto {
    rank: number;
    companyId: number;
    companyName: string;
    grade: string;
    subscriptionRevenue: number;
    usageRevenue: number;
    totalRevenue: number;
    percentage: number;
    growth: string;
}
export interface RevenueCompaniesResponseDto {
    yearMonth: string;
    grade: string;
    items: RevenueCompaniesItemDto[];
}
