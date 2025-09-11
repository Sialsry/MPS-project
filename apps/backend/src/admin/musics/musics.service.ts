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
import { resolveYearMonthKST } from '../../common/utils/date.util';
import { normalizeSort } from '../../common/utils/sort.util';
import { MusicRewardsSummaryQueryDto, MusicRewardsSummaryResponseDto } from './dto/music-rewards-summary.dto';
import { MusicRewardsTrendQueryDto, MusicRewardsTrendResponseDto } from './dto/music-rewards-trend.dto';
import { MusicMonthlyRewardsQueryDto, MusicMonthlyRewardsResponseDto } from './dto/music-monthly-rewards.dto';
import { buildMusicRewardsSummaryQuery, buildMusicRewardsSummaryCountQuery, buildMusicRewardsOrderSql } from './queries/rewards.queries';
import { buildFindAllQuery, buildFindOneQuery, buildUpsertNextMonthRewardsQuery, buildCleanupOrphanCategoriesQuery } from './queries/musics.queries';
import { buildMusicTrendDailyQuery, buildMusicTrendMonthlyQuery } from './queries/trend.queries';
import { buildMusicMonthlyRewardsQuery } from './queries/monthly.queries';
import { buildMusicCompanyUsageListQuery, buildMusicCompanyUsageCountQuery } from './queries/company-usage.queries';
import { MusicTotalStatsQueryDto, MusicTotalStatsResponseDto } from './dto/music-stats.dto';
import { PlaysValidStatsQueryDto, PlaysValidStatsResponseDto } from './dto/plays-valid-stats.dto';
import { RevenueForecastQueryDto, RevenueForecastResponseDto } from './dto/revenue-forecast.dto';
import { buildMonthRangeCTE, resolveYearMonthKST as resolveYM, isCurrentYM } from '../../common/utils/date.util';
import { RewardsFilledStatsQueryDto, RewardsFilledStatsResponseDto } from './dto/rewards-filled-stats.dto';
import { CategoryTop5QueryDto, CategoryTop5ResponseDto, CategoryTop5ItemDto } from './dto/category-top5.dto';
import { RealtimeApiStatusQueryDto, RealtimeApiStatusResponseDto, RealtimeApiStatusItemDto, RealtimeTopTracksQueryDto, RealtimeTopTracksResponseDto, RealtimeTopTracksItemDto, RealtimeTransactionsQueryDto, RealtimeTransactionsResponseDto, RealtimeTransactionsItemDto } from './dto/realtime.dto';
import { buildCategoryTop5Query, buildRealtimeApiStatusQuery, buildRealtimeTopTracksQuery, buildRealtimeTransactionsQuery } from './queries/stats.queries';

@Injectable()
export class MusicsService implements OnModuleInit {
  constructor(@Inject('DB') private readonly db: DB) { }

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

  async findAll(findMusicsDto: any): Promise<{
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
    const rawQuery = buildFindAllQuery({
      search,
      categoryLabel: category ?? null,
      musicType: (musicType as any) ?? '',
      idSortFilter: (idSortFilter as any) ?? '',
      releaseDateSortFilter: (releaseDateSortFilter as any) ?? '',
      rewardLimitFilter: (rewardLimitFilter as any) ?? '',
      currentMonth,
      limit: l,
      offset,
    });

    console.log('🔍 Query parameters:', { search, category, musicType, currentMonth, limit: l, offset });
    console.log('🔍 Raw query:', rawQuery);
    
    const results = await this.db.execute(rawQuery);
    
    console.log('🔍 Query results:', results.rows.length, 'rows found');
    console.log('🔍 First result:', results.rows[0]);

    return {
      musics: results.rows,
      page: p,
      limit: l
    };
  }

