const { ethers } = require("hardhat");

async function main() {
    console.log("=== 통합 시스템 테스트 ===");

    // 컨트랙트 주소 (배포 후 실제 주소로 변경 필요)
    const RECORD_USAGE_ADDRESS = process.env.RECORD_USAGE_CONTRACT_ADDRESS || "0x...";
    const REWARD_TOKEN_ADDRESS = process.env.REWARD_TOKEN_CONTRACT_ADDRESS || "0x...";

    if (RECORD_USAGE_ADDRESS === "0x..." || REWARD_TOKEN_ADDRESS === "0x...") {
        console.error("❌ 환경 변수에서 컨트랙트 주소를 찾을 수 없습니다.");
        console.log("RECORD_USAGE_CONTRACT_ADDRESS와 REWARD_TOKEN_CONTRACT_ADDRESS를 설정하세요.");
        process.exit(1);
    }

    const [deployer, company1, company2] = await ethers.getSigners();
    console.log("테스트 계정들:");
    console.log("- 배포자:", deployer.address);
    console.log("- 회사1:", company1.address);
    console.log("- 회사2:", company2.address);

    // 컨트랙트 연결
    const RecordUsage = await ethers.getContractFactory("RecordUsage");
    const recordUsage = RecordUsage.attach(RECORD_USAGE_ADDRESS);

    const RewardToken2 = await ethers.getContractFactory("RewardToken2");
    const rewardToken = RewardToken2.attach(REWARD_TOKEN_ADDRESS);

    console.log("\n=== 1. 초기 설정 테스트 ===");
    
    // 권한 확인
    const isAuthorized = await rewardToken.authorizedCallers(RECORD_USAGE_ADDRESS);
    console.log("✅ RecordUsage 권한 설정:", isAuthorized ? "성공" : "❌ 실패");

    // 회사 승인
    try {
        await recordUsage.approveCompany(company1.address);
        await recordUsage.approveCompany(company2.address);
        console.log("✅ 테스트 회사들 승인 완료");
    } catch (error) {
        console.log("⚠️ 회사 승인 건너뜀 (이미 승인됨)");
    }

    console.log("\n=== 2. 사용 내역 배치 기록 테스트 ===");

    // 테스트 데이터 준비
    const usageRecords = [
        {
            company_id: 1,
            music_id: 101,
            play_id: 1001,
            reward_code: 1, // Rewarded
            created_at: Math.floor(Date.now() / 1000)
        },
        {
            company_id: 1,
            music_id: 102,
            play_id: 1002,
            reward_code: 0, // Rewardless
            created_at: Math.floor(Date.now() / 1000)
        },
        {
            company_id: 2,
            music_id: 103,
            play_id: 1003,
            reward_code: 1, // Rewarded
            created_at: Math.floor(Date.now() / 1000)
        }
    ];

    try {
        // 회사1에서 배치 기록
        const batchTx = await recordUsage.connect(company1).recordDailyUsageBatch(usageRecords, {
            gasLimit: 500000
        });
        await batchTx.wait();
        console.log("✅ 배치 사용 내역 기록 성공:", batchTx.hash);
        
        // 이벤트 확인
        const receipt = await batchTx.wait();
        console.log(`📊 배치 처리 결과: ${receipt.logs.length}개 이벤트 발생`);

    } catch (error) {
        console.error("❌ 배치 기록 실패:", error.message);
    }

    console.log("\n=== 3. 리워드 토큰 상태 확인 ===");

    try {
        const company1AccumulatedReward = await recordUsage.getDailyRewardAccumulated(company1.address);
        const company2AccumulatedReward = await recordUsage.getDailyRewardAccumulated(company2.address);
        
        console.log(`📈 회사1 누적 리워드: ${ethers.formatEther(company1AccumulatedReward)} tokens`);
        console.log(`📈 회사2 누적 리워드: ${ethers.formatEther(company2AccumulatedReward)} tokens`);

        const totalSupply = await rewardToken.totalSupply();
        console.log(`🏦 토큰 총 발행량: ${ethers.formatEther(totalSupply)} tokens`);

    } catch (error) {
        console.error("❌ 리워드 상태 확인 실패:", error.message);
    }

    console.log("\n=== 4. 리워드 배치 지급 테스트 ===");

    try {
        // 리워드 지급 대상 및 금액 설정
        const recipients = [company1.address, company2.address];
        const amounts = [
            ethers.parseEther("100"), // 100 tokens for company1
            ethers.parseEther("50")   // 50 tokens for company2
        ];

        // 배치 리워드 지급
        const rewardTx = await recordUsage.processDailyRewardsBatch(recipients, amounts, {
            gasLimit: 300000
        });
        await rewardTx.wait();
        console.log("✅ 배치 리워드 지급 성공:", rewardTx.hash);

        // 지급 후 잔액 확인
        const company1Balance = await rewardToken.balanceOf(company1.address);
        const company2Balance = await rewardToken.balanceOf(company2.address);
        
        console.log(`💰 회사1 토큰 잔액: ${ethers.formatEther(company1Balance)} tokens`);
        console.log(`💰 회사2 토큰 잔액: ${ethers.formatEther(company2Balance)} tokens`);

        // 누적 리워드 초기화 확인
        const company1NewAccumulated = await recordUsage.getDailyRewardAccumulated(company1.address);
        const company2NewAccumulated = await recordUsage.getDailyRewardAccumulated(company2.address);
        
        console.log(`🔄 회사1 누적 리워드 초기화: ${company1NewAccumulated.toString() === "0" ? "성공" : "실패"}`);
        console.log(`🔄 회사2 누적 리워드 초기화: ${company2NewAccumulated.toString() === "0" ? "성공" : "실패"}`);

    } catch (error) {
        console.error("❌ 리워드 지급 실패:", error.message);
    }

    console.log("\n=== 5. 전체 시스템 상태 요약 ===");

    try {
        const finalTotalSupply = await rewardToken.totalSupply();
        const company1FinalBalance = await rewardToken.balanceOf(company1.address);
        const company2FinalBalance = await rewardToken.balanceOf(company2.address);
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`🏦 토큰 총 발행량: ${ethers.formatEther(finalTotalSupply)} tokens`);
        console.log(`💰 회사1 최종 잔액: ${ethers.formatEther(company1FinalBalance)} tokens`);
        console.log(`💰 회사2 최종 잔액: ${ethers.formatEther(company2FinalBalance)} tokens`);
        
        // 음원별 재생 횟수 확인
        for (let musicId = 101; musicId <= 103; musicId++) {
            const playCount = await recordUsage.getTrackPlayCount(musicId);
            console.log(`🎵 음원 ${musicId} 재생 횟수: ${playCount}`);
        }

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    } catch (error) {
        console.error("❌ 최종 상태 확인 실패:", error.message);
    }

    console.log("\n✅ 통합 테스트 완료!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("테스트 실패:", error);
        process.exit(1);
    });
