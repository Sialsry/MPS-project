import * as cron from 'node-cron';
import { runDailyRewardProcessor } from './dailyRewardProcessor.js';

/**
 * 매일 자정에 하루 전 데이터를 처리하는 스케줄러
 */
function startDailyRewardScheduler(): void {
    console.log('일일 리워드 스케줄러 시작...');

    // 매일 자정 5분에 실행 (0 5 0 * * *)
    // 초 분 시 일 월 요일
    cron.schedule('5 0 * * *', async () => {
        console.log('=== 일일 리워드 스케줄러 실행 ===');

        try {
            await runDailyRewardProcessor();
            console.log('일일 리워드 처리 완료');
        } catch (error) {
            console.error('일일 리워드 스케줄러 실행 중 오류:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Seoul" // 한국 시간대로 설정
    });

    console.log('일일 리워드 스케줄러가 설정되었습니다. (매일 00:05에 실행)');
}

/**
 * 테스트용 즉시 실행 함수
 */
async function runImmediately(): Promise<void> {
    console.log('=== 테스트용 즉시 실행 ===');
    try {
        await runDailyRewardProcessor();
        console.log('테스트 실행 완료');
    } catch (error) {
        console.error('테스트 실행 실패:', error);
    }
}

// CLI 인자로 즉시 실행 가능
if (process.argv.includes('--now')) {
    runImmediately();
} else {
    startDailyRewardScheduler();

    // 프로세스가 종료되지 않도록 유지
    process.on('SIGINT', () => {
        console.log('스케줄러를 종료합니다...');
        process.exit(0);
    });
}

export { startDailyRewardScheduler, runImmediately };
