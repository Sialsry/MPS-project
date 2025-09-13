export declare class RealtimeApiStatusQueryDto {
    limit?: number;
}
export interface RealtimeApiStatusItemDto {
    status: 'success' | 'error';
    endpoint: string;
    callType: string;
    validity: string;
    company: string;
    timestamp: string;
}
export interface RealtimeApiStatusResponseDto {
    items: RealtimeApiStatusItemDto[];
}
export declare class RealtimeTopTracksQueryDto {
    limit?: number;
}
export interface RealtimeTopTracksItemDto {
    rank: number;
    title: string;
    validPlays: number;
    totalPlays: number;
    validRate: number;
}
export interface RealtimeTopTracksResponseDto {
    items: RealtimeTopTracksItemDto[];
}
export declare class RealtimeTransactionsQueryDto {
    limit?: number;
}
export interface RealtimeTransactionsItemDto {
    timestamp: string;
    status: 'success' | 'pending' | 'failed';
    processedCount: string;
    gasFee: string;
    hash: string;
}
export interface RealtimeTransactionsResponseDto {
    items: RealtimeTransactionsItemDto[];
}
