import { SQL } from 'drizzle-orm';
export type TrendType = 'music' | 'lyrics';
export type TrendGranularity = 'daily' | 'monthly';
export type TrendSegment = 'category' | 'all';
export declare function buildMusicTrendDailyQuery(params: {
    musicId: number;
    year: number;
    month: number;
    type: TrendType;
    segment: TrendSegment;
}): SQL<unknown>;
export declare function buildMusicTrendMonthlyQuery(params: {
    musicId: number;
    endYear: number;
    endMonth: number;
    months: number;
    type: TrendType;
    segment: TrendSegment;
}): SQL<unknown>;
