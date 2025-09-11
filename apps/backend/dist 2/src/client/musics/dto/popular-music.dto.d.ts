export type TrackFormat = 'FULL' | 'INSTRUMENTAL';
export declare class RewardInfoDto {
    reward_one: string | null;
    reward_total: string | null;
    reward_remain: string | null;
    total_count: number | null;
    remain_count: number | null;
}
export declare class PopularMusicDto {
    id: number;
    title: string;
    artist: string;
    cover_image_url?: string | null;
    format: TrackFormat;
    has_lyrics: boolean;
    grade_required: 0 | 1 | 2;
    can_use: boolean;
    reward: RewardInfoDto;
    popularity: number;
    created_at: Date;
    category?: string | null;
}
