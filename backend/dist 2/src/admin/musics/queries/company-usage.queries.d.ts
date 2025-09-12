import { SQL } from 'drizzle-orm';
export declare function buildMusicCompanyUsageListQuery(params: {
    musicId: number;
    year: number;
    month: number;
    search?: string;
    limit: number;
    offset: number;
}): SQL;
export declare function buildMusicCompanyUsageCountQuery(params: {
    musicId: number;
    year: number;
    month: number;
    search?: string;
}): SQL;
