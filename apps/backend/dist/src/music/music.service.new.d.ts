import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class MusicService {
    private db;
    constructor(db: NodePgDatabase<any>);
    findById(musicId: number): Promise<{
        id: number;
        file_path: string;
        title: string;
        artist: string;
        composer: string | null;
        music_arranger: string | null;
        lyricist: string | null;
        lyrics_text: string | null;
        lyrics_file_path: string | null;
        inst: boolean;
        isrc: string | null;
        duration_sec: number | null;
        release_date: string | null;
        cover_image_url: string | null;
        lyrics_download_count: number | null;
        price_per_play: string | null;
        lyrics_price: string | null;
        created_at: Date | null;
        updated_at: Date | null;
        category_id: number | null;
        grade: number;
        total_valid_play_count: number | null;
        total_play_count: number | null;
        total_rewarded_amount: string | null;
        total_revenue: string | null;
        file_size_bytes: number | null;
        last_played_at: Date | null;
    }>;
    findActiveSession(musicId: number, companyId: number): Promise<void>;
    startPlaySession(sessionData: {
        musicId: number;
        companyId: number;
        useCase: '0' | '1' | '2';
        rewardCode: '0' | '1' | '2' | '3';
        rewardAmount: number;
        usePrice: number;
    }): Promise<{
        id: number;
        created_at: Date | null;
        updated_at: Date | null;
        music_id: number;
        reward_code: "0" | "1" | "2" | "3";
        use_case: "0" | "1" | "2";
        using_company_id: number;
        reward_amount: string | null;
        transaction_hash: string | null;
        use_price: string | null;
        is_valid_play: boolean | null;
        play_duration_sec: number | null;
    }>;
    markAsValidPlay(): Promise<void>;
}
