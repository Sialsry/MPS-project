export declare enum SortField {
    TITLE = "title",
    ARTIST = "artist",
    GENRE = "genre",
    MUSIC_TYPE = "musicType",
    VALID_PLAYS = "validPlays",
    VALID_RATE = "validRate",
    REWARD = "reward",
    CREATED_AT = "createdAt",
    PLAYS = "plays"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class FindMusicsDto {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    musicType?: string;
    idSortFilter?: '전체' | '오름차순' | '내림차순';
    releaseDateSortFilter?: '전체' | '오름차순' | '내림차순';
    rewardLimitFilter?: '전체' | '오름차순' | '내림차순';
    dateFilter?: '최신순' | '오래된순';
    sortBy?: SortField;
    sortOrder?: SortOrder;
    includeStats?: boolean;
    statsType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate?: string;
    endDate?: string;
}
