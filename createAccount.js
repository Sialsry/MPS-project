const {ethers, keccak256, solidityPacked} = require("ethers")
require("dotenv").config();
const smartAccountFactoryAbi = require("./artifacts/contracts/AA/SmartAccountFactory.sol/SmartAccountFactory.json").abi;
// const recordUsageAbi = require("./artifacts/contracts/RecordUsage.sol/RecordUsage.json").abi;
const paymasterAbi = require("./artifacts/contracts/AA/Paymaster.sol/Paymaster.json").abi;

const createPrivateKey = (email, salt, business_number) => {
    const company_id = `${email}_${business_number}`;
    const value = solidityPacked(["string", "string"], [salt, company_id]).slice(0, 64);
    const pk = keccak256(value).replace("0x", "").slice(0, 64);
    return `0x${pk}`;
}

const email = "business@test.com";
const private_key = createPrivateKey(email, "dummy_salt", "345-67-89012");
const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
const wallet = new ethers.Wallet(private_key, provider); 
console.log(`EOA 개인키: ${private_key}`);


const paymasterPrivateKey = process.env.PRIVATE_KEY;
const paymasterWallet = new ethers.Wallet(paymasterPrivateKey, provider);
const smartaccount_factory = new ethers.Contract(process.env.SmartAccountFactory, smartAccountFactoryAbi, paymasterWallet);
// const recordUsage = new ethers.Contract(process.env.RecordUsage, recordUsageAbi, paymasterWallet); 
const paymaster = new ethers.Contract(process.env.Paymaster, paymasterAbi, paymasterWallet); 

const createSmartAccountAndApprove = async () => {
    try {
        console.log("🚀 기업 회원가입 프로세스 시작\n");
        
        const owner = wallet.address;
        
        // 1. 스마트 계정 생성
        console.log("1️⃣ 스마트 계정 생성 중...");
        const createTransaction = await smartaccount_factory.createAccount(owner);
        const createResult = await createTransaction.wait();
        console.log(`✅ 스마트 계정 생성 트랜잭션: ${createResult.hash}`);

        // 2. 생성된 스마트 계정 주소 조회
        const smartAccountAddress = await smartaccount_factory.getAccount(owner);
        console.log(`📍 생성된 스마트 계정 주소: ${smartAccountAddress}`);

        // 3. 기업 승인 처리
        // console.log("\n2️⃣ 기업 승인 처리 중...");
        // const approvalTransaction = await recordUsage.setCompanyApproval(smartAccountAddress, true);
        // const approvalResult = await approvalTransaction.wait();
        // console.log(`✅ 기업 승인 트랜잭션: ${approvalResult.hash}`);

        // 4. 승인 상태 확인
        // const isApproved = await recordUsage.approvedCompanies(smartAccountAddress);
        // console.log(`📋 기업 승인 상태: ${isApproved ? "승인됨" : "승인되지 않음"}`);

        // 5. Paymaster 화이트리스트 추가
        console.log("\n3️⃣ Paymaster 화이트리스트 추가 중...");
        const addWhitelistTransaction = await paymaster.addWhiteList(smartAccountAddress);
        const addWhitelistResult = await addWhitelistTransaction.wait();
        console.log(`✅ Paymaster 화이트리스트 추가 트랜잭션: ${addWhitelistResult.hash}`);

        // 6. 화이트리스트 상태 확인
        const isWhitelisted = await paymaster.whiteList(smartAccountAddress);
        console.log(`📋 Paymaster 화이트리스트 상태: ${isWhitelisted ? "화이트리스트됨" : "화이트리스트되지 않음"}`);

        

        console.log("\n🎉 기업 회원가입 완료!");
        console.log("=".repeat(50));
        console.log(`기업 EOA 주소: ${owner}`);
        console.log(`스마트 계정 주소: ${smartAccountAddress}`);
        // console.log(`승인 상태: ${isApproved ? "승인됨" : "승인되지 않음"}`);
        console.log(`Paymaster 화이트리스트: ${isWhitelisted ? "등록됨" : "등록되지 않음"}`);
        console.log("=".repeat(50));

        return {
            eoaAddress: owner,
            smartAccountAddress: smartAccountAddress,
            isWhitelisted: isWhitelisted
        };    
    } catch (error) {
        console.error("❌ 기업 회원가입 중 오류 발생:", error.message);
        
        if (error.reason) {
            console.error("오류 이유:", error.reason);
        }
        if (error.code) {
            console.error("오류 코드:", error.code);
        }
        
        throw error;
    }
};

