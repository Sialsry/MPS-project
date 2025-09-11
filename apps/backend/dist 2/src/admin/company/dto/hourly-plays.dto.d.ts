export declare class HourlyPlaysQueryDto {
    date?: string;
}
export interface HourlyPlaysResponseDto {
    date: string;
    labels: string[];
    free: number[];
    standard: number[];
    business: number[];
    prevAvg: number[];
}
