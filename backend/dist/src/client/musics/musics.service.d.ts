import { ListMusicQueryDto } from './dto/list-music.query.dto';
import { PopularMusicDto } from './dto/popular-music.dto';
import { CategoryDto } from './dto/category.dto';
import { MusicDetailDto, UseMusicResponseDto } from './dto/music-detail.dto';
type Grade = 'free' | 'standard' | 'business';
export declare class MusicsService {
    private readonly db;
    constructor(db: any);
    searchList(params: {
        companyId: number;
        grade: Grade;
        isAuth: boolean;
        query: ListMusicQueryDto;
    }): Promise<{
        items: PopularMusicDto[];
        nextCursor: string | null;
    }>;
    listCategories(): Promise<CategoryDto[]>;
    getDetail(params: {
        companyId: number;
        grade: Grade;
        isAuth: boolean;
        musicId: number;
    }): Promise<MusicDetailDto>;
    useMusic(companyId: number, musicId: number): Promise<UseMusicResponseDto>;
}
export {};
