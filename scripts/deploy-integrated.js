const { ethers } = require("hardhat");

async function main() {
    console.log("=== RewardToken2 및 RecordUsage 통합 배포 ===");

    // 배포자 계정 정보
    const [deployer] = await ethers.getSigners();
    console.log("배포 계정:", deployer.address);
    console.log("계정 잔액:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

    // 1. RewardToken2 배포
    console.log("\n1. RewardToken2 배포 중...");
    const RewardToken2 = await ethers.getContractFactory("RewardToken2");
    const rewardToken = await RewardToken2.deploy();
    await rewardToken.waitForDeployment();
    
    const rewardTokenAddress = await rewardToken.getAddress();
    console.log("RewardToken2 배포 완료:", rewardTokenAddress);

    // 2. RecordUsage 배포 (RewardToken2 주소와 함께)
    console.log("\n2. RecordUsage 배포 중...");
    const RecordUsage = await ethers.getContractFactory("RecordUsage");
    const recordUsage = await RecordUsage.deploy(rewardTokenAddress);
    await recordUsage.waitForDeployment();
    
    const recordUsageAddress = await recordUsage.getAddress();
    console.log("RecordUsage 배포 완료:", recordUsageAddress);

    // 3. RewardToken2에서 RecordUsage를 authorized caller로 설정
    console.log("\n3. 권한 설정 중...");
    
    try {
        const authTx = await rewardToken.setAuthorizedCaller(recordUsageAddress, true);
        await authTx.wait();
        console.log("RecordUsage가 RewardToken2의 authorized caller로 설정됨");
    } catch (error) {
        console.error("권한 설정 실패:", error.message);
    }

    // 4. 테스트 회사 승인 (선택사항)
    console.log("\n4. 테스트 회사 승인 설정...");
    const testCompanyAddress = "0x1234567890123456789012345678901234567890"; // 실제 테스트 주소로 변경
    
    try {
        const approveTx = await recordUsage.approveCompany(testCompanyAddress);
        await approveTx.wait();
        console.log(`테스트 회사 ${testCompanyAddress} 승인됨`);
    } catch (error) {
        console.log("테스트 회사 승인 건너뜀 (필요시 수동 설정)");
    }

    // 5. 설정 확인
    console.log("\n5. 배포 완료 - 설정 확인:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("RewardToken2 주소:", rewardTokenAddress);
    console.log("RecordUsage 주소:", recordUsageAddress);
    
    try {
        const rewardTokenInContract = await recordUsage.getRewardTokenAddress();
        console.log("RecordUsage에 설정된 RewardToken 주소:", rewardTokenInContract);
        
        const isAuthorized = await rewardToken.authorizedCallers(recordUsageAddress);
        console.log("RecordUsage 권한 설정 상태:", isAuthorized);
    } catch (error) {
        console.log("설정 확인 중 오류:", error.message);
    }

    // 6. 환경 변수 가이드
    console.log("\n6. 환경 변수 설정:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("다음 주소들을 .env 파일에 추가하세요:");
    console.log(`RECORD_USAGE_CONTRACT_ADDRESS=${recordUsageAddress}`);
    console.log(`REWARD_TOKEN_CONTRACT_ADDRESS=${rewardTokenAddress}`);

    console.log("\n=== 배포 완료 ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("배포 실패:", error);
        process.exit(1);
    });
