export declare function buildFindAllQuery(params: {
    search?: string;
    categoryLabel?: string | null;
    musicType?: 'Inst' | '일반' | '전체';
    idSortFilter?: '오름차순' | '내림차순' | '';
    releaseDateSortFilter?: '오름차순' | '내림차순' | '';
    rewardLimitFilter?: '오름차순' | '내림차순' | '';
    currentMonth: string;
    limit: number;
    offset: number;
}): import("drizzle-orm").SQL<unknown>;
export declare function buildFindOneQuery(id: number, currentMonth: string): import("drizzle-orm").SQL<unknown>;
export declare function buildUpsertNextMonthRewardsQuery(params: {
    musicId: number;
    yearMonth: string;
    totalRewardCount: number;
    rewardPerPlay: number;
    remainingRewardCount: number;
}): import("drizzle-orm").SQL<unknown>;
export declare function buildCleanupOrphanCategoriesQuery(): import("drizzle-orm").SQL<unknown>;
