import {
    Controller, Get, Param, ParseIntPipe, Headers, Res, HttpException, HttpStatus,
    StreamableFile, Query, Req
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { MusicService } from './music.service';

type PlayToken = {
    v: 1;
    musicId: number;
    companyId: number;
    startedAt: number; // epoch ms
};

@Controller('music')
export class MusicController {
    constructor(private readonly musicService: MusicService) { }
    private SIGN_KEY = process.env.PLAY_TOKEN_SECRET || 'dev-secret-change-me';
    private DEFAULT_CHUNK = 1024 * 1024; // 1MB

    // --- util: token ---
    private sign(data: string) {
        return crypto.createHmac('sha256', this.SIGN_KEY).update(data).digest('hex');
    }
    private toWire(t: PlayToken) {
        const payload = JSON.stringify(t);
        const sig = this.sign(payload);
        return Buffer.from(payload).toString('base64url') + '.' + sig;
    }
    private fromWire(raw?: string | null): PlayToken | null {
        if (!raw) return null;
        const [b64, sig] = String(raw).split('.');
        if (!b64 || !sig) return null;
        try {
            const json = Buffer.from(b64, 'base64url').toString('utf8');
            if (this.sign(json) !== sig) return null;
            const obj = JSON.parse(json) as PlayToken;
            if (obj?.v !== 1) return null;
            return obj;
        } catch {
            return null;
        }
    }
    private issueToken(musicId: number, companyId: number): string {
        const token: PlayToken = { v: 1, musicId, companyId, startedAt: Date.now() };
        return this.toWire(token);
    }
    private getCookie(req: Request, name: string): string | null {
        const h = req.headers['cookie'];
        if (!h) return null;
        const m = h.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
        return m ? decodeURIComponent(m.split('=')[1]) : null;
    }

    @Get(':music_id/play')
    async playMusic(
        @Param('music_id', ParseIntPipe) musicId: number,
        @Headers('x-api-key') headerApiKey: string,
        @Headers('range') range: string,
        @Headers('x-play-token') playTokenHeader: string,
        @Query('pt') playTokenQuery: string,
        @Query('api_key') apiKeyQuery: string,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            // 1) 인증 처리: 우선순위 x-api-key 헤더 > Authorization(미구현) > api_key 쿼리 > playToken
            let company = null as any;
            let apiKey = headerApiKey || apiKeyQuery;

            if (apiKey) {
                company = await this.musicService.validateApiKey(apiKey);
            }

            // 토큰 문자열 (아래에서 재사용)
            let tokenStr = playTokenHeader || playTokenQuery || this.getCookie(req, 'pt') || '';
            let token = this.fromWire(tokenStr);

            if (!company && token) {
                // API 키는 없지만 토큰이 있으므로 회사 조회 시도
                company = await this.musicService.findCompanyById(token.companyId);
            }

            if (!company) {
                throw new HttpException('API 키가 필요합니다.', HttpStatus.UNAUTHORIZED);
            }

            // 2) 음원/권한
            const music = await this.musicService.findById(musicId);
            if (!music) throw new HttpException('음원을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
            const ok = await this.musicService.checkPlayPermission(company, music);
            if (!ok) throw new HttpException('재생 권한이 없습니다.', HttpStatus.FORBIDDEN);

            // 기존 활성 세션(10분 내, 아직 유효재생 아님) 재사용 → 중복 insert 방지
            let activeSession = await this.musicService.findActiveSession(music.id, company.id);
            let musicPlayId: number;
            let rewardInfo: any;
            let rewardAmount: any;
            if (activeSession) {
                musicPlayId = activeSession.id;
                rewardInfo = activeSession.reward_code;
                rewardAmount = activeSession.reward_amount ?? 0;
            } else {
                rewardInfo = await this.musicService.getRewardCode(musicId, company.id)
                const rewardRow = await this.musicService.findRewardById(musicId);
                rewardAmount = rewardRow ? rewardRow.reward_per_play : 0;
                const startPlay = await this.musicService.startPlay({
                    musicId: music.id,
                    companyId: company.id,
                    useCase: music.inst ? "1" : "0",
                    rewardCode: rewardInfo,
                    rewardAmount: String(rewardAmount),
                    usePrice: music.price_per_play,
                });
                musicPlayId = startPlay.id;
                await this.musicService.updateInitMusicStats(music.id)
            }
            // 3) 파일
            const filePath = join(process.cwd(), '/uploads/music/', music.file_path);
            const fileSize = statSync(filePath).size;

            // 4) 토큰 획득(쿠키/쿼리/헤더) → 없거나 music/company 불일치 시 재발급
            // (위에서 tokenStr, token 이미 생성)
            if (!token || token.musicId !== music.id || token.companyId !== company.id) {
                tokenStr = this.issueToken(music.id, company.id);
                token = this.fromWire(tokenStr)!;
                // 헤더 + 쿠키 동시 세팅 (오디오 엘리먼트는 쿠키 자동 첨부)
                res.setHeader('X-Play-Token', tokenStr);
                res.setHeader(
                    'Set-Cookie',
                    `pt=${encodeURIComponent(tokenStr)}; Path=/; HttpOnly; SameSite=Lax`
                );
            }

            // 5) Range 없으면 1MB로 합성 → 206 Partial 강제
            if (!range || !range.startsWith('bytes=')) {
                const syntheticEnd = Math.min(fileSize - 1, this.DEFAULT_CHUNK - 1);
                range = `bytes=0-${syntheticEnd}`;
            }

            const musicDataResult = await this.handleRangeRequestStateless({
                tokenStr, token, music, companyId: company.id,
                filePath, fileSize, range, res, musicPlayId, rewardInfo, rewardAmount
            });

            // let endPlay = await this.musicService.getStartPlay(musicPlayId)
            //await this.musicService.updateMusicStats(musicId, endPlay.is_valid_play ?? false)

            return musicDataResult;

        } catch (e) {
            console.error('음원 재생 에러:', e);
            if (e instanceof HttpException) throw e;
            throw new HttpException('음원 재생 중 오류', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 실제 Range 처리 (세션 X, 시간기반 유효재생) ---
    private async handleRangeRequestStateless(opts: {
        tokenStr: string;
        token: PlayToken;
        music: any;
        companyId: number;
        filePath: string;
        fileSize: number;
        range: string;
        res: Response;
        musicPlayId;
        rewardInfo;
        rewardAmount;
    }): Promise<StreamableFile> {
        const { tokenStr, token, music, companyId, filePath, fileSize, range, res, musicPlayId, rewardInfo, rewardAmount } = opts;

        // Range 파싱/보정
        const parts = range.replace('bytes=', '').split('-');
        let start = parseInt(parts[0] || '0', 10);
        let reqEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        if (!Number.isFinite(start) || start < 0) start = 0;
        if (!Number.isFinite(reqEnd) || reqEnd >= fileSize) reqEnd = fileSize - 1;
        console.log(fileSize);
        // ✅ 서버가 강제로 청크 제한(256KB) — 브라우저가 여러 번 Range를 요청하도록 유도
        let imposedEnd
        if (start < (fileSize / 3)) {
            imposedEnd = Math.min(start + (256 * 1024) - 1, reqEnd, fileSize - 1);
        } else {
            // 재생 시간 기반 선형 보간 계산
            const currentTime = Date.now();
            const elapsedTime = currentTime - new Date(token.startedAt).getTime();
            const musicDurationMs = music.duration * 1000; // duration이 초 단위라고 가정
            const halfDuration = musicDurationMs / 2;

            // 안전한 계산을 위한 검증
            if (musicDurationMs > 0 && halfDuration > 0) {
                // 재생 시간이 절반에 도달했을 때 파일 전송이 100%가 되도록 선형 보간
                const playbackProgress = Math.min(Math.max(elapsedTime / halfDuration, 0), 1.0);
                const targetBytePosition = Math.floor(fileSize * playbackProgress);

                // 현재 요청 위치가 목표 위치보다 앞서지 않도록 제한
                const maxAllowedEnd = Math.min(targetBytePosition, fileSize - 1);
                imposedEnd = Math.min(start + (1 * 1024) - 1, reqEnd, maxAllowedEnd);
            } else {
                // duration이 없거나 잘못된 경우 기본 동작
                imposedEnd = Math.min(start + (1 * 1024) - 1, reqEnd, fileSize - 1);
            }

            // NaN 방지를 위한 최종 검증
            if (!Number.isFinite(imposedEnd)) {
                imposedEnd = Math.min(start + (1 * 1024) - 1, reqEnd, fileSize - 1);
            }
        }
        let end = imposedEnd;
        if (end < start) end = start;
        const chunkSize = end - start + 1;
        // 진행도(바이트 기준은 참고 로그용)
        const progressPercentByBytes = Math.floor(((end + 1) / fileSize) * 100);
        // console.log(`📡 Range 요청: ${start}-${end} (${chunkSize} bytes)`);
        console.log(`🎯 진행도(바이트기준): ${progressPercentByBytes}%`);

        if (progressPercentByBytes == 100) {
            const normalizedRewardAmount = (rewardAmount == null || rewardAmount === '') ? 0 : rewardAmount;
            await this.musicService.recordValidPlayOnce({
                musicId: music.id,
                companyId,
                useCase: music.inst ? '1' : '0',
                rewardCode: rewardInfo,
                musicPlayId,
                rewardAmount: normalizedRewardAmount,
            });
        }

        // 206 Partial 응답
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
        res.setHeader('Content-Type', 'audio/mpeg');
        // 토큰을 계속 유지(쿠키는 자동, 헤더는 디버그/SDK용)
        res.setHeader('X-Play-Token', tokenStr);

        const stream = createReadStream(filePath, { start, end });
        return new StreamableFile(stream);
    }
}
