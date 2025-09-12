export declare class RewardInfoDto {
    reward_one: string | null;
    reward_total: string | null;
    reward_remain: string | null;
    total_count: number | null;
    remain_count: number | null;
}
export declare class MusicDetailDto {
    id: number;
    title: string;
    artist: string;
    cover_image_url: string | null;
    format: 'FULL' | 'INSTRUMENTAL';
    has_lyrics: boolean;
    lyrics_text: string | null;
    lyrics_file_path: string | null;
    grade_required: 0 | 1 | 2;
    can_use: boolean;
    reward: RewardInfoDto;
    popularity: number;
    created_at: string;
    category_id: number | null;
    category_name: string | null;
    duration_sec: number | null;
    price_per_play: string | null;
    is_using: boolean;
}
export declare class UseMusicResponseDto {
    using_id: number;
    is_using: boolean;
}
