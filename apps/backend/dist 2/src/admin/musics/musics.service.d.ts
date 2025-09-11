import { OnModuleInit } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import type { DB } from '../../db/client';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { MusicRewardsSummaryQueryDto, MusicRewardsSummaryResponseDto } from './dto/music-rewards-summary.dto';
import { MusicRewardsTrendQueryDto, MusicRewardsTrendResponseDto } from './dto/music-rewards-trend.dto';
import { MusicMonthlyRewardsQueryDto, MusicMonthlyRewardsResponseDto } from './dto/music-monthly-rewards.dto';
import { MusicTotalStatsQueryDto, MusicTotalStatsResponseDto } from './dto/music-stats.dto';
import { PlaysValidStatsQueryDto, PlaysValidStatsResponseDto } from './dto/plays-valid-stats.dto';
import { RevenueForecastQueryDto, RevenueForecastResponseDto } from './dto/revenue-forecast.dto';
import { RewardsFilledStatsQueryDto, RewardsFilledStatsResponseDto } from './dto/rewards-filled-stats.dto';
import { CategoryTop5QueryDto, CategoryTop5ResponseDto } from './dto/category-top5.dto';
import { RealtimeApiStatusQueryDto, RealtimeApiStatusResponseDto, RealtimeTopTracksQueryDto, RealtimeTopTracksResponseDto, RealtimeTransactionsQueryDto, RealtimeTransactionsResponseDto } from './dto/realtime.dto';
export declare class MusicsService implements OnModuleInit {
    private readonly db;
    constructor(db: DB);
    onModuleInit(): Promise<void>;
    private ensureStorageDirs;
    getCategories(): Promise<{
        categories: {
            id: number;
            name: string;
        }[];
    }>;
    findAll(findMusicsDto: any): Promise<{
        musics: any[];
        page: number;
        limit: number;
    }>;
    getRewardsSummary(query: MusicRewardsSummaryQueryDto): Promise<MusicRewardsSummaryResponseDto>;
    getMonthlyRewards(musicId: number, query: MusicMonthlyRewardsQueryDto): Promise<MusicMonthlyRewardsResponseDto>;
    create(createMusicDto: CreateMusicDto): Promise<{
        message: string;
        music: {
            id: number;
            title: string;
            artist: string;
            category: string;
            musicType: "일반" | "Inst";
            durationSec: number;
            priceMusicOnly: number;
            priceLyricsOnly: number;
            rewardPerPlay: number;
            maxPlayCount: number | undefined;
            grade: 0 | 1 | 2;
            audioFilePath: string;
        };
        id: number;
    }>;
    createCategory(dto: {
        name: string;
        description?: string;
    }): Promise<{
        id: number;
        name: string;
    }>;
    findOne(id: number): Promise<{
        id: any;
        title: any;
        artist: any;
        category: any;
        musicType: string;
        tags: any;
        normalizedTags: any;
        releaseDate: any;
        durationSec: any;
        isrc: any;
        lyricist: any;
        composer: any;
        arranger: any;
        coverImageUrl: any;
        audioFilePath: any;
        createdAt: any;
        lyricsText: any;
        lyricsFilePath: any;
        priceMusicOnly: number | undefined;
        priceLyricsOnly: number | undefined;
        rewardPerPlay: number | undefined;
        maxPlayCount: number | undefined;
        maxRewardLimit: number;
        grade: any;
    }>;
    getLyricsFileInfo(musicId: number): Promise<{
        hasText: boolean;
        text?: string;
        hasFile: boolean;
        absPath?: string;
        filename?: string;
    }>;
    getRewardsTrend(musicId: number, query: MusicRewardsTrendQueryDto): Promise<MusicRewardsTrendResponseDto>;
    getCompanyUsage(musicId: number, query: any): Promise<{
        yearMonth: string;
        total: number;
        page: number;
        limit: number;
        items: any;
    }>;
    getTotalCount(query: MusicTotalStatsQueryDto): Promise<MusicTotalStatsResponseDto>;
    getValidPlaysStats(query: PlaysValidStatsQueryDto): Promise<PlaysValidStatsResponseDto>;
    getRevenueForecast(query: RevenueForecastQueryDto): Promise<RevenueForecastResponseDto>;
    getRewardsFilledStats(query: RewardsFilledStatsQueryDto): Promise<RewardsFilledStatsResponseDto>;
    getCategoryTop5(query: CategoryTop5QueryDto): Promise<CategoryTop5ResponseDto>;
    getRealtimeApiStatus(query: RealtimeApiStatusQueryDto): Promise<RealtimeApiStatusResponseDto>;
    getRealtimeApiCalls(query: RealtimeApiStatusQueryDto): Promise<RealtimeApiStatusResponseDto>;
    getRealtimeTopTracks(query: RealtimeTopTracksQueryDto): Promise<RealtimeTopTracksResponseDto>;
    getRealtimeTransactions(query: RealtimeTransactionsQueryDto): Promise<RealtimeTransactionsResponseDto>;
    private sanitizeFilename;
    saveUploadedFiles(files: {
        audio?: Express.Multer.File[];
        lyrics?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<{
        audioFilePath: string | undefined;
        lyricsFilePath: string | undefined;
        coverImagePath: string | undefined;
    }>;
    getCoverFile(id: number): Promise<{
        absPath?: string;
        filename?: string;
        contentType?: string;
        url?: string;
        isUrl: boolean;
    }>;
    update(id: number, updateMusicDto: UpdateMusicDto): Promise<{
        message: string;
        id: number;
    }>;
    private cleanupOrphanCategories;
    delete(ids: number[]): Promise<{
        message: string;
        deletedIds: number[];
        summary: {
            total: number;
            success: number;
            failed: number;
        };
    }>;
    updateNextMonthRewards(musicId: number, dto: UpdateRewardDto): Promise<{
        message: string;
        musicId: number;
        yearMonth: string;
    }>;
}
