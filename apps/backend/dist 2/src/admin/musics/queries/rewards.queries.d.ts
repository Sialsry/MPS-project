import { SQL } from 'drizzle-orm';
export type MusicRewardsSortKey = 'music_id' | 'title' | 'artist' | 'category' | 'grade' | 'validPlays' | 'earned' | 'companiesUsing' | 'lastUsedAt';
export declare function buildMusicRewardsOrderSql(sortBy: string, order: 'asc' | 'desc'): SQL;
export declare function buildMusicRewardsSummaryQuery(params: {
    year: number;
    month: number;
    search?: string;
    categoryId?: number;
    grade?: number;
    musicType?: boolean;
    offset: number;
    limit: number;
    orderBySql: SQL;
}): SQL<unknown>;
export declare function buildMusicRewardsSummaryCountQuery(params: {
    year: number;
    month: number;
    search?: string;
    categoryId?: number;
    grade?: number;
    musicType?: boolean;
}): SQL<unknown>;
