import { ethers } from 'ethers';
import postgres from 'postgres';

// 환경 변수 로드
require('dotenv').config({ path: '../../../.env.local' });

// DB 연결
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// 블록체인 연결
const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// 컨트랙트 ABI (RecordUsage 컨트랙트의 실제 ABI로 교체 필요)
const recordUsageAbi = [
    // TODO: 실제 컨트랙트 ABI로 교체 필요
    "function recordDailyUsage(uint256 company_id, uint256 music_id, uint256 play_id, uint8 reward_code, uint256 created_at) external",
    "function approvedCompanies(address) view returns (bool)"
];

const recordUsageContract = new ethers.Contract(
    process.env.RECORD_USAGE_CONTRACT_ADDRESS!,
    recordUsageAbi,
    wallet
);

interface DailyRewardData {
    id: number;
    company_id: number;
    music_id: number;
    play_id: number;
    reward_code: string;
    created_at: Date;
    payout_tx_hash?: string | null;
    status: string;
}

interface ProcessedReward {
    company_id: number;
    music_id: number;
    play_id: number;
    reward_code: number;
    created_at_timestamp: number;
    db_id: number;
}

/**
 * 특정 날짜의 리워드 데이터를 가져옴
 */
async function getDailyRewards(targetDate: Date): Promise<DailyRewardData[]> {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // SQL 쿼리 직접 사용
        const query = `
      SELECT 
        id,
        company_id,
        music_id,
        play_id,
        reward_code,
        created_at,
        payout_tx_hash,
        status
      FROM rewards 
      WHERE created_at >= $1 
        AND created_at < $2 
        AND status = 'pending'
      ORDER BY created_at DESC
    `;

        const result = await client.unsafe(query, [startOfDay.toISOString(), endOfDay.toISOString()]);

        return result.map(row => ({
            id: Number(row.id),
            company_id: Number(row.company_id),
            music_id: Number(row.music_id),
            play_id: Number(row.play_id),
            reward_code: String(row.reward_code),
            created_at: new Date(row.created_at as string),
            payout_tx_hash: row.payout_tx_hash as string | null,
            status: String(row.status)
        }));

    } catch (error) {
        console.error('DB에서 일일 리워드 데이터 조회 실패:', error);
        throw error;
    }
}

/**
 * reward_code를 숫자로 변환
 */
function convertRewardCode(rewardCode: string): number {
    const codeMap: { [key: string]: number } = {
        '0': 0, // Rewardless
        '1': 1, // Rewarded  
        '2': 2, // MusicLimit
        '3': 3  // CompanyLimit
    };

    return codeMap[rewardCode] ?? 0;
}

/**
 * 데이터를 컨트랙트 전송용으로 가공
 */
function processRewardData(rawData: DailyRewardData[]): ProcessedReward[] {
    return rawData.map(item => ({
        company_id: item.company_id,
        music_id: item.music_id,
        play_id: item.play_id,
        reward_code: convertRewardCode(item.reward_code),
        created_at_timestamp: Math.floor(item.created_at.getTime() / 1000), // 초 단위 타임스탬프
        db_id: item.id
    }));
}

/**
 * 단일 리워드 기록을 컨트랙트에 전송
 */
async function sendRewardToContract(reward: ProcessedReward): Promise<string> {
    try {
        console.log(`리워드 전송 중: Play ID ${reward.play_id}, Company ${reward.company_id}`);

        // TODO: 실제 컨트랙트 함수명에 맞게 수정 필요
        const tx = await recordUsageContract.recordDailyUsage(
            reward.company_id,
            reward.music_id,
            reward.play_id,
            reward.reward_code,
            reward.created_at_timestamp,
            {
                gasLimit: 200000, // 적절한 가스 한도 설정
                maxFeePerGas: ethers.parseUnits('20', 'gwei'),
                maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
            }
        );

        console.log(`트랜잭션 전송됨: ${tx.hash}`);

        // 트랜잭션 확인 대기
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log(`트랜잭션 성공: ${tx.hash}`);
            return tx.hash;
        } else {
            throw new Error(`트랜잭션 실패: ${tx.hash}`);
        }

    } catch (error) {
        console.error('컨트랙트 전송 실패:', error);
        throw error;
    }
}

/**
 * DB에서 리워드 상태 업데이트
 */
async function updateRewardStatus(
    rewardId: number,
    txHash: string,
    status: 'successed' | 'falied'
): Promise<void> {
    try {
        const query = `
      UPDATE rewards 
      SET 
        payout_tx_hash = $1,
        status = $2,
        blockchain_recorded_at = $3,
        updated_at = $4
      WHERE id = $5
    `;

        await client.unsafe(query, [
            txHash || null,
            status,
            new Date().toISOString(),
            new Date().toISOString(),
            rewardId
        ]);

        console.log(`DB 상태 업데이트 완료: Reward ID ${rewardId}, Status: ${status}`);
    } catch (error) {
        console.error('DB 상태 업데이트 실패:', error);
        throw error;
    }
}

/**
 * 배치 처리로 리워드 전송
 */
async function processDailyRewardsBatch(rewards: ProcessedReward[]): Promise<void> {
    console.log(`총 ${rewards.length}개의 리워드 처리 시작`);

    for (let i = 0; i < rewards.length; i++) {
        const reward = rewards[i];

        if (!reward) {
            console.log(`Reward at index ${i} is undefined, skipping...`);
            continue;
        }

        try {
            // 컨트랙트에 전송
            const txHash = await sendRewardToContract(reward);

            // DB 상태 업데이트 (성공)
            await updateRewardStatus(reward.db_id, txHash, 'successed');

            console.log(`진행률: ${i + 1}/${rewards.length} (${((i + 1) / rewards.length * 100).toFixed(1)}%)`);

            // 트랜잭션 간 간격 (네트워크 부하 방지)
            if (i < rewards.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
            }

        } catch (error) {
            console.error(`Reward ID ${reward.db_id} 처리 실패:`, error);

            // DB 상태 업데이트 (실패)
            await updateRewardStatus(reward.db_id, '', 'falied');
        }
    }
}

/**
 * 메인 처리 함수
 */
export async function processDailyRewards(targetDate?: Date): Promise<void> {
    const processDate = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // 기본값: 어제

    console.log(`=== 일일 리워드 처리 시작: ${processDate.toDateString()} ===`);

    try {
        // 1. DB에서 해당 날짜의 리워드 데이터 조회
        const dailyRewards = await getDailyRewards(processDate);

        if (dailyRewards.length === 0) {
            console.log('처리할 리워드가 없습니다.');
            return;
        }

        console.log(`조회된 리워드 개수: ${dailyRewards.length}`);

        // 2. 데이터 가공
        const processedRewards = processRewardData(dailyRewards);

        // 3. 컨트랙트에 배치 전송
        await processDailyRewardsBatch(processedRewards);

        console.log('=== 일일 리워드 처리 완료 ===');

    } catch (error) {
        console.error('일일 리워드 처리 중 오류 발생:', error);
        throw error;
    } finally {
        await client.end(); // DB 연결 종료
    }
}

/**
 * 스케줄러를 위한 실행 함수
 */
export async function runDailyRewardProcessor(): Promise<void> {
    try {
        await processDailyRewards();
    } catch (error) {
        console.error('Daily reward processor 실행 실패:', error);
        process.exit(1);
    }
}

// 직접 실행 시
if (require.main === module) {
    runDailyRewardProcessor();
}
