export declare class MusicRewardsTrendQueryDto {
    granularity: 'daily' | 'monthly';
    type: 'music' | 'lyrics';
    segment?: 'category' | 'all';
    yearMonth?: string;
    months?: number;
}
export declare class MusicRewardsTrendSeriesDto {
    label: string;
    data: number[];
}
export declare class MusicRewardsTrendResponseDto {
    labels: string[];
    series: MusicRewardsTrendSeriesDto[];
    meta: {
        granularity: 'daily' | 'monthly';
        type: 'music' | 'lyrics';
        segment: 'category' | 'all';
        yearMonth?: string;
        months?: number;
    };
}
