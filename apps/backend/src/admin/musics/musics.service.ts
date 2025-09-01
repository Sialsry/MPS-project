import { Injectable, Inject } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { FindMusicsDto } from './dto/find-musics.dto';
import { musics, music_categories, music_tags, monthly_music_rewards, music_plays } from '../../db/schema';
import { eq, like, desc, asc, or, sql, and, inArray } from 'drizzle-orm';
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
    const currentMonth = new Date().toISOString().slice(0, 7); // 동적으로 현재 월 가져오기

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
        STRING_AGG(DISTINCT music_tags.text, ', ') AS tags,
        musics.release_date AS releaseDate,
        COALESCE(${monthly_music_rewards.total_reward_count} * ${monthly_music_rewards.reward_per_play}, 0) AS maxRewardLimit,
        musics.created_at AS createdAt
      FROM musics
      LEFT JOIN music_categories ON musics.category_id = music_categories.id
      LEFT JOIN music_tags ON musics.id = music_tags.music_id
      LEFT JOIN monthly_music_rewards ON musics.id = monthly_music_rewards.music_id AND monthly_music_rewards.year_month = ${currentMonth}
      ${whereClause}
      GROUP BY musics.id, musics.title, musics.artist, musics.inst, music_categories.name, musics.release_date, musics.created_at, monthly_music_rewards.total_reward_count, monthly_music_rewards.reward_per_play
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
  
  async remove(id: number) {
    try {
      // 음원이 존재하는지 확인
      const music = await this.db.select().from(musics).where(eq(musics.id, id)).limit(1);
      
      if (music.length === 0) {
        throw new Error(`음원 ID ${id}를 찾을 수 없습니다.`);
      }

      await this.db.delete(monthly_music_rewards).where(eq(monthly_music_rewards.music_id, id));
      
      await this.db.delete(music_tags).where(eq(music_tags.music_id, id));
      
      await this.db.delete(music_plays).where(eq(music_plays.music_id, id));
      
      await this.db.delete(musics).where(eq(musics.id, id));
      
      return { message: `음원 삭제 완료` };
    } catch (error) {
      throw new Error(`음원 삭제 실패: ${error.message}`);
    }
  }

  async bulkDelete(ids: number[]) {
    try {
      // 모든 음원이 존재하는지 한 번에 확인
      const existingMusics = await this.db.select({ id: musics.id }).from(musics).where(inArray(musics.id, ids));
      
      const existingIds = existingMusics.map(m => m.id);
      const missingIds = ids.filter(id => !existingIds.includes(id));
      
      // 만약 누락된 음원이 있으면 에러
      if (missingIds.length > 0) {
        throw new Error(`음원 ID ${missingIds}를 찾을 수 없습니다.`);
      }
      
      // 모든 음원이 존재하면 일괄 삭제 진행
      // 관련 테이블 데이터 일괄 삭제
      await this.db.delete(monthly_music_rewards).where(inArray(monthly_music_rewards.music_id, ids));
      await this.db.delete(music_tags).where(inArray(music_tags.music_id, ids));
      await this.db.delete(music_plays).where(inArray(music_plays.music_id, ids));
      
      // 음원 일괄 삭제
      await this.db.delete(musics).where(inArray(musics.id, ids));
      
      return {
        message: `${ids.length}개 음원 일괄 삭제 완료`,
        deletedIds: ids,
        summary: {
          total: ids.length,
          success: ids.length,
          failed: 0
        }
      };
      
    } catch (error) {
      throw new Error(`일괄 삭제 실패: ${error.message}`);
    }
  }
}