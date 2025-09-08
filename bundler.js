const express = require("express");
const {ethers} = require("ethers");
require("dotenv").config({ path: '.env.local' });

const app = express();
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const entryPointAbi = require("./artifacts/contracts/AA/EntryPoint.sol/EntryPoint.json").abi;
const entryPoint = new ethers.Contract(process.env.EntryPoint, entryPointAbi, wallet);

const mempool = [];

app.post("/userop", async (req, res) => {
    try {
        const userOp = req.body;
        mempool.push(userOp);
        res.json({state: 200, message: "트랜잭션 풀 추가 성공"})
    } catch (error) {
        res.json({state: 400, message: "트랜잭션 풀 추가 실패"})
    }
})

// app.get("/mempool", (req, res) => {
//     try {
//         res.json({mempool})
//     } catch (error) {
//         res.json({error})
//     }
// })

const setTimeInterval = (callback, intervalTime) => {
    const loop = async () => {
        const now = Date.now();
        const delay = intervalTime - (now % intervalTime);
        setTimeout(async () => {
            callback();
            loop();
        }, delay)
    }
    loop();
}

const toTuple = (userOp) => {
    return [
        userOp.sender,
        BigInt(userOp.nonce),
        userOp.initCode,
        userOp.callData,
        BigInt(userOp.callGasLimit),
        BigInt(userOp.verificationGasLimit),
        BigInt(userOp.preVerificationGas),
        BigInt(userOp.maxFeePerGas),
        BigInt(userOp.maxPriorityFeePerGas),
        userOp.paymasterAndData,
        userOp.signature,
    ]
}

setTimeInterval(async () => {
    try {
        const ops = mempool.splice(0);
        if(ops.length === 0) return;
        
        console.log(`처리할 UserOp 개수: ${ops.length}`);
        console.log("UserOp 데이터:", JSON.stringify(ops[0], null, 2));
        
        // 실제 트랜잭션 실행 전에 gas estimate 시도
        console.log("Gas estimation 시도 중...");
        

        let gasLimit;
        try {
            const gasEstimate = await entryPoint.handleOps.estimateGas(ops.map(toTuple));
            console.log("예상 가스 사용량:", gasEstimate.toString());
            
            // 가스 한도를 예상 사용량의 200%로 설정 (더 큰 여유분)
            gasLimit = gasEstimate * 200n / 100n;
            
            // 최소 200,000 가스 보장
            if (gasLimit < 200000n) {
                gasLimit = 200000n;
            }
            
            console.log("설정할 가스 한도:", gasLimit.toString());
            
        } catch (gasError) {
            console.log("Gas estimation 실패:", gasError.message);
            
            // 개별 UserOp 검증 시도
            const op = ops[0];
            console.log("개별 UserOp 분석:");
            console.log("- Sender:", op.sender);
            console.log("- Nonce:", op.nonce);
            console.log("- PaymasterAndData:", op.paymasterAndData);
            console.log("- Signature length:", op.signature ? op.signature.length : 0);
            
            // 스마트 계정이 배포되었는지 확인
            const code = await provider.getCode(op.sender);
            console.log("- 스마트 계정 배포 상태:", code === "0x" ? "배포되지 않음" : "배포됨");
            
            // Paymaster 상태 확인
            if (op.paymasterAndData && op.paymasterAndData !== "0x") {
                const paymasterCode = await provider.getCode(op.paymasterAndData);
                console.log("- Paymaster 배포 상태:", paymasterCode === "0x" ? "배포되지 않음" : "배포됨");
                
                // Paymaster 잔액 확인
                const paymasterBalance = await provider.getBalance(op.paymasterAndData);
                console.log("- Paymaster ETH 잔액:", ethers.formatEther(paymasterBalance), "ETH");
            }
            
            // EntryPoint에서 nonce 확인
            const currentNonce = await entryPoint.nonces(op.sender);
            console.log("- EntryPoint nonce:", currentNonce.toString());
            console.log("- UserOp nonce:", op.nonce);
            
            return; // gas estimation 실패 시 실행 중단
        }
        
        // 실제 트랜잭션 실행
        const transaction = await entryPoint.handleOps(ops.map(toTuple), {
            gasLimit: gasLimit  // 증가된 가스 한도 사용
        });
        console.log(`트랜잭션 해시: ${transaction.hash}`)
        
        const receipt = await transaction.wait();
        console.log(`트랜잭션 완료: ${receipt.status === 1 ? "성공" : "실패"}`);
        
    } catch (error) {
        console.log("=== Bundler 에러 상세 정보 ===");
        console.log("에러 메시지:", error.message);
        console.log("에러 코드:", error.code);
        if (error.reason) console.log("에러 이유:", error.reason);
        if (error.transaction) {
            console.log("실패한 트랜잭션:", error.transaction);
        }
        console.log("=== 에러 끝 ===");
    }
}, 10000)

app.listen(4000, () => {
    console.log("서버가 켜졌습니다.")
})


