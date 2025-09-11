export type SearchMode = 'keyword' | 'semantic';
export type SortKey = 'relevance' | 'newest' | 'most_played' | 'remaining_reward';
export type StatusKey = 'active' | 'inactive' | 'invalid';
export declare class ListMusicQueryDto {
    q?: string;
    mode?: SearchMode;
    explain?: string;
    min_similarity?: number;
    category_id?: string;
    mood?: string;
    reward_max?: number;
    remaining_reward_max?: number;
    status?: StatusKey;
    sort?: SortKey;
    limit?: number;
    cursor?: string;
}
