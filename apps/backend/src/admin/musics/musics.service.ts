import { Injectable, Inject, OnModuleInit, BadRequestException } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { FindMusicsDto } from './dto/find-musics.dto';
import { musics, music_categories, music_tags, monthly_music_rewards, music_plays, raw_tags } from '../../db/schema';
import { eq, like, desc, asc, or, sql, and, inArray } from 'drizzle-orm';
import type { DB } from '../../db/client';
import type { SQL } from 'drizzle-orm';
import { throwError } from 'rxjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { normalizePagination } from '../../common/utils/pagination.util';
import { getDefaultYearMonthKST } from '../../common/utils/date.util';

@Injectable()
export class MusicsService implements OnModuleInit {
  constructor(@Inject('DB') private readonly db: DB) {}

  // 모듈 초기화 시 파일 저장 디렉토리 생성
  async onModuleInit(): Promise<void> {
    await this.ensureStorageDirs();
  }
  // 파일 저장 디렉토리 생성
  private async ensureStorageDirs(): Promise<void> {
    const musicBaseDir = process.env.MUSIC_BASE_DIR
      ? path.resolve(process.env.MUSIC_BASE_DIR)
      : path.resolve(process.cwd(), 'music');
    const lyricsBaseDir = process.env.LYRICS_BASE_DIR
      ? path.resolve(process.env.LYRICS_BASE_DIR)
      : path.resolve(process.cwd(), 'lyrics');
    const imagesBaseDir = process.env.IMAGES_BASE_DIR
      ? path.resolve(process.env.IMAGES_BASE_DIR)
      : path.resolve(process.cwd(), 'images');
    await fs.mkdir(musicBaseDir, { recursive: true });
    await fs.mkdir(lyricsBaseDir, { recursive: true });
    await fs.mkdir(imagesBaseDir, { recursive: true });
  }

