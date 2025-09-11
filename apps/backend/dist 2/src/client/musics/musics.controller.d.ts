import { JwtService } from '@nestjs/jwt';
import { MusicsService } from './musics.service';
import { ListMusicQueryDto } from './dto/list-music.query.dto';
import { PopularMusicDto } from './dto/popular-music.dto';
import { CategoryDto } from './dto/category.dto';
import { MusicDetailDto, UseMusicResponseDto } from './dto/music-detail.dto';
export declare class MusicsController {
    private readonly musics;
    private readonly jwt;
    constructor(musics: MusicsService, jwt: JwtService);
    list(req: any, query: ListMusicQueryDto): Promise<{
        items: PopularMusicDto[];
        nextCursor: string | null;
    }>;
    categories(): Promise<{
        items: CategoryDto[];
    }>;
    popular(req: any, q: {
        category?: string | number;
        limit?: number;
    }): Promise<{
        items: PopularMusicDto[];
    }>;
    getOne(req: any, id: string): Promise<MusicDetailDto>;
    use(req: any, id: string): Promise<UseMusicResponseDto>;
}
