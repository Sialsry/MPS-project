import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { MusicService } from './music.service';
export declare class LyricController {
    private readonly musicService;
    constructor(musicService: MusicService);
    downloadLyric(musicId: number, apiKey: string, userAgent: string, response: Response): Promise<StreamableFile>;
}
