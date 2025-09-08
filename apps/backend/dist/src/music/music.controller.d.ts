import { StreamableFile } from '@nestjs/common';
import type { Response, Request } from 'express';
import { MusicService } from './music.service';
export declare class MusicController {
    private readonly musicService;
    constructor(musicService: MusicService);
    private SIGN_KEY;
    private DEFAULT_CHUNK;
    private sign;
    private toWire;
    private fromWire;
    private issueToken;
    private getCookie;
    playMusic(musicId: number, headerApiKey: string, range: string, playTokenHeader: string, playTokenQuery: string, apiKeyQuery: string, req: Request, res: Response): Promise<StreamableFile>;
    private handleRangeRequestStateless;
}
