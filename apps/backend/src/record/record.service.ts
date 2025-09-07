import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lt, count, sql, desc } from 'drizzle-orm';
import { companies, musics, music_plays, company_subscriptions, monthly_music_rewards, rewards } from '../db/schema';

@Injectable()
export class RecordService {
    constructor(
        @Inject('DB') private db: NodePgDatabase<any>,
    ) { }

    private async getSmartAccount(companyId) {
        return await this.db
            .select({ smartAccount: companies.smart_account_address })
            .from(companies)
            .where(eq(companies.id, companyId));
    }

    // 하루 동안 기록된 음원 사용내역 조회. status가 pending인 기록만 조회함 
    async getDailyUsage() {
        const date = new Date();

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await this.db
            .select({
                smartAccountAddress: companies.smart_account_address,
                musicId: rewards.music_id,
                playId: rewards.play_id,
                rewardCode: rewards.reward_code,
                usedAt: rewards.created_at,
            })
            .from(rewards)
            .leftJoin(companies, eq(rewards.company_id, companies.id))
            .where(
                and(
                    gte(rewards.created_at, startOfDay),
                    lt(rewards.created_at, endOfDay),
                    eq(rewards.status, 'pending')
                )
            )

        return result;
    }




    // 특정 상태의 하루 동안 기록된 음원 사용내역 조회
    async getDailyUsageByStatus(status: 'pending' | 'successed' | 'falied', targetDate?: Date) {
        const date = targetDate || new Date();

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await this.db
            .select({
                companyId: rewards.company_id,
                musicId: rewards.music_id,
                playId: rewards.play_id,
                rewardCode: rewards.reward_code,
                usedAt: rewards.created_at,
                status: rewards.status,
                amount: rewards.amount,
                smartAccountAddress: companies.smart_account_address
            })
            .from(rewards)
            .leftJoin(companies, eq(rewards.company_id, companies.id))
            .where(
                and(
                    gte(rewards.created_at, startOfDay),
                    lt(rewards.created_at, endOfDay),
                    eq(rewards.status, status as any)
                )
            )
            .orderBy(desc(rewards.created_at));
        console.log(result, "getDailyUsageByStatus로 조회한 하루치 유효재생")
        return result;
    }

    // 리워드 상태 업데이트 (블록체인 전송 후)
    async updateRewardStatus(playId: number, txHash: string, status: 'successed' | 'falied') {
        try {
            const updateData: any = {
                status: status,
                updated_at: new Date()
            };

            if (txHash) {
                updateData.payout_tx_hash = txHash;
                updateData.blockchain_recorded_at = new Date();
            }

            await this.db
                .update(rewards)
                .set(updateData)
                .where(eq(rewards.play_id, playId));

            console.log(`리워드 상태 업데이트 완료: Play ID ${playId}, Status: ${status}`);
        } catch (error) {
            console.error('리워드 상태 업데이트 실패:', error);
            throw error;
        }
    }

    // 일일 리워드 집계 (회사별)
    async getDailyRewardAggregation(targetDate?: Date) {
        const date = targetDate || new Date();

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await this.db
            .select({
                companyId: rewards.company_id,
                smartAccountAddress: companies.smart_account_address,
                totalRewardAmount: sql<number>`SUM(${rewards.amount})`.as('totalRewardAmount'),
                rewardCount: count(rewards.id).as('rewardCount')
            })
            .from(rewards)
            .leftJoin(companies, eq(rewards.company_id, companies.id))
            .where(
                and(
                    gte(rewards.created_at, startOfDay),
                    lt(rewards.created_at, endOfDay),
                    eq(rewards.reward_code, "1"), // reward_code가 1인 경우만
                    eq(rewards.status, 'pending')
                )
            )
            .groupBy(rewards.company_id, companies.smart_account_address)
            .having(sql`SUM(${rewards.amount}) > 0`);

        console.log(result, "하루치 리워드 집계 결과")
        return result;
    }

    // 리워드 배치 상태 업데이트
    async updateRewardBatchStatus(playIds: number[], txHash: string, status: 'successed' | 'falied') {
        try {
            const updateData: any = {
                status: status,
                updated_at: new Date()
            };

            if (txHash) {
                updateData.payout_tx_hash = txHash;
                updateData.blockchain_recorded_at = new Date();
            }

            for (const playId of playIds) {
                await this.db
                    .update(rewards)
                    .set(updateData)
                    .where(eq(rewards.play_id, playId));
            }

            console.log(`리워드 배치 상태 업데이트 완료: ${playIds.length}개 기록, Status: ${status}`);
        } catch (error) {
            console.error('리워드 배치 상태 업데이트 실패:', error);
            throw error;
        }
    }

    // 특정 회사의 pending 리워드 조회
    async getCompanyPendingRewards(companyId: number, targetDate?: Date) {
        const date = targetDate || new Date();

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await this.db
            .select({
                playId: rewards.play_id,
                musicId: rewards.music_id,
                rewardCode: rewards.reward_code,
                amount: rewards.amount,
                usedAt: rewards.created_at
            })
            .from(rewards)
            .where(
                and(
                    eq(rewards.company_id, companyId),
                    gte(rewards.created_at, startOfDay),
                    lt(rewards.created_at, endOfDay),
                    eq(rewards.reward_code, "1"), // reward_code가 1인 경우만
                    eq(rewards.status, 'pending')
                )
            )
            .orderBy(desc(rewards.created_at));

        return result;
    }
}