// 기존 함수도 유지 (개별 테스트용)
const createSmartAccount = async () => {
    const owner = wallet.address
    const transaction = await smartaccount_factory.createAccount(owner); // EOA 기반 스마트 계정 생성
    const result = await transaction.wait();
    console.log(result.hash);

    const smartaccount = await smartaccount_factory.getAccount(owner);
    console.log(`스마트 계정 주소: ${smartaccount}`);
};

// 스마트 계정 존재 여부 확인 함수
const checkExistingAccount = async () => {
    try {
        const owner = wallet.address;
        const existingAccount = await smartaccount_factory.getAccount(owner);
        
        if (existingAccount === ethers.ZeroAddress) {
            console.log("💡 기존 스마트 계정이 없습니다. 새로 생성합니다.");
            return null;
        } else {
            console.log(`⚠️ 이미 스마트 계정이 존재합니다: ${existingAccount}`);
            
            // 승인 상태도 함께 확인
            // const isApproved = await recordUsage.approvedCompanies(existingAccount);
            // console.log(`현재 승인 상태: ${isApproved ? "승인됨" : "승인되지 않음"}`);
            
            // 화이트리스트 상태도 함께 확인
            const isWhitelisted = await paymaster.whiteList(existingAccount);
            console.log(`현재 Paymaster 화이트리스트 상태: ${isWhitelisted ? "화이트리스트됨" : "화이트리스트되지 않음"}`);
            
            return {
                smartAccountAddress: existingAccount,
                isWhitelisted: isWhitelisted
            };
        }
    } catch (error) {
        console.error("기존 계정 확인 중 오류:", error.message);
        return null;
    }
};

// 메인 실행 함수
const main = async () => {
    try {
        // 기존 계정 확인
        const existingAccount = await checkExistingAccount();
        
        if (existingAccount) {
            console.log("기존 계정 정보를 사용합니다.");
            
            let needsUpdate = false;
            
            // 승인 상태 확인 및 처리
            // if (!existingAccount.isApproved) {
            //     console.log("기존 계정을 승인 처리합니다...");
            //     const approvalTransaction = await recordUsage.setCompanyApproval(existingAccount.smartAccountAddress, true);
            //     await approvalTransaction.wait();
            //     console.log("✅ 기존 계정 승인 완료");
            //     needsUpdate = true;
            // }
            
            // 화이트리스트 상태 확인 및 처리
            if (!existingAccount.isWhitelisted) {
                console.log("기존 계정을 Paymaster 화이트리스트에 추가합니다...");
                const addWhitelistTransaction = await paymaster.addWhiteList(existingAccount.smartAccountAddress);
                await addWhitelistTransaction.wait();
                console.log("✅ 기존 계정 Paymaster 화이트리스트 추가 완료");
                needsUpdate = true;
            }
            
            if (!needsUpdate) {
                console.log("✅ 기존 계정이 이미 모든 설정이 완료되어 있습니다.");
            }
        } else {
            // 새로운 계정 생성 및 승인
            await createSmartAccountAndApprove();
        }
    } catch (error) {
        console.error("메인 프로세스 실행 중 오류:", error.message);
    }
};

// 실행
if(require.main === module) {
    main();
}


// 개별 함수들을 모듈로 내보내기
module.exports = {
    createSmartAccount,
    createSmartAccountAndApprove,
    checkExistingAccount,
    createPrivateKey
};