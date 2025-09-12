export declare class PlaylistService {
    private readonly db;
    constructor(db: any);
    private rows;
    private firstRow;
    private assertOwn;
    list(companyId: number): Promise<{
        id: number;
        name: string;
        count: number;
        cover: any;
    }[]>;
    detail(companyId: number, playlistId: number): Promise<{
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
    }>;
    tracks(companyId: number, playlistId: number): Promise<{
        id: number;
        title: string;
        artist: string;
        coverUrl: any;
        audioUrl: string;
        durationSec: number;
    }[]>;
    replaceTracks(companyId: number, playlistId: number, trackIds: number[]): Promise<{
        playlistId: number;
        count: number;
    }>;
    removeTracks(companyId: number, playlistId: number, trackIds: number[]): Promise<any>;
    create(companyId: number, dto: {
        name: string;
        trackIds?: number[];
    }): Promise<any>;
    remove(companyId: number, playlistId: number): Promise<{
        deleted: boolean;
    }>;
    use(companyId: number, playlistId: number, dto: {
        trackIds?: number[];
        useCase?: 'full' | 'intro' | 'lyrics';
    }): Promise<{
        count: number;
    }>;
}