  async getRewardsSummary(query: MusicRewardsSummaryQueryDto): Promise<MusicRewardsSummaryResponseDto> {
    const ym = resolveYearMonthKST(query.yearMonth)
    const [y, m] = ym.split('-').map(Number)
    const { page = 1, limit = 20 } = query
    const { offset, page: p, limit: l } = normalizePagination(page, limit, 100)

    const sortAllow = ['music_id', 'title', 'artist', 'category', 'grade', 'musicType', 'monthlyLimit', 'rewardPerPlay', 'usageRate', 'validPlays', 'earned', 'companiesUsing', 'lastUsedAt']
    const { sortBy, order } = normalizeSort(query.sortBy, query.order, sortAllow)

    const orderSql: SQL = buildMusicRewardsOrderSql(sortBy, order)

    const musicTypeBool = query.musicType === 'inst' ? true : query.musicType === 'normal' ? false : undefined

    const gradeNum = query.grade && query.grade !== 'all' ? Number(query.grade) : undefined

    const listSql = buildMusicRewardsSummaryQuery({
      year: y,
      month: m,
      search: query.search,
      categoryId: query.categoryId,
      grade: gradeNum,
      musicType: musicTypeBool,
      offset,
      limit: l,
      orderBySql: orderSql,
    })

    const countSql = buildMusicRewardsSummaryCountQuery({
      year: y,
      month: m,
      search: query.search,
      categoryId: query.categoryId,
      grade: gradeNum,
      musicType: musicTypeBool,
    })

    const [rowsRes, countRes] = await Promise.all([
      this.db.execute(listSql),
      this.db.execute(countSql),
    ])

    const items = (rowsRes.rows || []).map((r: any) => ({
      musicId: Number(r.music_id),
      title: r.title,
      artist: r.artist,
      category: r.category ?? null,
      musicType: (() => {
        const v = r.music_type
        const b = v === true || v === 't' || v === 'true' || v === 1 || v === '1'
        return b ? 'Inst' : '일반'
      })(),
      grade: Number(r.grade) as 0 | 1 | 2,
      validPlays: Number(r.valid_plays || 0),
      earned: Number(r.earned || 0),
      companiesUsing: Number(r.companies_using || 0),
      lastUsedAt: r.last_used_at ?? null,
      monthlyLimit: r.monthly_limit !== null && r.monthly_limit !== undefined ? Number(r.monthly_limit) : null,
      usageRate: (() => {
        const total = r.monthly_limit !== null && r.monthly_limit !== undefined ? Number(r.monthly_limit) : null
        if (total === null || total <= 0) return null
        const remaining = r.monthly_remaining !== null && r.monthly_remaining !== undefined ? Number(r.monthly_remaining) : null
        if (remaining !== null && remaining >= 0) {
          const used = Math.max(total - remaining, 0)
          if (used > 0) {
            return Math.min(100, Math.round((used / total) * 100))
          }
        }
        const rewardPerPlay = r.reward_per_play !== null && r.reward_per_play !== undefined ? Number(r.reward_per_play) : null
        const earned = r.earned !== null && r.earned !== undefined ? Number(r.earned) : 0
        if (rewardPerPlay !== null && rewardPerPlay > 0 && earned > 0) {
          const usedEst = Math.floor(earned / rewardPerPlay)
          return Math.min(100, Math.round((usedEst / total) * 100))
        }
        const validPlays = r.valid_plays !== null && r.valid_plays !== undefined ? Number(r.valid_plays) : 0
        if (validPlays > 0) {
          const usedEst = Math.min(validPlays, total)
          return Math.min(100, Math.round((usedEst / total) * 100))
        }
        return 0
      })(),
      rewardPerPlay: r.reward_per_play !== null && r.reward_per_play !== undefined ? Number(r.reward_per_play) : null,
    }))

    const total = Number((countRes.rows?.[0] as any)?.total || 0)

    return { yearMonth: ym, total, page: p, limit: l, items }
  }

