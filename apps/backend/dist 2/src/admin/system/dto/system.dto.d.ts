export declare class SystemStatsDto {
    period?: '24h' | '7d' | '30d';
}
export declare class SystemChartDto {
    period?: '24h' | '7d' | '30d';
}
export declare class SystemKeysDto {
    search?: string;
    sortBy?: 'usage' | 'recent' | 'created';
    sortOrder?: 'desc' | 'asc';
}
