import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Headers,
    Res,
    HttpException,
    HttpStatus,
    StreamableFile,
    Query
} from '@nestjs/common';
import type { Response } from 'express';
import { MusicService } from './music.service';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

@Controller('music')
export class MusicController {
    constructor(
        private readonly musicService: MusicService,
    ) { }

    @Get(':music_id/play')
    async playMusic(
        @Param('music_id', ParseIntPipe) musicId: number,
        @Headers('x-api-key') headerApiKey: string,
        @Query('api_key') queryApiKey: string,
        @Headers('user-agent') userAgent: string,
        @Headers('range') range: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        try {
            // 1. API 키 검증 (헤더 또는 쿼리 파라미터에서)
            const apiKey = headerApiKey || queryApiKey;
            const company = await this.musicService.validateApiKey(apiKey);
            if (!company) {
                throw new HttpException('유효하지 않은 API 키입니다.', HttpStatus.UNAUTHORIZED);
            }

            // 2. 음원 정보 조회
            const music = await this.musicService.findById(musicId);
            if (!music) {
                throw new HttpException('음원을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
            }

            // 3. 파일 경로 확인
            const filePath = join(process.cwd(), './storage/', music.file_path);

            try {
                const stats = statSync(filePath);
                const fileSize = stats.size;

                // 4. 첫 번째 요청에서만 새 세션 생성 (is_valid_play=false로 시작)
                let playSession = await this.musicService.findActiveSession(music.id, company.id);

                if (!playSession) {
                    const useCase: '0' | '1' = music.inst ? '1' : '0';
                    playSession = await this.musicService.startPlaySession({
                        musicId: music.id,
                        companyId: company.id,
                        userAgent: userAgent || 'unknown',
                        startTime: new Date(),
                        useCase,
                    });
                    console.log(`🎬 새 재생 세션 시작: ${playSession.id} (is_valid_play=false)`);
                }

                // 5. Range 요청 처리 및 유효재생 체크
                if (range) {
                    return this.handleRangeRequest(playSession, filePath, fileSize, range, response);
                } else {
                    return this.handleInitialRequest(playSession, filePath, fileSize, response);
                }

            } catch (fileError) {
                console.error('❌ 음원 파일 접근 오류:', fileError);
                console.log('🔍 시도한 경로:', filePath);
                throw new HttpException('음원 파일을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
            }

        } catch (error) {
            console.error('음원 재생 에러:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                '음원 재생 중 오류가 발생했습니다.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async handleInitialRequest(
        playSession: any,
        filePath: string,
        fileSize: number,
        response: Response,
    ): Promise<StreamableFile> {
        console.log(`📡 초기 요청 처리 - 세션 ${playSession.id}`);

        // 응답 헤더 설정
        response.setHeader('Content-Type', 'audio/mpeg');
        response.setHeader('Content-Length', fileSize);
        response.setHeader('Accept-Ranges', 'bytes');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('X-Session-ID', playSession.id.toString());

        // 전체 파일 스트림 반환
        const stream = createReadStream(filePath);
        return new StreamableFile(stream);
    }

    private async handleRangeRequest(
        playSession: any,
        filePath: string,
        fileSize: number,
        range: string,
        response: Response,
    ): Promise<StreamableFile> {
        // Range 헤더 파싱 (예: "bytes=0-1023" 또는 "bytes=1024-")
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        console.log(`📡 Range 요청: ${start}-${end} (${chunkSize} bytes) - 세션 ${playSession.id}`);

        // 재생 진행도 계산 (전송된 마지막 바이트 기준)
        const progressPercent = Math.round((end / fileSize) * 100);
        console.log(`🎯 현재 진행도: ${progressPercent}%`);

        // 50% 이상 전송 시 유효재생으로 업데이트
        if (progressPercent >= 50) {
            await this.musicService.markAsValidPlay(playSession.id);
            console.log(`✅ 유효재생 처리: 세션 ${playSession.id} (${progressPercent}%)`);
        }

        // Range 응답 헤더 설정
        response.status(206); // Partial Content
        response.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        response.setHeader('Accept-Ranges', 'bytes');
        response.setHeader('Content-Length', chunkSize);
        response.setHeader('Content-Type', 'audio/mpeg');
        response.setHeader('X-Session-ID', playSession.id.toString());
        response.setHeader('X-Progress', progressPercent.toString());

        console.log(`🎵 음원 스트림 전송: ${chunkSize} bytes (${progressPercent}%)`);

        // 요청된 범위의 파일 스트림 생성
        const stream = createReadStream(filePath, { start, end });
        return new StreamableFile(stream);
    }
}
