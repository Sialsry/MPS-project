import { Injectable, Inject } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { FindMusicsDto } from './dto/find-musics.dto';
import { musics, music_categories, music_tags, monthly_music_rewards } from '../../db/schema';
import { eq, like, desc, asc, or, sql, and } from 'drizzle-orm';
import type { DB } from '../../db/client';
import type { SQL } from 'drizzle-orm';

@Injectable()
export class MusicsService {
  constructor(@Inject('DB') private readonly db: DB) {}

  async findAll(findMusicsDto: FindMusicsDto): Promise<{
    musics: any[];
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      musicType,
      idSortFilter,
      releaseDateSortFilter,
      rewardLimitFilter,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = findMusicsDto;

    const offset = (page - 1) * limit;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // SQL의 WHERE 절 조건을 배열로 구성
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(sql`(musics.title ILIKE ${`%${search}%`} OR musics.artist ILIKE ${`%${search}%`} OR music_tags.text ILIKE ${`%${search}%`})`);
    }

    if (category && category !== '전체') {
      conditions.push(sql`music_categories.name = ${category}`);
    }

    if (musicType && musicType !== '전체') {
      if (musicType === 'Inst') {
        conditions.push(sql`musics.inst = true`);
      } else if (musicType === '일반') {
        conditions.push(sql`musics.inst = false`);
      }
    }


    const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

    // 드롭다운 정렬을 위한 조건
    let orderByClause = sql``;
    
    // 음원번호 정렬
    if (idSortFilter === '오름차순') {
      orderByClause = sql`ORDER BY musics.id ASC`;
    } else if (idSortFilter === '내림차순') {
      orderByClause = sql`ORDER BY musics.id DESC`;
    }
    // 발매일 정렬
    else if (releaseDateSortFilter === '오름차순') {
      orderByClause = sql`ORDER BY musics.release_date ASC`;
    } else if (releaseDateSortFilter === '내림차순') {
      orderByClause = sql`ORDER BY musics.release_date DESC`;
    }
    // 리워드 한도 정렬
    else if (rewardLimitFilter === '오름차순') {
      orderByClause = sql`ORDER BY maxRewardLimit ASC`;
    } else if (rewardLimitFilter === '내림차순') {
      orderByClause = sql`ORDER BY maxRewardLimit DESC`;
    }
    // 기본 정렬
    else {
      orderByClause = sql`ORDER BY musics.created_at DESC`;
    }

    const rawQuery = sql`
      SELECT
        musics.id,
        musics.title,
        musics.artist,
        musics.inst AS musicType,
        music_categories.name AS category,
        musics.release_date AS releaseDate,
        COALESCE(${monthly_music_rewards.total_reward_count} * ${monthly_music_rewards.reward_per_play}, 0) AS maxRewardLimit,
        musics.created_at AS createdAt
      FROM musics
      LEFT JOIN music_categories ON musics.category_id = music_categories.id
      LEFT JOIN monthly_music_rewards ON musics.id = monthly_music_rewards.music_id AND monthly_music_rewards.year_month = ${currentMonth}
      ${whereClause}
      ${orderByClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const results = await this.db.execute(rawQuery);

    return {
      musics: results.rows, 
      page,
      limit
    };
  }

  create(createMusicDto: CreateMusicDto) {
    return 'This action adds a new music';
  }

  findOne(id: number) {
    return `This action returns a #${id} music`;
  }

  update(id: number, updateMusicDto: UpdateMusicDto) {
    return `This action updates a #${id} music`;
  }

  remove(id: number) {
    return `This action removes a #${id} music`;
  }
}