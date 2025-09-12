export declare class RealtimeService {
    getRealtimeData(): Promise<{
        apiCalls: any;
        topTracks: any;
        timestamp: string;
    }>;
    private getRecentApiCalls;
    private getTopTracks;
}
