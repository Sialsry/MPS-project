import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, count, sql } from 'drizzle-orm';
import { companies, musics, music_plays, company_subscriptions, monthly_music_rewards, rewards } from '../db/schema';
import { ApiKeyService } from './api-key.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MusicService {
    constructor(
        @Inject('DB') private db: NodePgDatabase<any>,
        private readonly apiKeyService: ApiKeyService,
    ) { }

    async validateApiKey(apiKey: string) {
        if (!apiKey) {
            throw new HttpException('API 키가 필요합니다.', HttpStatus.UNAUTHORIZED);
        }

        const company = await this.apiKeyService.validateApiKey(apiKey);
        return company;
    }

    async findById(musicId: number) {
        const result = await this.db
            .select()
            .from(musics)
            .where(eq(musics.id, musicId));

        return result[0] || null;
    }

    async findRewardById(musicId: number) {
        const result = await this.db
            .select()
            .from(monthly_music_rewards)
            .where(eq(monthly_music_rewards.music_id, musicId));

        return result[0] || null;
    }

    async companyCounted(companyId) {
        await this.db
            .update(companies)
            .set({ remaining_reward_count: sql`${companies.remaining_reward_count} - 1` })
            .where(eq(companies.id, companyId))
    }

    // async getRewardCode()

    // async checkCompanyLimit(apiKey: string) {
    //     const result = await this.db
    //         .select(remaining_reward_count)
    //         .from(companies)
    //         .where(eq(companies.api_key_hash, apiKey));

    //     return result[0] || null;
    // }

    async checkPlayPermission(company: any, music: any): Promise<boolean> {
        // 1. 음원 등급 확인
        if (music.grade > this.getGradeLevel(company.grade)) {
            return false;
        }

        // 2. 구독 상태 확인 (Standard, Business 등급의 경우)
        if (company.grade !== 'free') {
            const activeSubscription = await this.db
                .select()
                .from(company_subscriptions)
                .where(
                    and(
                        eq(company_subscriptions.company_id, company.id),
                        gte(company_subscriptions.end_date, new Date())
                    )
                );

            if (activeSubscription.length === 0) {
                return false;
            }
        }

        return true;
    }

    async checkLyricPermission(company: any, music: any): Promise<boolean> {
        // 가사 다운로드는 기본적으로 음원 재생 권한과 동일
        return this.checkPlayPermission(company, music);
    }

    // async startPlaySession(sessionData: {
    //     musicId: number;
    //     companyId: number;
    //     startTime: Date;
    //     useCase: '0' | '1' | '2';
    // }) {
    //     const playRecord = await this.db
    //         .insert(music_plays)
    //         .values({
    //             music_id: sessionData.musicId,
    //             using_company_id: sessionData.companyId,
    //             played_at: sessionData.startTime,
    //             reward_code: '0',
    //             use_case: sessionData.useCase,
    //             is_valid_play: false,
    //             play_duration_sec: 0,
    //         })
    //         .returning();

    //     return playRecord[0];
    // }

    async startPlay(sessionData: {
        musicId: number;
        companyId: number;
        useCase;
        rewardCode;
        rewardAmount: string;
        usePrice;
    }) {
        const playRecord = await this.db
            .insert(music_plays)
            .values({
                music_id: Number(sessionData.musicId),
                using_company_id: Number(sessionData.companyId),
                reward_code: sessionData.rewardCode,
                use_case: sessionData.useCase,
                is_valid_play: false,
                reward_amount: sessionData.rewardAmount,
                use_price: sessionData.usePrice,
            })
            .returning();

        return playRecord[0];
    }

    // async endPlaySession(playSessionId: number, endData: {
    //     playDuration: number;
    //     isValidPlay: boolean;
    //     endTime: Date;
    //     errorMessage?: string;
    // }) {
    //     try {
    //         // 재생 기록 업데이트
    //         await this.db
    //             .update(music_plays)
    //             .set({
    //                 play_duration_sec: endData.playDuration,
    //                 is_valid_play: endData.isValidPlay,
    //                 updated_at: endData.endTime,
    //             })
    //             .where(eq(music_plays.id, playSessionId));

    //         // 유효 재생인 경우 추가 처리
    //         if (endData.isValidPlay) {
    //             const playRecord = await this.db
    //                 .select()
    //                 .from(music_plays)
    //                 .where(eq(music_plays.id, playSessionId));

    //             if (playRecord.length > 0) {
    //                 const record = playRecord[0];

    //                 // 음원 통계 업데이트
    //                 await this.updateMusicStats(record.music_id, true);

    //                 // 리워드 처리
    //                 await this.processReward(record);
    //             }
    //         } else {
    //             // 무효 재생도 전체 재생 횟수에는 포함
    //             const playRecord = await this.db
    //                 .select()
    //                 .from(music_plays)
    //                 .where(eq(music_plays.id, playSessionId));

    //             if (playRecord.length > 0) {
    //                 await this.updateMusicStats(playRecord[0].music_id, false);
    //             }
    //         }

    //         console.log(`재생 세션 종료: ${playSessionId}, 유효: ${endData.isValidPlay}, 재생시간: ${endData.playDuration}초`);
    //     } catch (error) {
    //         console.error('재생 세션 종료 처리 에러:', error);
    //     }
    // }

    async recordLyricDownload(downloadData: {
        musicId: number;
        companyId: number;
        userAgent: string;
        downloadTime: Date;
    }) {
        try {
            // 가사 다운로드 기록 및 리워드 처리
            const company = await this.db
                .select()
                .from(companies)
                .where(eq(companies.id, downloadData.companyId));

            if (company.length === 0) {
                throw new Error('회사 정보를 찾을 수 없습니다.');
            }

            // 리워드 처리 (Standard, Business 등급만)
            const rewardInfo = await this.checkAndProcessReward(
                downloadData.musicId,
                downloadData.companyId,
                company[0].grade
            );

            // 가사 다운로드 기록 (music_plays 테이블에만 기록)
            await this.db
                .insert(music_plays)
                .values({
                    music_id: downloadData.musicId,
                    using_company_id: downloadData.companyId,
                    played_at: downloadData.downloadTime,
                    reward_code: rewardInfo.rewardCode,
                    use_case: '2', // 가사만 이용
                    is_valid_play: true, // 가사 다운로드는 항상 유효
                    play_duration_sec: 0,
                    reward_amount: rewardInfo.rewardAmount.toString(),
                });

            // lyrics_download_count는 업데이트하지 않음 (플랫폼 내 조회용이므로)

            // 회사 총 리워드 업데이트 (리워드가 지급된 경우)
            // if (rewardInfo.rewardAmount > 0) {
            //     await this.db
            //         .update(companies)
            //         .set({
            //             total_rewards_earned: sql`${companies.total_rewards_earned} + ${rewardInfo.rewardAmount}`,
            //             updated_at: new Date(),
            //         })
            //         .where(eq(companies.id, downloadData.companyId));
            // }

            console.log(`가사 다운로드 기록: 음원 ${downloadData.musicId}, 회사 ${downloadData.companyId}, 리워드: ${rewardInfo.rewardAmount}`);
        } catch (error) {
            console.error('가사 다운로드 기록 에러:', error);
        }
    }

    /**
     * 플랫폼 내 가사 조회 기록 (lyrics_download_count 증가용)
     * 라이브러리 플랫폼 내에서 가사를 조회할 때 사용
     */
    // async recordInternalLyricView(musicId: number) {
    //     try {
    //         await this.db
    //             .update(musics)
    //             .set({
    //                 lyrics_download_count: sql`${musics.lyrics_download_count} + 1`,
    //                 updated_at: new Date(),
    //             })
    //             .where(eq(musics.id, musicId));

    //         console.log(`플랫폼 내 가사 조회: 음원 ${musicId}`);
    //     } catch (error) {
    //         console.error('플랫폼 내 가사 조회 기록 에러:', error);
    //     }
    // }

    /**
     * 외부 API를 통한 가사 다운로드 횟수 조회
     * music_plays 테이블에서 use_case = '2'인 기록 개수 반환
     */
    // async getExternalLyricDownloadCount(musicId: number): Promise<number> {
    //     try {
    //         const result = await this.db
    //             .select({ count: count() })
    //             .from(music_plays)
    //             .where(
    //                 and(
    //                     eq(music_plays.music_id, musicId),
    //                     eq(music_plays.use_case, '2')
    //                 )
    //             );

    //         return result[0]?.count || 0;
    //     } catch (error) {
    //         console.error('외부 가사 다운로드 횟수 조회 에러:', error);
    //         return 0;
    //     }
    // }

    // async updateMusicStats(musicId: number, isValidPlay: boolean) {
    //     if (isValidPlay) {
    //         await this.db
    //             .update(musics)
    //             .set({
    //                 total_valid_play_count: sql`${musics.total_valid_play_count} + 1`,
    //                 total_play_count: sql`${musics.total_play_count} + 1`,
    //                 total_revenue: sql`${musics.total_revenue} + ${musics.price_per_play}`,
    //                 last_played_at: new Date(),
    //                 updated_at: new Date(),
    //             })
    //             .where(eq(musics.id, musicId));
    //     } else {
    //         await this.db
    //             .update(musics)
    //             .set({
    //                 total_play_count: sql`${musics.total_play_count} + 1`,
    //                 total_revenue: sql`${musics.total_revenue} + ${musics.price_per_play}`,
    //                 updated_at: new Date(),
    //             })
    //             .where(eq(musics.id, musicId));
    //     }
    // }

    private async updateEndMusicStats(musicId) {
        await this.db
            .update(musics)
            .set({
                total_valid_play_count: sql`${musics.total_valid_play_count} + 1`,
                last_played_at: new Date(),
                updated_at: new Date(),
            })
            .where(eq(musics.id, musicId));
    }

    async updateInitMusicStats(musicId) {
        await this.db
            .update(musics)
            .set({
                total_play_count: sql`${musics.total_play_count} + 1`,
                total_revenue: sql`${musics.total_revenue} + ${musics.price_per_play}`,
                updated_at: new Date(),
            })
            .where(eq(musics.id, musicId));
    }



    private async processReward(playRecord: any) {
        try {
            // 회사 정보 조회
            const company = await this.db
                .select()
                .from(companies)
                .where(eq(companies.id, playRecord.using_company_id));

            if (company.length === 0) {
                return;
            }

            // 리워드 처리
            const rewardInfo = await this.checkAndProcessReward(
                playRecord.music_id,
                playRecord.using_company_id,
                company[0].grade
            );

            // 재생 기록에 리워드 정보 업데이트
            await this.db
                .update(music_plays)
                .set({
                    reward_amount: rewardInfo.rewardAmount.toString(),
                    reward_code: rewardInfo.rewardCode,
                })
                .where(eq(music_plays.id, playRecord.id));

            // 회사 총 리워드 업데이트 (리워드가 지급된 경우)
            if (rewardInfo.rewardAmount > 0) {
                await this.db
                    .update(companies)
                    .set({
                        total_rewards_earned: sql`${companies.total_rewards_earned} + ${rewardInfo.rewardAmount}`,
                        updated_at: new Date(),
                    })
                    .where(eq(companies.id, playRecord.using_company_id));

                console.log(`리워드 지급: ${rewardInfo.rewardAmount}원, 회사 ${playRecord.using_company_id}`);
            }
        } catch (error) {
            console.error('리워드 처리 에러:', error);
        }
    }

    /**
     * 리워드 지급 가능 여부 확인 및 처리
     */
    private async checkAndProcessReward(musicId: number, companyId: number, companyGrade: string): Promise<{
        rewardCode: '0' | '1' | '2' | '3';
        rewardAmount: number;
    }> {
        // Free 등급은 리워드 없음
        if (companyGrade === 'free') {
            return { rewardCode: '0', rewardAmount: 0 };
        }

        // 현재 년월 (YYYY-MM 형식)
        const currentYearMonth = new Date().toISOString().slice(0, 7);

        // 월별 음원 리워드 정보 조회
        const monthlyReward = await this.db
            .select()
            .from(monthly_music_rewards)
            .where(
                and(
                    eq(monthly_music_rewards.music_id, musicId),
                    eq(monthly_music_rewards.year_month, currentYearMonth)
                )
            );

        // 해당 음원에 대한 월별 리워드 설정이 없는 경우
        if (monthlyReward.length === 0) {
            return { rewardCode: '0', rewardAmount: 0 };
        }

        const reward = monthlyReward[0];

        // 음원의 리워드 잔량이 소진된 경우
        if (reward.remaining_reward_count <= 0) {
            return { rewardCode: '2', rewardAmount: 0 };
        }

        // 회사의 월간 리워드 수령 한도 확인 (Standard, Business 모두 5000회)
        const monthlyRewardLimit = 5000;
        const companyMonthlyRewardCount = await this.getCompanyMonthlyRewardCount(companyId);

        if (companyMonthlyRewardCount >= monthlyRewardLimit) {
            return { rewardCode: '3', rewardAmount: 0 };
        }

        // 리워드 지급 가능 - 잔량 차감
        await this.db
            .update(monthly_music_rewards)
            .set({
                remaining_reward_count: sql`${monthly_music_rewards.remaining_reward_count} - 1`,
                updated_at: new Date(),
            })
            .where(eq(monthly_music_rewards.id, reward.id));

        const rewardAmount = parseFloat(reward.reward_per_play.toString());
        return { rewardCode: '1', rewardAmount };
    }

    /**
     * 회사의 월간 리워드 수령 횟수 조회
     */
    private async getCompanyMonthlyRewardCount(companyId: number): Promise<number> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const result = await this.db
            .select({ count: count() })
            .from(music_plays)
            .where(
                and(
                    eq(music_plays.using_company_id, companyId),
                    gte(music_plays.played_at, startOfMonth),
                    eq(music_plays.reward_code, '1') // 리워드가 실제 지급된 경우만
                )
            );

        return result[0]?.count || 0;
    }

    private getGradeLevel(grade: string): number {
        const levels = {
            'free': 0,
            'standard': 1,
            'business': 2
        };
        return levels[grade] || 0;
    }

    /**
     * 활성 재생 세션 찾기 (최근 10분 이내의 세션)
     */
    async findActiveSession(musicId: number, companyId: number) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10분 전

        const result = await this.db
            .select()
            .from(music_plays)
            .where(
                and(
                    eq(music_plays.music_id, musicId),
                    eq(music_plays.using_company_id, companyId),
                    gte(music_plays.played_at, tenMinutesAgo), // 최근 10분 이내
                    eq(music_plays.is_valid_play, false) // 아직 유효 재생 처리되지 않은 세션
                )
            )
            .orderBy(sql`${music_plays.played_at} DESC`)
            .limit(1);

        return result[0] || null;
    }

    /**
     * 재생 진행도 업데이트 및 유효재생 체크 (데이터 전송량 기반)
     */
    async updatePlayProgress(sessionId: number, progressPercent: number, byteStart: number, byteEnd: number) {
        console.log(`📈 진행도 업데이트: 세션 ${sessionId}, ${progressPercent}%, bytes: ${byteStart}-${byteEnd}`);

        // 현재 세션의 총 전송량 업데이트
        await this.updateTotalTransferredBytes(sessionId, byteStart, byteEnd);

        // 유효재생 체크는 60% 이상에서만 실행 (더 엄격한 기준)
        if (progressPercent >= 60) {
            await this.checkAndMarkValidPlayByTransfer(sessionId, progressPercent);
        } else if (progressPercent >= 50) {
            // 50-59% 구간에서는 시간도 함께 고려
            await this.checkValidPlayWithTimeCondition(sessionId, progressPercent);
        }

        await this.db
            .update(music_plays)
            .set({
                updated_at: new Date(),
            })
            .where(eq(music_plays.id, sessionId));
    }

    /**
     * 시간 조건과 함께 유효재생 체크 (50-59% 구간)
     */
    private async checkValidPlayWithTimeCondition(sessionId: number, progressPercent: number) {
        const session = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        if (!session[0] || session[0].is_valid_play || !session[0].played_at) {
            return;
        }

        // 최소 30초 이상 경과한 경우에만 유효재생 처리
        const currentTime = new Date();
        const startTime = new Date(session[0].played_at);
        const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);

        console.log(`⏰ 시간+진행도 체크: 세션 ${sessionId}, ${progressPercent}%, ${elapsedSeconds}초 경과`);

        if (elapsedSeconds >= 30 && progressPercent >= 50) {
            await this.markAsValidPlayByTransfer(sessionId, progressPercent);
        }
    }

    /**
     * 총 전송된 바이트 수 추적 (메타데이터나 별도 필드 활용)
     */
    private async updateTotalTransferredBytes(sessionId: number, byteStart: number, byteEnd: number) {
        const transferredBytes = (byteEnd - byteStart) + 1;

        // 현재 세션 정보 조회
        const session = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        if (session[0]) {
            // play_duration_sec 필드를 임시로 총 전송량 저장용으로 활용
            // (실제 유효재생 처리 시에는 실제 재생 시간으로 업데이트)
            const currentTransferred = session[0].play_duration_sec || 0;
            const newTotalTransferred = currentTransferred + transferredBytes;

            await this.db
                .update(music_plays)
                .set({
                    play_duration_sec: newTotalTransferred, // 임시로 전송량 저장
                    updated_at: new Date(),
                })
                .where(eq(music_plays.id, sessionId));

            console.log(`� 세션 ${sessionId} 누적 전송량: ${newTotalTransferred} bytes`);
        }
    }

    /**
     * 데이터 전송량 기반 유효재생 체크
     */
    private async checkAndMarkValidPlayByTransfer(sessionId: number, progressPercent: number) {
        const session = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        if (!session[0] || session[0].is_valid_play) {
            return; // 세션이 없거나 이미 유효재생 처리됨
        }

        console.log(`🎯 데이터 전송 기반 유효재생 체크: 세션 ${sessionId}, 진행도 ${progressPercent}%`);

        // 50% 이상 전송 시 유효재생 처리
        if (progressPercent >= 50) {
            await this.markAsValidPlayByTransfer(sessionId, progressPercent);
        }
    }

    /**
     * 데이터 전송량 기반 유효재생 처리
     */
    private async markAsValidPlayByTransfer(sessionId: number, progressPercent: number) {
        const session = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        if (!session[0]) {
            console.error(`세션을 찾을 수 없습니다: ${sessionId}`);
            return;
        }

        // 이미 유효재생 처리된 경우 중복 처리 방지
        if (session[0].is_valid_play) {
            console.log(`⚠️ 이미 유효재생 처리된 세션: ${sessionId}`);
            return;
        }

        // 회사 등급 조회
        const company = await this.db
            .select()
            .from(companies)
            .where(eq(companies.id, session[0].using_company_id))
            .limit(1);

        const companyGrade = company[0]?.grade || 'free';

        const { rewardCode, rewardAmount } = await this.checkAndProcessReward(
            session[0].music_id,
            session[0].using_company_id,
            companyGrade
        );

        // 실제 재생 시간 계산 (세션 시작부터 현재까지)
        let actualPlayDuration = 60; // 기본값
        if (session[0].played_at) {
            const currentTime = new Date();
            const startTime = new Date(session[0].played_at);
            actualPlayDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
        }

        // 세션을 유효 재생으로 업데이트
        await this.db
            .update(music_plays)
            .set({
                is_valid_play: true,
                reward_code: rewardCode,
                reward_amount: rewardAmount.toString(),
                play_duration_sec: actualPlayDuration, // 실제 재생 시간으로 복원
                updated_at: new Date(),
            })
            .where(eq(music_plays.id, sessionId));

        // 음원 통계 업데이트
        //await this.updateMusicStats(session[0].music_id, true);

        // 회사 총 리워드 업데이트 (리워드가 지급된 경우)
        if (rewardAmount > 0) {
            await this.db
                .update(companies)
                .set({
                    total_rewards_earned: sql`${companies.total_rewards_earned} + ${rewardAmount}`,
                    updated_at: new Date(),
                })
                .where(eq(companies.id, session[0].using_company_id));
        }

        console.log(`🎉 데이터 전송량 기반 유효재생 처리 완료: 세션 ${sessionId}, 진행도 ${progressPercent}%, 실제 재생시간: ${actualPlayDuration}초, 리워드: ${rewardAmount}`);
    }

    /**
     * 간단한 유효재생 처리 (50% 이상 전송 시)
     */
    async markAsValidPlay(sessionId: number) {
        console.log(`✅ 유효재생 처리 시작: 세션 ${sessionId}`);

        // 이미 유효재생 처리된 세션인지 확인
        const session = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        if (!session[0]) {
            console.log(`❌ 세션을 찾을 수 없음: ${sessionId}`);
            return;
        }

        if (session[0].is_valid_play) {
            console.log(`⏭️ 이미 유효재생 처리됨: 세션 ${sessionId}`);
            return;
        }

        // 유효재생으로 업데이트
        await this.db
            .update(music_plays)
            .set({
                is_valid_play: true,
                updated_at: new Date(),
            })
            .where(eq(music_plays.id, sessionId));

        console.log(`✅ 유효재생 처리 완료: 세션 ${sessionId}`);

        // 리워드 지급 처리
        await this.processReward(sessionId);
    }

    /**
 * 지금까지 전송된 '최대 end 바이트 인덱스'를 가져온다.
 * - 세션 진행 중에는 music_plays.play_duration_sec를 maxEndSent 보관용으로 사용
 * - 유효재생 처리되면 해당 필드는 실제 재생시간(초)로 복원됨
 */
    async getMaxEndSent(sessionId: number): Promise<number> {
        const session = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        if (!session[0]) return -1;

        // 진행 중에는 play_duration_sec를 maxEndSent 저장용으로 사용
        // is_valid_play === false 인 경우에만 maxEndSent로 취급
        if (!session[0].is_valid_play) {
            const v = Number(session[0].play_duration_sec ?? -1);
            return Number.isFinite(v) ? v : -1;
        }

        // 이미 유효재생이면 더 이상 트래킹할 필요 없음
        return -1;
    }

    /**
     * '최대 end 바이트 인덱스'를 갱신한다 (idempotent).
     * - 기존 값보다 클 때만 업데이트
     * - 진행 중(유효재생 전) 세션만 반영
     */
    async setMaxEndSent(sessionId: number, maxEnd: number): Promise<void> {
        const session = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        if (!session[0]) return;
        if (session[0].is_valid_play) return; // 이미 유효재생이면 갱신 불필요

        const current = Number(session[0].play_duration_sec ?? -1);
        const currentMax = Number.isFinite(current) ? current : -1;

        if (maxEnd > currentMax) {
            await this.db
                .update(music_plays)
                .set({
                    // 진행 중에는 play_duration_sec를 maxEndSent 저장용으로 사용
                    play_duration_sec: maxEnd,
                    updated_at: new Date(),
                })
                .where(eq(music_plays.id, sessionId));
        }
    }

    /**
     * 누적 진행도(바이트) 50% 이상 등 요건 충족 시, 중복 없이 유효재생 처리.
     * - 실제 재생시간(초)로 play_duration_sec를 복원
     * - 통계/리워드 갱신까지 한 번에 수행
     */
    async markAsValidPlayIfNeeded(sessionId: number): Promise<void> {
        const sessionRows = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, sessionId))
            .limit(1);

        const session = sessionRows[0];
        if (!session) {
            console.log(`❌ markAsValidPlayIfNeeded: 세션 없음 ${sessionId}`);
            return;
        }
        if (session.is_valid_play) {
            // 이미 처리됨
            return;
        }

        // 실제 재생 시간(초) 계산
        let actualPlayDuration = 0;
        if (session.played_at) {
            const now = Date.now();
            const started = new Date(session.played_at).getTime();
            actualPlayDuration = Math.max(0, Math.floor((now - started) / 1000));
        }

        // 회사 등급 확인
        const companyRows = await this.db
            .select()
            .from(companies)
            .where(eq(companies.id, session.using_company_id))
            .limit(1);

        const company = companyRows[0];
        const companyGrade = company?.grade ?? 'free';

        // 리워드 가능 여부 확인 및 차감/계산
        const { rewardCode, rewardAmount } = await this.checkAndProcessReward(
            session.music_id,
            session.using_company_id,
            companyGrade
        );

        // 세션을 유효재생으로 업데이트 + play_duration_sec를 '실제 재생 시간(초)'로 복원
        await this.db
            .update(music_plays)
            .set({
                is_valid_play: true,
                reward_code: rewardCode,
                reward_amount: rewardAmount.toString(),
                play_duration_sec: actualPlayDuration,
                updated_at: new Date(),
            })
            .where(eq(music_plays.id, sessionId));

        // 음원 통계 업데이트
        // await this.updateMusicStats(session.music_id, true);

        // 회사 총 리워드 누적
        if (rewardAmount > 0) {
            await this.db
                .update(companies)
                .set({
                    total_rewards_earned: sql`${companies.total_rewards_earned} + ${rewardAmount}`,
                    updated_at: new Date(),
                })
                .where(eq(companies.id, session.using_company_id));
        }

        console.log(
            `✅ markAsValidPlayIfNeeded 완료: 세션 ${sessionId}, 실제 재생 ${actualPlayDuration}s, 리워드 ${rewardAmount}`
        );
    }

    // async recordValidPlayOnce(opts: {
    //     musicId: number;
    //     companyId: number;
    //     useCase: '0' | '1' | '2'; // 0=일반, 1=inst, 2=가사 등
    //     playedAt: Date;           // 토큰 시작 시간
    // }) {
    //     const { musicId, companyId, useCase, playedAt } = opts;

    //     // 1) 최근 15분 내 동일 회사/곡/용도(use_case) 유효재생 이미 기록됐는지 확인
    //     const since = new Date(Date.now() - 15 * 60 * 1000);
    //     const dup = await this.db
    //         .select({ c: count() })
    //         .from(music_plays)
    //         .where(
    //             and(
    //                 eq(music_plays.music_id, musicId),
    //                 eq(music_plays.using_company_id, companyId),
    //                 eq(music_plays.use_case, useCase),
    //                 eq(music_plays.is_valid_play, true),
    //                 gte(music_plays.played_at, since),
    //             )
    //         );

    //     if ((dup[0]?.c || 0) > 0) {
    //         // 이미 유효재생 처리된 건 있음 → 다시 기록하지 않음
    //         return;
    //     }

    //     // 2) 회사 등급 조회
    //     const compRows = await this.db
    //         .select()
    //         .from(companies)
    //         .where(eq(companies.id, companyId))
    //         .limit(1);

    //     const company = compRows[0];
    //     const companyGrade = company?.grade ?? 'free';

    //     // 3) 리워드 가능 여부 확인 및 차감
    //     const { rewardCode, rewardAmount } = await this.checkAndProcessReward(
    //         musicId,
    //         companyId,
    //         companyGrade
    //     );

    //     // 4) 유효재생 1건 기록
    //     await this.db.insert(music_plays).values({
    //         music_id: musicId,
    //         using_company_id: companyId,
    //         played_at: playedAt,
    //         use_case: useCase,
    //         is_valid_play: true,
    //         play_duration_sec: 0, // (원하면 토큰 시작~현재 경과초로 기록 가능)
    //         reward_code: rewardCode,
    //         reward_amount: rewardAmount.toString(),
    //     });

    //     // 5) 음원 통계 업데이트
    //     await this.updateMusicStats(musicId, true);

    //     // 6) 회사 누적 리워드 업데이트
    //     if (rewardAmount > 0) {
    //         await this.db
    //             .update(companies)
    //             .set({
    //                 total_rewards_earned: sql`${companies.total_rewards_earned} + ${rewardAmount}`,
    //                 updated_at: new Date(),
    //             })
    //             .where(eq(companies.id, companyId));
    //     }
    // }

    async recordValidPlayOnce(opts: {
        musicId: number;
        companyId: number;
        useCase: '0' | '1' | '2';
        rewardCode;
        musicPlayId;
        rewardAmount;
    }) {
        const { musicId, companyId, useCase, musicPlayId, rewardCode, rewardAmount } = opts;

        // 중복 방지(최근 15분)
        // const since = new Date(Date.now() - 15 * 60 * 1000);
        // const dup = await this.db
        //     .select({ c: count() })
        //     .from(music_plays)
        //     .where(
        //         and(
        //             eq(music_plays.music_id, musicId),
        //             eq(music_plays.using_company_id, companyId),
        //             eq(music_plays.use_case, useCase),
        //             eq(music_plays.is_valid_play, true),
        //             gte(music_plays.played_at, since),
        //         )
        //     );
        // if ((dup[0]?.c || 0) > 0) return; // 이미 처리됨

        // 회사 등급
        const comp = await this.db
            .select()
            .from(companies)
            .where(eq(companies.id, companyId))
            .limit(1);
        const companyGrade = comp[0]?.grade ?? 'free';

        // 리워드 확인/차감
        // const { rewardCode, rewardAmount } = await this.checkAndProcessReward(
        //     musicId, companyId, companyGrade
        // );

        await this.db
            .update(music_plays)
            .set({ is_valid_play: true })
            .where(eq(music_plays.id, musicPlayId))

        // reward 테이블에 insert
        console.log(rewardCode, '리워드코드입니다.')
        if (rewardCode === "1") {
            await this.db
                .insert(rewards)
                .values({
                    company_id: companyId,
                    music_id: musicId,
                    play_id: musicPlayId,
                    amount: rewardAmount.toString(),
                })
        }

        await this.updateEndMusicStats(musicId);

        // 음원의 남은 리워드 카운팅 -1

        // 통계/리워드 누적
        // await this.updateMusicStats(musicId, true); // 총재생, 유효재생, 수익 누적 기록
        // if (rewardAmount > 0) {
        //     await this.db
        //         .update(companies)
        //         .set({
        //             total_rewards_earned: sql`${companies.total_rewards_earned} + ${rewardAmount}`,
        //             updated_at: new Date(),
        //         })
        //         .where(eq(companies.id, companyId));
        // }
    }

    async getStartPlay(musicPlayId) {
        const result = await this.db
            .select()
            .from(music_plays)
            .where(eq(music_plays.id, musicPlayId))

        return result[0] || null;
    }

    // 회사 ID로 회사 조회 (PlayToken fallback 용)
    async findCompanyById(companyId: number) {
        const rows = await this.db
            .select()
            .from(companies)
            .where(eq(companies.id, companyId))
            .limit(1);
        return rows[0] || null;
    }



}
