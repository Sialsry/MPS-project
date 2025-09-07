import type { Response } from 'express';
import { MusicService } from './music.service';
import { ApiKeyService } from './api-key.service';
export declare class MusicController {
    private readonly musicService;
    private readonly apiKeyService;
    constructor(musicService: MusicService, apiKeyService: ApiKeyService);
    playMusic(musicId: number, headerApiKey: string, userAgent: string, range: string, response: Response): Promise<void>;
}
