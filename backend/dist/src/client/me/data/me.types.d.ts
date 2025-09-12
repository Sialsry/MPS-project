export type MonthRow = {
    ym: string;
};
export type MusicRow = {
    music_id: number;
    title: string | null;
    cover_image_url: string | null;
};
export type PlanRow = {
    reward_per_play: string | null;
    total_reward_count: number | null;
    remaining_reward_count: number | null;
};
export type AggRow = {
    month_spent: string;
    lifetime: string;
    last_used_at: string | null;
    start_date: string | null;
};
export type DailyRow = {
    date: string;
    amount: string;
};
export type PlaysCountRow = {
    c: string;
};
export type PlayListRow = {
    play_id: number;
    played_at: string;
    is_valid: boolean;
    meta: any;
    reward_id: number | null;
    reward_code: '0' | '1' | '2' | '3' | null;
    amount: string | null;
    status: 'pending' | 'successed' | null;
};
