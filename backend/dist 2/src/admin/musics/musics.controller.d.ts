import { MusicsService } from './musics.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { DeleteMusicsDto } from './dto/delete-musics.dto';
import type { Response } from 'express';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { MusicRewardsSummaryQueryDto } from './dto/music-rewards-summary.dto';
import { MusicRewardsTrendQueryDto } from './dto/music-rewards-trend.dto';
import { MusicMonthlyRewardsQueryDto } from './dto/music-monthly-rewards.dto';
import { MusicCompanyUsageQueryDto } from './dto/music-company-usage.dto';
import { MusicTotalStatsQueryDto } from './dto/music-stats.dto';
import { PlaysValidStatsQueryDto } from './dto/plays-valid-stats.dto';
import { RevenueForecastQueryDto } from './dto/revenue-forecast.dto';
import { RewardsFilledStatsQueryDto } from './dto/rewards-filled-stats.dto';
import { CategoryTop5QueryDto } from './dto/category-top5.dto';
import { RealtimeApiStatusQueryDto, RealtimeTopTracksQueryDto, RealtimeTransactionsQueryDto } from './dto/realtime.dto';
export declare class MusicsController {
    private readonly musicsService;
    constructor(musicsService: MusicsService);
    findAll(findMusicsDto: any): Promise<{
        musics: any[];
        page: number;
        limit: number;
    }>;
    getCategories(): Promise<{
        categories: {
            id: number;
            name: string;
        }[];
    }>;
    getRewardsSummary(query: MusicRewardsSummaryQueryDto): Promise<import("./dto/music-rewards-summary.dto").MusicRewardsSummaryResponseDto>;
    getRewardsTrend(id: string, query: MusicRewardsTrendQueryDto): Promise<import("./dto/music-rewards-trend.dto").MusicRewardsTrendResponseDto>;
    getMonthlyRewards(id: string, query: MusicMonthlyRewardsQueryDto): Promise<import("./dto/music-monthly-rewards.dto").MusicMonthlyRewardsResponseDto>;
    getCompanyUsage(id: string, query: MusicCompanyUsageQueryDto): Promise<{
        yearMonth: string;
        total: number;
        page: number;
        limit: number;
        items: any;
    }>;
    getTotalStats(query: MusicTotalStatsQueryDto): Promise<import("./dto/music-stats.dto").MusicTotalStatsResponseDto>;
    getValidPlaysStats(query: PlaysValidStatsQueryDto): Promise<import("./dto/plays-valid-stats.dto").PlaysValidStatsResponseDto>;
    getRevenueForecast(query: RevenueForecastQueryDto): Promise<import("./dto/revenue-forecast.dto").RevenueForecastResponseDto>;
    getRewardsFilled(query: RewardsFilledStatsQueryDto): Promise<import("./dto/rewards-filled-stats.dto").RewardsFilledStatsResponseDto>;
    getCategoryTop5(query: CategoryTop5QueryDto): Promise<import("./dto/category-top5.dto").CategoryTop5ResponseDto>;
    getRealtimeApiStatus(query: RealtimeApiStatusQueryDto): Promise<import("./dto/realtime.dto").RealtimeApiStatusResponseDto>;
    getRealtimeApiCalls(query: RealtimeApiStatusQueryDto): Promise<import("./dto/realtime.dto").RealtimeApiStatusResponseDto>;
    getRealtimeTopTracks(query: RealtimeTopTracksQueryDto): Promise<import("./dto/realtime.dto").RealtimeTopTracksResponseDto>;
    getRealtimeTransactions(query: RealtimeTransactionsQueryDto): Promise<import("./dto/realtime.dto").RealtimeTransactionsResponseDto>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: number;
        name: string;
    }>;
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
    upload(files: {
        audio?: Express.Multer.File[];
        lyrics?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<{
        audioFilePath: string | undefined;
        lyricsFilePath: string | undefined;
        coverImagePath: string | undefined;
    }>;
    findOne(id: string): Promise<{
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
    updateRewards(id: string, dto: UpdateRewardDto): Promise<{
        message: string;
        musicId: number;
        yearMonth: string;
    }>;
    getCover(id: string, res: Response): Promise<void | Response<any, Record<string, any>>>;
    getLyrics(id: string, mode: "inline" | "download" | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    update(id: string, updateMusicDto: UpdateMusicDto): Promise<{
        message: string;
        id: number;
    }>;
    delete(deleteDto: DeleteMusicsDto): Promise<{
        message: string;
        deletedIds: number[];
        summary: {
            total: number;
            success: number;
            failed: number;
        };
    }>;
}
