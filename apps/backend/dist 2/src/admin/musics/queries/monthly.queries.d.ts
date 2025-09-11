import { SQL } from 'drizzle-orm';
export declare function buildMusicMonthlyRewardsQuery(params: {
    musicId: number;
    endYear: number;
    endMonth: number;
    months: number;
}): SQL;
