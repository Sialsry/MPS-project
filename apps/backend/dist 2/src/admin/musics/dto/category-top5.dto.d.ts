export declare class CategoryTop5QueryDto {
    yearMonth?: string;
    limit?: number;
}
export interface CategoryTop5ItemDto {
    category: string;
    validPlays: number;
    rank: number;
}
export interface CategoryTop5ResponseDto {
    yearMonth: string;
    items: CategoryTop5ItemDto[];
}