  async getMonthlyRewards(musicId: number, query: MusicMonthlyRewardsQueryDto): Promise<MusicMonthlyRewardsResponseDto> {
    const endYM = query.endYearMonth ? resolveYearMonthKST(query.endYearMonth) : getDefaultYearMonthKST()
    const [endYear, endMonth] = endYM.split('-').map(Number)
    const months = Math.min(Math.max(query.months ?? 12, 1), 24)

    const sqlQuery = buildMusicMonthlyRewardsQuery({
      musicId,
      endYear,
      endMonth,
      months,
    })

    const res = await this.db.execute(sqlQuery)
    const rows = res.rows || []

    const items = rows.map((r: any) => {
      const label: string = r.label
      const validPlays: number = Number(r.valid_plays || 0)
      const companiesUsing: number = Number(r.companies_using || 0)
      const monthlyLimit: number | null = r.monthly_limit !== null && r.monthly_limit !== undefined ? Number(r.monthly_limit) : null
      const monthlyRemaining: number | null = r.monthly_remaining !== null && r.monthly_remaining !== undefined ? Number(r.monthly_remaining) : null
      const rewardPerPlay: number | null = r.reward_per_play !== null && r.reward_per_play !== undefined ? Number(r.reward_per_play) : null
      const earned: number = Number(r.earned || 0)

      // usageRate 계산: 잔여 사용분이 있으면 (used/total), 아니면 지급액/호출당리워드, 아니면 유효재생수 기준
      const usageRate: number | null = (() => {
        if (monthlyLimit === null || monthlyLimit <= 0) return null
        if (monthlyRemaining !== null && monthlyRemaining >= 0) {
          const used = Math.max(monthlyLimit - monthlyRemaining, 0)
          if (used > 0) return Math.min(100, Math.round((used / monthlyLimit) * 100))
        }
        if (rewardPerPlay !== null && rewardPerPlay > 0 && earned > 0) {
          const usedEst = Math.floor(earned / rewardPerPlay)
          return Math.min(100, Math.round((usedEst / monthlyLimit) * 100))
        }
        if (validPlays > 0) {
          const usedEst = Math.min(validPlays, monthlyLimit)
          return Math.min(100, Math.round((usedEst / monthlyLimit) * 100))
        }
        return 0
      })()

      return {
        label,
        validPlays,
        companiesUsing,
        monthlyLimit,
        usageRate,
        earned,
        rewardPerPlay,
      }
    })

    return {
      labels: items.map(i => i.label),
      items,
      meta: { endYearMonth: endYM, months },
    }
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
      if (duplicateMusic.length > 0) { throw new Error('동일한 경로의 음원이 존재합니다.') }

      const newMusic = await this.db.insert(musics).values({
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

      // 리워드 생성 
      const rewardData = {
        music_id: musicId as any,
        year_month: new Date().toISOString().slice(0, 7),
        total_reward_count: createMusicDto.grade === 1 ? createMusicDto.maxPlayCount || 0 : 0,
        remaining_reward_count: createMusicDto.grade === 1 ? createMusicDto.maxPlayCount || 0 : 0,
        reward_per_play: createMusicDto.grade === 1 ? createMusicDto.rewardPerPlay.toString() : '0'
      };

      await this.db.insert(monthly_music_rewards).values(rewardData);

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
          grade: createMusicDto.grade,
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
      const query = buildFindOneQuery(id, currentMonth);

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
        grade: row.grade
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

  async getRewardsTrend(musicId: number, query: MusicRewardsTrendQueryDto): Promise<MusicRewardsTrendResponseDto> {
    const segment = (query.segment ?? 'category') as 'category' | 'all'
    if (query.granularity === 'daily') {
      const ym = resolveYearMonthKST(query.yearMonth)
      const [y, m] = ym.split('-').map(Number)
      const sqlQ = buildMusicTrendDailyQuery({
        musicId,
        year: y,
        month: m,
        type: query.type,
        segment,
      })
      const res = await this.db.execute(sqlQ)
      const labels: string[] = []
      const current: number[] = []
      const industry: number[] = []
      for (const row of res.rows as any[]) {
        labels.push(String(row.label))
        current.push(Number(row.current_cnt || 0))
        industry.push(Number(row.industry_avg || 0))
      }
      return {
        labels,
        series: [
          { label: '현재 음원', data: current },
          { label: '업계 평균', data: industry },
        ],
        meta: { granularity: 'daily', type: query.type, segment, yearMonth: ym },
      }
    } else {
      const now = new Date()
      const kst = new Date(now.getTime() + 9 * 3600 * 1000)
      const endYear = kst.getUTCFullYear()
      const endMonth = kst.getUTCMonth() + 1
      const months = query.months && query.months > 0 ? query.months : 12
      const sqlQ = buildMusicTrendMonthlyQuery({
        musicId,
        endYear,
        endMonth,
        months,
        type: query.type,
        segment,
      })
      const res = await this.db.execute(sqlQ)
      const labels: string[] = []
      const current: number[] = []
      const industry: number[] = []
      for (const row of res.rows as any[]) {
        labels.push(String(row.label))
        current.push(Number(row.current_cnt || 0))
        industry.push(Number(row.industry_avg || 0))
      }
      return {
        labels,
        series: [
          { label: '현재 음원', data: current },
          { label: '업계 평균', data: industry },
        ],
        meta: { granularity: 'monthly', type: query.type, segment, months },
      }
    }
  }

  async getCompanyUsage(musicId: number, query: any) {
    const ym = resolveYearMonthKST(query.yearMonth)
    const [y, m] = ym.split('-').map(Number)
    const { page = 1, limit = 20, search } = query
    const { offset, page: p, limit: l } = normalizePagination(page, limit, 100)

    const listSql = buildMusicCompanyUsageListQuery({ musicId, year: y, month: m, search, limit: l, offset })
    const countSql = buildMusicCompanyUsageCountQuery({ musicId, year: y, month: m, search })
    const [listRes, countRes] = await Promise.all([this.db.execute(listSql), this.db.execute(countSql)])
    const items = (listRes.rows || []).map((r: any, idx: number) => ({
      rank: offset + idx + 1,
      companyId: Number(r.company_id),
      companyName: r.company_name,
      tier: (String(r.grade || '')[0].toUpperCase() + String(r.grade || '').slice(1)) as 'Free' | 'Standard' | 'Business',
      monthlyEarned: Number(r.monthly_earned || 0),
      monthlyPlays: Number(r.monthly_plays || 0),
    }))
    const total = Number((countRes.rows?.[0] as any)?.total || 0)
    return { yearMonth: ym, total, page: p, limit: l, items }
  }

  async getTotalCount(query: MusicTotalStatsQueryDto): Promise<MusicTotalStatsResponseDto> {
    const ym = query.yearMonth ?? getDefaultYearMonthKST()
    const [y, m] = ym.split('-').map(Number)
    const endTsSql = sql`
      (make_timestamptz(${y}, ${m}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second'
    `
    const q = sql`
      SELECT COUNT(*)::int AS total
      FROM ${musics} m
      WHERE m.created_at <= ${endTsSql}
    `
    const res = await this.db.execute(q)
    const total = Number((res.rows?.[0] as any)?.total ?? 0)
    return { total, asOf: ym }
  }

  async getValidPlaysStats(query: PlaysValidStatsQueryDto): Promise<PlaysValidStatsResponseDto> {
    const ym = query.yearMonth ?? getDefaultYearMonthKST()
    const [y, m] = ym.split('-').map(Number)
    const cte = buildMonthRangeCTE(y, m)
    const q = sql`
      ${cte}
      SELECT
        COUNT(*) FILTER (WHERE mp.is_valid_play = true)::bigint AS valid_plays,
        COUNT(*)::bigint AS total_plays,
        COUNT(*) FILTER (WHERE mp.is_valid_play = true AND mp.reward_code = '1')::bigint AS rewarded_plays
      FROM music_plays mp, month_range mr
      WHERE mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
    `
    const res = await this.db.execute(q)
    const row = (res.rows?.[0] as any) || {}
    const validPlays = Number(row.valid_plays ?? 0)
    const rewardedPlays = Number(row.rewarded_plays ?? 0)
    const rewardRate = validPlays > 0 ? Math.round((rewardedPlays / validPlays) * 100) : 0

    return {
      validPlays,
      totalPlays: Number(row.total_plays ?? 0),
      rewardedPlays,
      rewardRate,
      asOf: ym,
    }
  }


  async getRevenueForecast(query: RevenueForecastQueryDto): Promise<RevenueForecastResponseDto> {
    const ym = query.yearMonth ?? getDefaultYearMonthKST()
    const [y, m] = ym.split('-').map(Number)
    const current = isCurrentYM(ym)
    const cte = buildMonthRangeCTE(y, m)
    const qCurrent = sql`
      ${cte}
      SELECT 
        COALESCE(SUM(subscription_revenue), 0) - COALESCE(SUM(usage_revenue), 0) AS mtd
      FROM (
        -- 구독료 (결제일 기준)
        SELECT 
          COALESCE(SUM(cs.actual_paid_amount), 0) AS subscription_revenue,
          0 AS usage_revenue
        FROM company_subscriptions cs
        JOIN companies c ON c.id = cs.company_id
        CROSS JOIN month_range mr
        WHERE c.grade <> 'free'
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') >= mr.month_start
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') <= NOW()
        
        UNION ALL
        
        -- 사용료 (유효재생 기준) - 차감
        SELECT 
          0 AS subscription_revenue,
          COALESCE(SUM(
            CASE 
              WHEN mp.use_case = '0' OR mp.use_case = '1' THEN m.price_per_play::numeric
              WHEN mp.use_case = '2' AND m.inst = false THEN m.lyrics_price::numeric
              ELSE 0
            END
          ), 0) AS usage_revenue
        FROM music_plays mp
        JOIN musics m ON m.id = mp.music_id
        CROSS JOIN month_range mr
        WHERE mp.is_valid_play = true
          AND mp.created_at >= mr.month_start
          AND mp.created_at <= NOW()
      ) revenue_data
    `

    const qPast = sql`
      ${cte}
      SELECT 
        COALESCE(SUM(subscription_revenue), 0) - COALESCE(SUM(usage_revenue), 0) AS mtd
      FROM (
        -- 구독료 (결제일 기준)
        SELECT 
          COALESCE(SUM(cs.actual_paid_amount), 0) AS subscription_revenue,
          0 AS usage_revenue
        FROM company_subscriptions cs
        JOIN companies c ON c.id = cs.company_id
        CROSS JOIN month_range mr
        WHERE c.grade <> 'free'
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') >= mr.month_start
          AND DATE(cs.start_date AT TIME ZONE 'Asia/Seoul') <= mr.month_end
        
        UNION ALL
        
        -- 사용료 (유효재생 기준) - 차감
        SELECT 
          0 AS subscription_revenue,
          COALESCE(SUM(
            CASE 
              WHEN mp.use_case = '0' OR mp.use_case = '1' THEN m.price_per_play::numeric
              WHEN mp.use_case = '2' AND m.inst = false THEN m.lyrics_price::numeric
              ELSE 0
            END
          ), 0) AS usage_revenue
        FROM music_plays mp
        JOIN musics m ON m.id = mp.music_id
        CROSS JOIN month_range mr
        WHERE mp.is_valid_play = true
          AND mp.created_at >= mr.month_start
          AND mp.created_at <= mr.month_end
      ) revenue_data
    `

    const res = await this.db.execute(current ? qCurrent : qPast)
    const row = (res.rows?.[0] as any) || {}
    const mtd = Number(row.mtd ?? 0)

    return { mtd, forecast: mtd, asOf: ym }
  }

  async getRewardsFilledStats(query: RewardsFilledStatsQueryDto): Promise<RewardsFilledStatsResponseDto> {
    const ym = resolveYM(query.yearMonth)
    const [y, m] = ym.split('-').map(Number)
    const cte = buildMonthRangeCTE(y, m)
    const q = sql`
      ${cte}
        , plays AS (
        SELECT 
          mp.music_id,
          COUNT(*) FILTER (WHERE mp.is_valid_play = true) AS valid_plays,
          COALESCE(SUM(CASE WHEN mp.is_valid_play = true AND mp.reward_code = '1' THEN mp.reward_amount::numeric ELSE 0 END), 0) AS earned,
          COUNT(*) FILTER (WHERE mp.is_valid_play = true AND mp.reward_code IN ('2', '3')) AS limit_exhausted_plays
        FROM music_plays mp, month_range mr
        WHERE mp.created_at >= mr.month_start AND mp.created_at <= mr.month_end
        GROUP BY mp.music_id
      )
      SELECT
        COUNT(*) FILTER (WHERE mmr.total_reward_count > 0)::bigint AS eligible,
        COUNT(*) FILTER (
          WHERE mmr.total_reward_count > 0 AND COALESCE(p.limit_exhausted_plays, 0) > 0
        )::bigint AS filled
      FROM monthly_music_rewards mmr
      LEFT JOIN plays p ON p.music_id = mmr.music_id
      WHERE mmr.year_month = ${ym}
    `
    const res = await this.db.execute(q)
    const row = (res.rows?.[0] as any) || {}
    const eligible = Number(row.eligible ?? 0)
    const filled = Number(row.filled ?? 0)
    const ratio = eligible > 0 ? Math.round((filled / eligible) * 100) : null
    return { eligible, filled, ratio, asOf: ym }
  }


  async getCategoryTop5(query: CategoryTop5QueryDto): Promise<CategoryTop5ResponseDto> {
    const ym = resolveYM(query.yearMonth)
    const [y, m] = ym.split('-').map(Number)
    const limit = Math.min(Math.max(query.limit ?? 5, 1), 20)
    const tz = 'Asia/Seoul'

    const q = buildCategoryTop5Query(y, m, tz, limit)
    const res = await this.db.execute(q)
    const rows = (res.rows || []) as any[]

    const items: CategoryTop5ItemDto[] = rows.map((r: any) => ({
      category: r.category || '미분류',
      validPlays: Number(r.valid_plays || 0),
      rank: Number(r.rank || 0),
    }))

    return { yearMonth: ym, items }
  }

  async getRealtimeApiStatus(query: RealtimeApiStatusQueryDto): Promise<RealtimeApiStatusResponseDto> {
    const limit = Math.min(Math.max(query.limit ?? 5, 1), 20)

    // music_plays 테이블에서 직접 데이터 조회
    const q = sql`
      SELECT 
        mp.created_at,
        CASE WHEN mp.is_valid_play THEN 'success' ELSE 'error' END AS status,
        CASE 
          WHEN mp.use_case = '0' THEN '/api/music/play'
          WHEN mp.use_case = '1' THEN '/api/music/play'
          WHEN mp.use_case = '2' THEN '/api/lyrics/get'
          ELSE '/api/unknown'
        END AS endpoint,
        CASE 
          WHEN mp.use_case = '0' THEN '음원 호출'
          WHEN mp.use_case = '1' THEN '음원 호출'
          WHEN mp.use_case = '2' THEN '가사 호출'
          ELSE '알 수 없음'
        END AS call_type,
        CASE 
          WHEN mp.is_valid_play THEN '유효재생'
          ELSE '무효재생'
        END AS validity,
        c.name AS company
      FROM music_plays mp
      JOIN companies c ON c.id = mp.using_company_id
      ORDER BY mp.created_at DESC
      LIMIT ${limit}
    `

    const res = await this.db.execute(q)
    const rows = (res.rows || []) as any[]

    const items: RealtimeApiStatusItemDto[] = rows.map((r: any) => ({
      status: r.status === 'success' ? 'success' : 'error',
      endpoint: r.endpoint || '/api/unknown',
      callType: r.call_type || '알 수 없음',
      validity: r.validity || '무효재생',
      company: r.company || 'Unknown',
      timestamp: r.timestamp || '00:00:00',
    }))

    return { items }
  }

  async getRealtimeApiCalls(query: RealtimeApiStatusQueryDto): Promise<RealtimeApiStatusResponseDto> {
    const limit = Math.min(Math.max(query.limit ?? 5, 1), 20)

    // music_plays 테이블에서 직접 데이터 조회
    const q = sql`
      SELECT 
        mp.created_at,
        CASE WHEN mp.is_valid_play THEN 'success' ELSE 'error' END AS status,
        CASE 
          WHEN mp.use_case = '0' THEN '/api/music/play'
          WHEN mp.use_case = '1' THEN '/api/music/play'
          WHEN mp.use_case = '2' THEN '/api/lyrics/get'
          ELSE '/api/unknown'
        END AS endpoint,
        CASE 
          WHEN mp.use_case = '0' THEN '음원 호출'
          WHEN mp.use_case = '1' THEN '음원 호출'
          WHEN mp.use_case = '2' THEN '가사 호출'
          ELSE '알 수 없음'
        END AS call_type,
        CASE 
          WHEN mp.is_valid_play THEN '유효재생'
          ELSE '무효재생'
        END AS validity,
        c.name AS company
      FROM music_plays mp
      JOIN companies c ON c.id = mp.using_company_id
      ORDER BY mp.created_at DESC
      LIMIT ${limit}
    `

    const res = await this.db.execute(q)
    const rows = (res.rows || []) as any[]

    const items: RealtimeApiStatusItemDto[] = rows.map((r: any) => ({
      status: r.status === 'success' ? 'success' : 'error',
      endpoint: r.endpoint || '/api/unknown',
      callType: r.call_type || '알 수 없음',
      validity: r.validity || '무효재생',
      company: r.company || 'Unknown',
      timestamp: r.timestamp || '00:00:00',
    }))

    return { items }
  }

  async getRealtimeTopTracks(query: RealtimeTopTracksQueryDto): Promise<RealtimeTopTracksResponseDto> {
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 50)
    const q = buildRealtimeTopTracksQuery(limit)
    const res = await this.db.execute(q)
    const rows = (res.rows || []) as any[]

    // console.log(`[TopTracks] Fetching top ${limit} tracks based on 24h valid plays`)
    // console.log(`[TopTracks] Found ${rows.length} tracks`)

    const items: RealtimeTopTracksItemDto[] = rows.map((r: any) => ({
      rank: Number(r.rank || 0),
      title: r.title || 'Unknown Track',
      validPlays: Number(r.valid_plays || 0),
      totalPlays: Number(r.total_plays || 0),
      validRate: Number(r.valid_rate || 0),
    }))

    //console.log(`[TopTracks] Top track: ${items[0]?.title} with ${items[0]?.validPlays} valid plays`)
    return { items }
  }

  async getRealtimeTransactions(query: RealtimeTransactionsQueryDto): Promise<RealtimeTransactionsResponseDto> {
    const limit = Math.min(Math.max(query.limit ?? 3, 1), 10)
    const q = buildRealtimeTransactionsQuery(limit)
    const res = await this.db.execute(q)
    const rows = (res.rows || []) as any[]

    const items: RealtimeTransactionsItemDto[] = rows.map((r: any) => ({
      timestamp: r.timestamp || '00:00:00',
      status: r.status === 'success' ? 'success' : r.status === 'pending' ? 'pending' : 'failed',
      processedCount: r.processed_count || '0/0',
      gasFee: r.gas_fee || '0.000 ETH',
      hash: r.hash || '0x0000...0000',
    }))

    return { items }
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
    if (updateMusicDto.grade !== undefined) updates.grade = updateMusicDto.grade;

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
    await this.db.execute(buildCleanupOrphanCategoriesQuery());
  }

  async delete(ids: number[]) {
    try {
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
    const current = new Date(Date.UTC(y, m, 1));
    const ym = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}`;
    const currentData = await this.db.execute(sql`
      SELECT total_reward_count, remaining_reward_count
      FROM monthly_music_rewards
      WHERE music_id = ${musicId} AND year_month = ${ym}
    `);

    console.log('조회된 데이터:', {
      musicId,
      yearMonth: ym,
      rowsCount: currentData.rows?.length || 0,
      rows: currentData.rows
    });

    // 실제 사용량 계산 (music_plays에서 유효재생들의 use_price 합계)
    const usedCountResult = await this.db.execute(sql`
      SELECT COALESCE(SUM(use_price), 0) as used_count
      FROM music_plays 
      WHERE music_id = ${musicId} 
        AND is_valid_play = true
        AND EXTRACT(YEAR FROM created_at) = ${parseInt(ym.split('-')[0])}
        AND EXTRACT(MONTH FROM created_at) = ${parseInt(ym.split('-')[1])}
    `);

    const usedCount = Number((usedCountResult.rows?.[0] as any)?.used_count || 0);

    let newRemainingCount = dto.totalRewardCount;
    if (dto.totalRewardCount > usedCount) {
      newRemainingCount = dto.totalRewardCount - usedCount;
    } else {
      newRemainingCount = 0;
    }

    console.log('리워드 수정 로직:', {
      musicId,
      yearMonth: ym,
      usedCount,
      newTotal: dto.totalRewardCount,
      newRemaining: newRemainingCount
    });

    try {
      // 리워드 제거 처리
      if (dto.removeReward === true) {
        // 1. musics.grade 업데이트
        await this.db
          .update(musics)
          .set({ grade: dto.grade || 0 })
          .where(eq(musics.id, musicId));

        // 2. monthly_music_rewards 업데이트 (0으로 설정)
        const existingRecord = await this.db
          .select()
          .from(monthly_music_rewards)
          .where(and(
            eq(monthly_music_rewards.music_id, musicId),
            eq(monthly_music_rewards.year_month, ym)
          ))
          .limit(1);

        if (existingRecord.length > 0) {
          await this.db
            .update(monthly_music_rewards)
            .set({
              total_reward_count: 0,
              remaining_reward_count: 0,
              reward_per_play: '0',
              updated_at: new Date(),
            })
            .where(and(
              eq(monthly_music_rewards.music_id, musicId),
              eq(monthly_music_rewards.year_month, ym)
            ));
        } else {
          await this.db
            .insert(monthly_music_rewards)
            .values({
              music_id: musicId,
              year_month: ym,
              total_reward_count: 0,
              remaining_reward_count: 0,
              reward_per_play: '0',
            });
        }
      } else {
        // 기존 리워드 추가/수정 로직
        // 1. musics.grade를 1로 업데이트 (리워드 있음)
        await this.db
          .update(musics)
          .set({ grade: 1 })
          .where(eq(musics.id, musicId));

        // 2. monthly_music_rewards 업데이트
        const existingRecord = await this.db
          .select()
          .from(monthly_music_rewards)
          .where(and(
            eq(monthly_music_rewards.music_id, musicId),
            eq(monthly_music_rewards.year_month, ym)
          ))
          .limit(1);

        if (existingRecord.length > 0) {
          await this.db
            .update(monthly_music_rewards)
            .set({
              total_reward_count: dto.totalRewardCount,
              remaining_reward_count: newRemainingCount,
              reward_per_play: dto.rewardPerPlay.toString(),
              updated_at: new Date(),
            })
            .where(and(
              eq(monthly_music_rewards.music_id, musicId),
              eq(monthly_music_rewards.year_month, ym)
            ));
        } else {
          await this.db
            .insert(monthly_music_rewards)
            .values({
              music_id: musicId,
              year_month: ym,
              total_reward_count: dto.totalRewardCount,
              remaining_reward_count: newRemainingCount,
              reward_per_play: dto.rewardPerPlay.toString(),
            });
        }
      }
    } catch (error) {
      console.error('리워드 업데이트 실패:', error);
      throw error;
    }
    return { message: '현재 달 리워드가 업데이트되었습니다.', musicId, yearMonth: ym };
  }


}