  async getCategories() {
    try {
      const categories = await this.db
        .select({ id: music_categories.id, name: music_categories.name })
        .from(music_categories)
        .orderBy(music_categories.name);
      
      return {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }))
      };
    } catch (error) {
      throw new Error(`카테고리 조회 실패: ${error.message}`);
    }
  }

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

    const { page: p, limit: l, offset } = normalizePagination(page, limit, 100);
    const currentMonth = getDefaultYearMonthKST();

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
      LIMIT ${l} OFFSET ${offset}
    `;

    const results = await this.db.execute(rawQuery);

    return {
      musics: results.rows, 
      page: p,
      limit: l
    };
  }

  async create(createMusicDto: CreateMusicDto) {
    try {
      // 카테고리 존재하는지 확인
      const categoryExists = await this.db
      .select({ id: music_categories.id, name: music_categories.name })
      .from(music_categories)
      .where(eq(music_categories.name, createMusicDto.category))
      .limit(1);

    if (categoryExists.length === 0) {
      throw new Error(`카테고리를 찾을 수 없습니다.`);
    }

      const categoryId = categoryExists[0].id;
      // file path 중복 확인  
      const duplicateMusic = await this.db.select().from(musics).where(eq(musics.file_path, createMusicDto.audioFilePath)).limit(1);
      if(duplicateMusic.length > 0) {throw new Error('동일한 경로의 음원이 존재합니다.')}
      
        const newMusic =       await this.db.insert(musics).values({
          file_path: createMusicDto.audioFilePath,
          title: createMusicDto.title,
          artist: createMusicDto.artist,
          category_id: categoryId,
          inst: createMusicDto.musicType === 'Inst',
          release_date: createMusicDto.releaseDate ? createMusicDto.releaseDate : null,
          duration_sec: createMusicDto.durationSec,
          price_per_play: createMusicDto.priceMusicOnly.toString(),
          lyrics_price: createMusicDto.priceLyricsOnly.toString(),
          isrc: createMusicDto.isrc || null,
          composer: createMusicDto.composer || null,
          music_arranger: createMusicDto.arranger || null,
          lyricist: createMusicDto.lyricist || null,
          lyrics_text: createMusicDto.lyricsText || null,
          cover_image_url: createMusicDto.coverImagePath || null,
          lyrics_file_path: createMusicDto.lyricsFilePath || null,
          total_valid_play_count: 0,
          total_play_count: 0,
          total_rewarded_amount: '0',
          total_revenue: '0',
          grade: createMusicDto.grade,
          file_size_bytes: 0,
          last_played_at: null
        }).returning();
        // 음원아이디 추출
    const musicId = newMusic[0].id;
    
    // 리워드 생성 (grade가 1일 때만)
    if (createMusicDto.grade === 1 && createMusicDto.maxPlayCount) {
      await this.db.insert(monthly_music_rewards).values({
        music_id: musicId as any,
        year_month: new Date().toISOString().slice(0, 7),
        total_reward_count: createMusicDto.maxPlayCount,
        remaining_reward_count: createMusicDto.maxPlayCount,
        reward_per_play: createMusicDto.rewardPerPlay.toString()
      });
    }

    // 태그 생성
    if (createMusicDto.tags && createMusicDto.tags.trim()) {
      const tagArr = createMusicDto.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      for (const tagText of tagArr) {
        await this.db.insert(music_tags).values({
          music_id: musicId,
          text: tagText,
          raw_tag_id: null,
        });
      }
    }

    // 성공 응답 반환
    return {
      message: '음원 등록 완료',
      music: {
        id: musicId,
        title: createMusicDto.title,
        artist: createMusicDto.artist,
        category: createMusicDto.category,
        musicType: createMusicDto.musicType,
        durationSec: createMusicDto.durationSec,
        priceMusicOnly: createMusicDto.priceMusicOnly,
        priceLyricsOnly: createMusicDto.priceLyricsOnly,

        rewardPerPlay: createMusicDto.rewardPerPlay,
        maxPlayCount: createMusicDto.maxPlayCount,
        accessTier: createMusicDto.accessTier,
        audioFilePath: createMusicDto.audioFilePath
      },
      id: musicId
    };

  } catch (error) {
    console.error('음원 등록 실패:', error);
    throw new Error(`음원 등록 실패: ${error.message}`);
  }
  }

  async createCategory(dto: { name: string; description?: string }) {
    const name = dto.name.trim();
    const dup = await this.db
      .select({ id: music_categories.id })
      .from(music_categories)
      .where(sql`LOWER(${music_categories.name}) = LOWER(${name})`)
      .limit(1);
    if (dup.length > 0) {
      throw new BadRequestException('이미 존재하는 카테고리입니다.');
    }
    const inserted = await this.db
      .insert(music_categories)
      .values({ name })
      .returning({ id: music_categories.id, name: music_categories.name });
    return { id: inserted[0].id, name };
  }

  async findOne(id: number) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const query = sql`
        SELECT
          m.id,
          m.title,
          m.artist,
          m.inst AS "inst",
          mc.name AS "category",
          COALESCE(STRING_AGG(DISTINCT mt.text, ', '), '') AS "tags",
          COALESCE(STRING_AGG(DISTINCT rt.name, ', '), '') AS "normalizedTags",
          m.release_date AS "releaseDate",
          m.duration_sec AS "durationSec",
          m.isrc AS "isrc",
          m.lyricist AS "lyricist",
          m.composer AS "composer",
          m.music_arranger AS "arranger",
          m.lyrics_text AS "lyricsText",
          m.lyrics_file_path AS "lyricsFilePath",
          m.file_path AS "audioFilePath",
          m.cover_image_url AS "coverImageUrl",
          m.price_per_play AS "priceMusicOnly",
          m.lyrics_price AS "priceLyricsOnly",
          m.created_at AS "createdAt",
          m.grade_required AS "grade",
          COALESCE(mmr.total_reward_count * mmr.reward_per_play, 0) AS "maxRewardLimit",
          mmr.reward_per_play AS "rewardPerPlay",
          mmr.total_reward_count AS "maxPlayCount"
        FROM musics m
        LEFT JOIN music_categories mc ON m.category_id = mc.id
        LEFT JOIN music_tags mt ON m.id = mt.music_id
        LEFT JOIN raw_tags rt ON LOWER(rt.name) = LOWER(mt.text)
        LEFT JOIN monthly_music_rewards mmr ON m.id = mmr.music_id AND mmr.year_month = ${currentMonth}
        WHERE m.id = ${id}
        GROUP BY m.id, m.title, m.artist, m.inst, mc.name, m.release_date, m.duration_sec, m.isrc, m.lyricist, m.composer, m.music_arranger, m.lyrics_text, m.lyrics_file_path, m.file_path, m.cover_image_url, m.price_per_play, m.lyrics_price, m.created_at, m.grade_required, mmr.total_reward_count, mmr.reward_per_play
        LIMIT 1
      `;

      const result = await this.db.execute(query);
      if (!result.rows || result.rows.length === 0) {
        throw new Error('음원을 찾을 수 없습니다.');
      }

      const row: any = result.rows[0];
      const instRaw = row.inst as any;
      const isInst = instRaw === true || instRaw === 't' || instRaw === 'true' || instRaw === 1 || instRaw === '1';
      return {
        id: row.id,
        title: row.title,
        artist: row.artist,
        category: row.category,
        musicType: isInst ? 'Inst' : '일반',
        tags: row.tags,
        normalizedTags: row.normalizedTags,
        releaseDate: row.releaseDate,
        durationSec: row.durationSec,
        isrc: row.isrc,
        lyricist: row.lyricist,
        composer: row.composer,
        arranger: row.arranger,
        coverImageUrl: row.coverImageUrl,
        audioFilePath: row.audioFilePath,
        createdAt: row.createdAt,
        lyricsText: row.lyricsText,
        lyricsFilePath: row.lyricsFilePath,
        priceMusicOnly: row.priceMusicOnly ? Number(row.priceMusicOnly) : undefined,
        priceLyricsOnly: row.priceLyricsOnly ? Number(row.priceLyricsOnly) : undefined,
        rewardPerPlay: row.rewardPerPlay ? Number(row.rewardPerPlay) : undefined,
        maxPlayCount: row.maxPlayCount ? Number(row.maxPlayCount) : undefined,
        maxRewardLimit: row.maxRewardLimit ? Number(row.maxRewardLimit) : 0,
        grade: row.grade,
        accessTier: Number(row.grade) === 0 ? 'all' : 'subscribed'
      };
    } catch (error) {
      console.error('음원 상세 조회 실패:', error);
      throw new Error(`음원 상세 조회 실패: ${error.message}`);
    }
  }

  async getLyricsFileInfo(musicId: number): Promise<{ hasText: boolean; text?: string; hasFile: boolean; absPath?: string; filename?: string }> {
    const rows = await this.db
      .select({ lyrics_text: musics.lyrics_text, lyrics_file_path: musics.lyrics_file_path })
      .from(musics)
      .where(eq(musics.id, musicId))
      .limit(1);

    if (!rows || rows.length === 0) {
      throw new Error('음원을 찾을 수 없습니다.');
    }

    const { lyrics_text, lyrics_file_path } = rows[0] as any;

    if (lyrics_text && String(lyrics_text).trim().length > 0) {
      return { hasText: true, text: String(lyrics_text), hasFile: false };
    }

    if (!lyrics_file_path) {
      return { hasText: false, hasFile: false };
    }

    const baseDir = process.env.LYRICS_BASE_DIR 
      ? path.resolve(process.env.LYRICS_BASE_DIR)
      : path.resolve(process.cwd(), 'lyrics');
    let relativePath = String(lyrics_file_path).replace(/^[/\\]+/, '');
    relativePath = relativePath.replace(/^lyrics[\\/]/i, '');
    const absPath = path.resolve(baseDir, relativePath);
    if (!absPath.startsWith(baseDir)) {
      throw new Error('잘못된 파일 경로입니다.');
    }
    const filename = path.basename(relativePath) || 'lyrics.txt';
    return { hasText: false, hasFile: true, absPath, filename };
  }

  private sanitizeFilename(name: string): string {
    const base = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    return base.replace(/[^a-zA-Z0-9._-]+/g, '_');
  }

  // 파일 저장
  async saveUploadedFiles(files: { audio?: Express.Multer.File[]; lyrics?: Express.Multer.File[]; cover?: Express.Multer.File[] }) {
    try {
      const musicBaseDir = process.env.MUSIC_BASE_DIR
        ? path.resolve(process.env.MUSIC_BASE_DIR)
        : path.resolve(process.cwd(), 'music');
      const lyricsBaseDir = process.env.LYRICS_BASE_DIR
        ? path.resolve(process.env.LYRICS_BASE_DIR)
        : path.resolve(process.cwd(), 'lyrics');
      const imagesBaseDir = process.env.IMAGES_BASE_DIR
        ? path.resolve(process.env.IMAGES_BASE_DIR)
        : path.resolve(process.cwd(), 'images');

      await fs.mkdir(musicBaseDir, { recursive: true });
      await fs.mkdir(lyricsBaseDir, { recursive: true });
      await fs.mkdir(imagesBaseDir, { recursive: true });

      let audioFilePath: string | undefined;
      let lyricsFilePath: string | undefined;
      let coverImagePath: string | undefined;

      if (files.audio && files.audio[0]) {
        const file = files.audio[0];
        const original = this.sanitizeFilename(file.originalname || 'audio');
        const timestamp = Date.now();
        const filename = `${timestamp}_${original}`;
        const abs = path.resolve(musicBaseDir, filename);
        await fs.writeFile(abs, file.buffer);
        audioFilePath = filename; 
      }

      if (files.lyrics && files.lyrics[0]) {
        const file = files.lyrics[0];
        const original = this.sanitizeFilename(file.originalname || 'lyrics.txt');
        const timestamp = Date.now();
        const filename = `${timestamp}_${original}`;
        const abs = path.resolve(lyricsBaseDir, filename);
        let outBuffer = file.buffer;
        if (outBuffer.length >= 2) {
          const b0 = outBuffer[0];
          const b1 = outBuffer[1];
          if (b0 === 0xFF && b1 === 0xFE) {
            const td = new TextDecoder('utf-16le');
            const text = td.decode(outBuffer.subarray(2));
            outBuffer = Buffer.from(text, 'utf-8');
          }
          else if (b0 === 0xFE && b1 === 0xFF) {
            const swapped = Buffer.alloc(outBuffer.length - 2);
            for (let i = 2; i < outBuffer.length; i += 2) {
              const hi = outBuffer[i];
              const lo = outBuffer[i + 1] ?? 0x00;
              swapped[i - 2] = lo;
              swapped[i - 1] = hi;
            }
            const td = new TextDecoder('utf-16le');
            const text = td.decode(swapped);
            outBuffer = Buffer.from(text, 'utf-8');
          }
        }
        await fs.writeFile(abs, outBuffer);
        lyricsFilePath = filename; 
      }

      if (files.cover && files.cover[0]) {
        const file = files.cover[0];
        const original = this.sanitizeFilename(file.originalname || 'cover');
        const timestamp = Date.now();
        const filename = `${timestamp}_${original}`;
        const abs = path.resolve(imagesBaseDir, filename);
        await fs.writeFile(abs, file.buffer);
        coverImagePath = filename; 
      }

      return { audioFilePath, lyricsFilePath, coverImagePath };
    } catch (error) {
      throw new Error(`파일 저장 실패: ${error.message}`);
    }
  }

  async getCoverFile(id: number): Promise<{ absPath?: string; filename?: string; contentType?: string; url?: string; isUrl: boolean }> {
    const rows = await this.db
      .select({ cover_image_url: musics.cover_image_url })
      .from(musics)
      .where(eq(musics.id, id))
      .limit(1);

    if (!rows || rows.length === 0) {
      throw new Error('음원을 찾을 수 없습니다.');
    }

    const cover = (rows[0] as any).cover_image_url as string | null;
    if (!cover) {
      throw new Error('커버 이미지가 없습니다.');
    }

    // 원격 URL인 경우(레거시 데이터 호환)
    if (/^https?:\/\//i.test(cover)) {
      return { url: cover, isUrl: true };
    }

    const imagesBaseDir = process.env.IMAGES_BASE_DIR
      ? path.resolve(process.env.IMAGES_BASE_DIR)
      : path.resolve(process.cwd(), 'images');

    const relative = String(cover).replace(/^[/\\]+/, '');
    const absPath = path.resolve(imagesBaseDir, relative);
    if (!absPath.startsWith(imagesBaseDir)) {
      throw new Error('잘못된 파일 경로입니다.');
    }

    const ext = path.extname(relative).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const filename = path.basename(relative);

    return { absPath, filename, contentType, isUrl: false };
  }

  async update(id: number, updateMusicDto: UpdateMusicDto) {
    const forbiddenKeys: Array<keyof UpdateMusicDto> = ['audioFilePath', 'coverImagePath', 'isrc' as any, 'musicType' as any];
    for (const key of forbiddenKeys) {
      if ((updateMusicDto as any)[key] !== undefined) {
        throw new BadRequestException('음원 파일, 썸네일, ISRC, 음원 유형은 수정할 수 없습니다.');
      }
    }

    const updates: any = {};

    if (updateMusicDto.title !== undefined) updates.title = updateMusicDto.title;
    if (updateMusicDto.artist !== undefined) updates.artist = updateMusicDto.artist;
    if (updateMusicDto.releaseDate !== undefined) updates.release_date = updateMusicDto.releaseDate || null;
    if (updateMusicDto.priceMusicOnly !== undefined) updates.price_per_play = updateMusicDto.priceMusicOnly.toString();
    if (updateMusicDto.priceLyricsOnly !== undefined) updates.lyrics_price = updateMusicDto.priceLyricsOnly.toString();
    if (updateMusicDto.accessTier !== undefined) updates.grade = updateMusicDto.accessTier === 'all' ? 0 : 1;

    if (updateMusicDto.lyricsFilePath !== undefined) {
      updates.lyrics_file_path = updateMusicDto.lyricsFilePath || null;
      updates.lyrics_text = null;
    } else if (updateMusicDto.lyricsText !== undefined) {
      updates.lyrics_text = updateMusicDto.lyricsText || null;
      updates.lyrics_file_path = null;
    }

    let oldCategoryId: number | null = null;
    if (updateMusicDto.category !== undefined) {
      const before = await this.db.select({ id: musics.category_id }).from(musics).where(eq(musics.id, id)).limit(1);
      oldCategoryId = before.length ? (before[0].id as unknown as number) : null;
    }

    if (updateMusicDto.category !== undefined) {
      const category = await this.db
        .select({ id: music_categories.id })
        .from(music_categories)
        .where(eq(music_categories.name, updateMusicDto.category))
        .limit(1);
      if (category.length === 0) {
        throw new BadRequestException('카테고리를 찾을 수 없습니다.');
      }
      updates.category_id = category[0].id;
    }

    if (Object.keys(updates).length > 0) {
      await this.db.update(musics).set(updates).where(eq(musics.id, id));
    }

    if (updateMusicDto.tags !== undefined) {
      const tagArr = updateMusicDto.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await this.db.delete(music_tags).where(eq(music_tags.music_id, id));

      // 태그 재생성 (raw_tag_id는 항상 NULL로 저장)
      for (const tagText of tagArr) {
        await this.db.insert(music_tags).values({ music_id: id, text: tagText, raw_tag_id: null });
      }
    }

    if (updateMusicDto.category !== undefined && oldCategoryId && updates.category_id && oldCategoryId !== updates.category_id) {
      await this.cleanupOrphanCategories();
    }

    return { message: '음원 정보가 수정되었습니다.', id };
  }

  private async cleanupOrphanCategories() {
    await this.db.execute(sql`
      delete from ${music_categories} c
      where not exists (
        select 1 from ${musics} m where m.category_id = c.id
      )
    `);
  }

  async delete(ids: number[]) {
    try {
      // 모든 음원이 존재하는지 한 번에 확인
      const existingMusics = await this.db.select({ id: musics.id }).from(musics).where(inArray(musics.id, ids));
      const existingIds = existingMusics.map(m => m.id);
      const missingIds = ids.filter(id => !existingIds.includes(id));
      if (missingIds.length > 0) {
        throw new Error(`음원 ID ${missingIds.join(', ')}를 찾을 수 없습니다.`);
      }
      await this.db.delete(monthly_music_rewards).where(inArray(monthly_music_rewards.music_id, ids));
      await this.db.delete(music_tags).where(inArray(music_tags.music_id, ids));
      await this.db.delete(music_plays).where(inArray(music_plays.music_id, ids));
      await this.db.delete(musics).where(inArray(musics.id, ids));

      // 고아 카테고리 정리
      await this.cleanupOrphanCategories();

      const message = ids.length === 1 
        ? `음원 ID ${ids[0]} 삭제 완료`
        : `${ids.length}개 음원 일괄 삭제 완료`;
      return {
        message,
        deletedIds: ids,
        summary: {
          total: ids.length,
          success: ids.length,
          failed: 0
        }
      };
    } catch (error) {
      throw new Error(`음원 삭제 실패: ${error.message}`);
    }
  }

  async updateNextMonthRewards(musicId: number, dto: UpdateRewardDto) {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth(); 
    const next = new Date(Date.UTC(y, m + 1, 1));
    const ym = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;

    // upsert: (music_id, year_month) 기준
    const upsertQuery = sql`
      insert into ${monthly_music_rewards} (music_id, year_month, total_reward_count, remaining_reward_count, reward_per_play)
      values (${musicId}, ${ym}, ${dto.totalRewardCount}, ${dto.totalRewardCount}, ${dto.rewardPerPlay})
      on conflict (music_id, year_month)
      do update set total_reward_count = ${dto.totalRewardCount}, remaining_reward_count = ${dto.totalRewardCount}, reward_per_play = ${dto.rewardPerPlay}
      returning music_id, year_month
    `;

    const result = await this.db.execute(upsertQuery);
    return { message: '다음 달 리워드가 업데이트되었습니다.', musicId, yearMonth: ym };
  }


}