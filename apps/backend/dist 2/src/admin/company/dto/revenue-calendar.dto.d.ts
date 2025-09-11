export declare class RevenueCalendarQueryDto {
    yearMonth?: string;
}
export interface RevenueCalendarDayDto {
    date: string;
    subscriptionRevenue: number;
    usageRevenue: number;
    totalRevenue: number;
}
export interface RevenueCalendarResponseDto {
    yearMonth: string;
    days: RevenueCalendarDayDto[];
    monthlySummary: {
        subscriptionRevenue: number;
        usageRevenue: number;
        totalRevenue: number;
    };
}
