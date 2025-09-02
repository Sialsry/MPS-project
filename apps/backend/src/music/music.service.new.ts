import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, count, sql } from 'drizzle-orm';
import { companies, musics, music_plays, company_subscriptions, monthly_music_rewards } from '../db/schema';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class MusicService {
    constructor(
        @Inject('DB') private db: NodePgDatabase<any>,
    ) { }

    async findById(musicId: number) {
        const result = await this.db
            .select()
            .from(musics)
            .where(eq(musics.id, musicId));

        return result[0] || null;
    }

    async findActiveSession(musicId: number, companyId: number) {

    }
}