import { Injectable, Inject } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { FindMusicsDto } from './dto/find-musics.dto';
import { musics, music_categories, music_tags } from '../../db/schema';
import { eq, like, desc, asc, or, sql } from 'drizzle-orm';
import type {DB} from '../../db/client'

@Injectable()
export class MusicsService {
  constructor(@Inject('DB') private readonly db: DB ) {}

  
  async findAll(findMusicsDto: FindMusicsDto) {
    const { // 입력값
      page = 1,
      limit = 10,
      search,
      category,
      musicType,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = findMusicsDto

    const offset = (page-1)*limit;

    // 목록조회를 위한
    let query = this.db.select({
      id: musics.id,
      title: musics.title,
      artist: musics.artist,
      category: music_categories.name,
      inst: musics.inst,
      duration_sec: musics.duration_sec,
      coverImageUrl: musics.cover_image_url,
      totalValidPlayCount: musics.total_valid_play_count,
      totalPlayCount: musics.total_play_count,
      createdAt: musics.created_at,
    })
  }
  
}
