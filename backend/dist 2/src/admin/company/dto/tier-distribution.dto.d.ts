export declare class TierDistributionQueryDto {
    yearMonth?: string;
}
export interface TierDistributionResponseDto {
    yearMonth: string;
    free: number;
    standard: number;
    business: number;
    total: number;
}
