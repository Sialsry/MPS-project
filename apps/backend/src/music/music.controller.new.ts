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
import { ApiKeyService } from './api-key.service';

@Controller('music')
export class MusicController {
    constructor(
        private readonly musicService: MusicService,
        private readonly apiKeyService: ApiKeyService,
    ) { }

    @Get(':music_id/play')
    async playMusic(
        @Param('music_id', ParseIntPipe) musicId: number,
        @Headers('x-api-key') headerApiKey: string,
        @Headers('user-agent') userAgent: string,
        @Headers('range') range: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        try {
            const apiKey = headerApiKey;
            const company = await this.apiKeyService.validateApiKey(apiKey);
            if (!company) throw new HttpException('유효하지 않은 API 키입니다.', HttpStatus.UNAUTHORIZED);

            const music = await this.musicService.findById(musicId);
            if (!music) throw new HttpException('음원을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);

            const filePath = join(process.cwd(), './storage', music.file_path);

        } catch (error) {

        }
    }

}