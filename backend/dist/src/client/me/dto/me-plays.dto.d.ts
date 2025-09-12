export declare class GetMePlaysQueryDto {
    musicId: number;
    page?: number;
    limit?: number;
}
export declare class MePlayRowDto {
    playId: number;
    playedAt: string;
    isValid: boolean;
    meta?: Record<string, any> | null;
    rewardId?: number | null;
    rewardCode?: '0' | '1' | '2' | '3' | null;
    amount?: number | null;
    status?: 'pending' | 'successed' | null;
}
export declare class MePlaysResponseDto {
    page: number;
    limit: number;
    total: number;
    items: MePlayRowDto[];
}
