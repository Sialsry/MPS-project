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
        const tenMinutesAgo = new DataTransfer()
    }

    async startPlaySession(sessionData: {
        musicId: number;
        companyId: number;
        useCase: '0' | '1' | '2';
        rewardCode: '0' | '1' | '2' | '3';
        rewardAmount: number;
        usePrice: number;
    }) {
        const playRecord = await this.db
            .insert(music_plays)
            .values({
                music_id: Number(sessionData.musicId),
                using_company_id: Number(sessionData.companyId),
                reward_code: sessionData.rewardCode,
                use_case: sessionData.useCase,
                is_valid_play: false,
                reward_amount: sessionData.rewardAmount.toString(),
                use_price: sessionData.usePrice.toString(),
            })
            .returning();

        return playRecord[0];
    }

    async markAsValidPlay() { }
}