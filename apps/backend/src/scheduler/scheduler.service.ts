import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecordService } from '../record/record.service';
import { ethers } from 'ethers';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private recordUsageContract: ethers.Contract;
    private rewardTokenContract: ethers.Contract;

    constructor(private readonly recordService: RecordService) {
        // 블록체인 설정 초기화
        this.provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);

        // RecordUsage 컨트랙트 설정 - 배치 처리용
        const recordUsageAbi = [
            "function recordDailyUsageBatch(tuple(uint256 company_id, uint256 music_id, uint256 play_id, uint8 reward_code, uint256 created_at)[] usageRecords) external",
            "function processDailyRewardsBatch(address[] recipients, uint256[] amounts) external",
            "function approvedCompanies(address) view returns (bool)",
            "event PlayRecorded(address indexed using_company, uint256 indexed track_id, uint8 use_case, uint256 play_id, uint8 reward_code)",
            "event BatchRecorded(uint256 recordCount, uint256 timestamp)",
            "event DailyRewardsBatchProcessed(uint256 recipientCount, uint256 totalAmount)"
        ];

        this.recordUsageContract = new ethers.Contract(
            process.env.RECORD_USAGE_CONTRACT_ADDRESS!,
            recordUsageAbi,
            this.wallet
        );

        // RewardToken2 컨트랙트 설정
        const rewardTokenAbi = [
            "function processDailyRewardsBatch(address[] recipients, uint256[] amounts) external",
            "function balanceOf(address account) external view returns (uint256)",
            "function totalSupply() external view returns (uint256)",
            "event DailyRewardsBatchProcessed(uint256 recipientCount, uint256 totalAmount)"
        ];

        this.rewardTokenContract = new ethers.Contract(
            process.env.REWARD_TOKEN_CONTRACT_ADDRESS!,
            rewardTokenAbi,
            this.wallet
        );

        this.logger.log('스케줄러 서비스가 초기화되었습니다.');
    }

    // 매일 밤 12시 10분에 실행 (0 10 0 * * *)
    @Cron('0 10 0 * * *', {
        name: 'dailyBlockchainRecord',
        timeZone: 'Asia/Seoul'
    })
    async handleDailyBlockchainRecord() {
        this.logger.log('=== 일일 블록체인 기록 스케줄러 시작 ===');

        try {
            // 전날 날짜 계산
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            this.logger.log(`처리 대상 날짜: ${yesterday.toDateString()}`);

            // 전날의 pending 상태 데이터 조회
            const dailyUsage = await this.recordService.getDailyUsageByStatus('pending', yesterday);

            if (dailyUsage.length === 0) {
                this.logger.log('처리할 데이터가 없습니다.');
                return;
            }

            this.logger.log(`처리할 레코드 수: ${dailyUsage.length}`);

            try {
                // 배치 처리로 블록체인에 기록
                const txHash = await this.sendBatchToBlockchain(dailyUsage);

                // 모든 레코드의 상태를 성공으로 업데이트
                // await this.updateAllRecordsStatus(dailyUsage, txHash, 'successed');

                this.logger.log(`배치 처리 성공 - 총 ${dailyUsage.length}개 레코드, TX: ${txHash}`);

                // 리워드 토큰 배치 처리 실행
                await this.processRewardTokenBatch(yesterday);

            } catch (error) {
                this.logger.error('배치 처리 실패:', error.message);

                // 모든 레코드의 상태를 실패로 업데이트
                await this.updateAllRecordsStatus(dailyUsage, '', 'falied');
            }

            this.logger.log('=== 일일 블록체인 기록 스케줄러 완료 ===');

        } catch (error) {
            this.logger.error('일일 블록체인 기록 스케줄러 실행 중 오류:', error);
        }
    }

    // 리워드 토큰 배치 처리
    private async processRewardTokenBatch(targetDate: Date) {
        this.logger.log('=== 리워드 토큰 배치 처리 시작 ===');

        try {
            // 일일 리워드 집계 조회 (reward_code=1, pending 상태)
            const rewardAggregation = await this.recordService.getDailyRewardAggregation(targetDate);

            if (rewardAggregation.length === 0) {
                this.logger.log('처리할 리워드가 없습니다.');
                return;
            }

            this.logger.log(`리워드 지급 대상: ${rewardAggregation.length}개 회사`);

            // 배치 데이터 준비
            const recipients: string[] = [];
            const amounts: string[] = [];
            const companyIds: number[] = [];

            for (const reward of rewardAggregation) {
                if (reward.smartAccountAddress && reward.totalRewardAmount > 0) {
                    recipients.push(reward.smartAccountAddress);
                    amounts.push(ethers.parseEther(reward.totalRewardAmount.toString()).toString());
                    companyIds.push(reward.companyId);
                }
            }

            if (recipients.length === 0) {
                this.logger.log('유효한 리워드 지급 대상이 없습니다.');
                return;
            }

            this.logger.log(`실제 지급 대상: ${recipients.length}개 주소`);

            // 리워드 토큰 배치 지급 실행
            const rewardTxHash = await this.sendRewardTokenBatch(recipients, amounts);

            // 해당 날짜의 모든 reward_code=1 레코드들의 상태 업데이트
            await this.updateRewardRecordsStatus(companyIds, targetDate, rewardTxHash, 'successed');

            this.logger.log(`리워드 토큰 배치 지급 완료 - TX: ${rewardTxHash}`);

        } catch (error) {
            this.logger.error('리워드 토큰 배치 처리 실패:', error.message);
            // 실패 시 상태 업데이트는 하지 않음 (다음 날 재시도 가능하도록)
        }

        this.logger.log('=== 리워드 토큰 배치 처리 완료 ===');
    }

    // 리워드 토큰 배치 전송
    private async sendRewardTokenBatch(recipients: string[], amounts: string[]): Promise<string> {
        try {
            this.logger.log('리워드 토큰 배치 전송 중...');

            // 가스 추정
            const baseGas = 150000;
            const gasPerRecipient = 80000;
            const estimatedGas = baseGas + (gasPerRecipient * recipients.length);

            this.logger.log(`예상 가스 사용량: ${estimatedGas}`);

            // RecordUsage 컨트랙트를 통해 리워드 배치 처리
            const tx = await this.recordUsageContract.processDailyRewardsBatch(
                recipients,
                amounts,
                {
                    gasLimit: estimatedGas,
                    maxFeePerGas: ethers.parseUnits('25', 'gwei'),
                    maxPriorityFeePerGas: ethers.parseUnits('3', 'gwei')
                }
            );

            this.logger.log(`리워드 배치 트랜잭션 전송됨: ${tx.hash}`);

            // 트랜잭션 확인 대기
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                this.logger.log(`리워드 배치 트랜잭션 성공: ${tx.hash}, 가스 사용량: ${receipt.gasUsed}`);
                return tx.hash;
            } else {
                throw new Error(`리워드 배치 트랜잭션 실패: ${tx.hash}`);
            }

        } catch (error) {
            this.logger.error('리워드 토큰 배치 전송 실패:', error);
            throw error;
        }
    }

    // 리워드 레코드들의 상태 업데이트
    private async updateRewardRecordsStatus(companyIds: number[], targetDate: Date, txHash: string, status: 'successed' | 'falied') {
        this.logger.log(`리워드 레코드 상태 업데이트 중...`);

        for (const companyId of companyIds) {
            try {
                const pendingRewards = await this.recordService.getCompanyPendingRewards(companyId, targetDate);
                const playIds = pendingRewards.map(reward => reward.playId);

                if (playIds.length > 0) {
                    await this.recordService.updateRewardBatchStatus(playIds, txHash, status);
                    this.logger.log(`회사 ${companyId}: ${playIds.length}개 리워드 레코드 상태 업데이트 완료`);
                }
            } catch (error) {
                this.logger.error(`회사 ${companyId} 리워드 상태 업데이트 실패:`, error);
            }
        }

        this.logger.log('모든 리워드 레코드 상태 업데이트 완료');
    }

    // 배치로 레코드들을 블록체인에 전송
    private async sendBatchToBlockchain(records: any[]): Promise<string> {
        try {
            this.logger.log('배치 데이터 준비 중...');

            console.log(records, "컨트랙트 형식으로 변환하기 전 집계한 하루치 유효재생")
            // 레코드들을 컨트랙트 형식에 맞게 변환
            const usageRecords = records.map(record => ({
                company_id: record.companyId,
                music_id: record.musicId,
                play_id: record.playId,
                reward_code: this.convertRewardCode(record.rewardCode),
                created_at: Math.floor(new Date(record.usedAt).getTime() / 1000)
            }));

            this.logger.log(`배치 데이터 구성 완료: ${usageRecords.length}개 레코드`);

            // 가스 추정 (레코드 수에 따라 동적 조정)
            const baseGas = 100000; // 기본 가스
            const gasPerRecord = 50000; // 레코드당 추가 가스
            const estimatedGas = baseGas + (gasPerRecord * records.length);

            this.logger.log(`예상 가스 사용량: ${estimatedGas}`);

            // 배치 컨트랙트 함수 호출
            const tx = await this.recordUsageContract.recordDailyUsageBatch(
                usageRecords,
                {
                    gasLimit: estimatedGas,
                    maxFeePerGas: ethers.parseUnits('20', 'gwei'),
                    maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
                }
            );

            this.logger.log(`배치 트랜잭션 전송됨: ${tx.hash}`);

            // 트랜잭션 확인 대기
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                this.logger.log(`배치 트랜잭션 성공: ${tx.hash}, 가스 사용량: ${receipt.gasUsed}`);
                return tx.hash;
            } else {
                throw new Error(`배치 트랜잭션 실패: ${tx.hash}`);
            }

        } catch (error) {
            this.logger.error('배치 블록체인 전송 실패:', error);
            throw error;
        }
    }

    // 모든 레코드의 상태를 일괄 업데이트
    private async updateAllRecordsStatus(records: any[], txHash: string, status: 'successed' | 'falied') {
        this.logger.log(`${records.length}개 레코드의 상태를 ${status}로 업데이트 중...`);

        for (const record of records) {
            try {
                await this.recordService.updateRewardStatus(record.playId, txHash, status);
            } catch (error) {
                this.logger.error(`Play ID ${record.playId} 상태 업데이트 실패:`, error);
            }
        }

        this.logger.log('모든 레코드 상태 업데이트 완료');
    }

    // reward_code 문자열을 숫자로 변환
    private convertRewardCode(rewardCode: string): number {
        const codeMap: { [key: string]: number } = {
            '0': 0, // Rewardless
            '1': 1, // Rewarded  
            '2': 2, // MusicLimit
            '3': 3  // CompanyLimit
        };

        return codeMap[rewardCode] ?? 0;
    }

    // 수동 실행 메서드 (테스트용) - 배치 처리 버전
    async manualExecute(targetDate?: Date): Promise<{ success: boolean; total: number; txHash?: string; rewardTxHash?: string; error?: string }> {
        this.logger.log('=== 수동 블록체인 기록 실행 (배치 처리) ===');

        const processDate = targetDate || (() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday;
        })();

        this.logger.log(`처리 대상 날짜: ${processDate.toDateString()}`);

        const dailyUsage = await this.recordService.getDailyUsageByStatus('pending', processDate);

        if (dailyUsage.length === 0) {
            this.logger.log('처리할 데이터가 없습니다.');
            return { success: true, total: 0 };
        }

        try {
            // 1. 사용 내역 배치 처리
            const txHash = await this.sendBatchToBlockchain(dailyUsage);
            await this.updateAllRecordsStatus(dailyUsage, txHash, 'successed');

            this.logger.log(`수동 배치 실행 완료 - 총 ${dailyUsage.length}개 레코드 성공`);

            // 2. 리워드 토큰 배치 처리
            let rewardTxHash: string | undefined;
            try {
                await this.processRewardTokenBatch(processDate);
                // 리워드 집계에서 실제 트랜잭션 해시를 가져오기 위해 별도 처리 필요
                const rewardAggregation = await this.recordService.getDailyRewardAggregation(processDate);
                if (rewardAggregation.length > 0) {
                    const recipients = rewardAggregation
                        .filter(r => r.smartAccountAddress && r.totalRewardAmount > 0)
                        .map(r => r.smartAccountAddress!);
                    const amounts = rewardAggregation
                        .filter(r => r.smartAccountAddress && r.totalRewardAmount > 0)
                        .map(r => ethers.parseEther(r.totalRewardAmount.toString()).toString());

                    if (recipients.length > 0) {
                        rewardTxHash = await this.sendRewardTokenBatch(recipients, amounts);
                    }
                }
            } catch (rewardError) {
                this.logger.warn('리워드 처리 실패 (사용 내역 기록은 성공):', rewardError.message);
            }

            return { success: true, total: dailyUsage.length, txHash, rewardTxHash };

        } catch (error) {
            this.logger.error('수동 배치 실행 실패:', error.message);
            await this.updateAllRecordsStatus(dailyUsage, '', 'falied');

            return { success: false, total: dailyUsage.length, error: error.message };
        }
    }

    // 수동 리워드 처리 메서드 (별도 실행용)
    async manualRewardExecute(targetDate?: Date): Promise<{ success: boolean; recipients: number; txHash?: string; error?: string }> {
        this.logger.log('=== 수동 리워드 토큰 처리 실행 ===');

        const processDate = targetDate || (() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday;
        })();

        try {
            const rewardAggregation = await this.recordService.getDailyRewardAggregation(processDate);

            if (rewardAggregation.length === 0) {
                this.logger.log('처리할 리워드가 없습니다.');
                return { success: true, recipients: 0 };
            }

            const recipients = rewardAggregation
                .filter(r => r.smartAccountAddress && r.totalRewardAmount > 0)
                .map(r => r.smartAccountAddress!);
            const amounts = rewardAggregation
                .filter(r => r.smartAccountAddress && r.totalRewardAmount > 0)
                .map(r => ethers.parseEther(r.totalRewardAmount.toString()).toString());

            if (recipients.length === 0) {
                this.logger.log('유효한 리워드 지급 대상이 없습니다.');
                return { success: true, recipients: 0 };
            }

            const txHash = await this.sendRewardTokenBatch(recipients, amounts);

            // 상태 업데이트
            const companyIds = rewardAggregation.map(r => r.companyId);
            await this.updateRewardRecordsStatus(companyIds, processDate, txHash, 'successed');

            this.logger.log(`수동 리워드 처리 완료 - ${recipients.length}개 주소, TX: ${txHash}`);
            return { success: true, recipients: recipients.length, txHash };

        } catch (error) {
            this.logger.error('수동 리워드 처리 실패:', error.message);
            return { success: false, recipients: 0, error: error.message };
        }
    }
}
