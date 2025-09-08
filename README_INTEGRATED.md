# Daily Blockchain Record & Reward System

자동화된 일일 블록체인 기록 및 리워드 토큰 지급 시스템입니다.

## 🎯 시스템 개요

이 시스템은 매일 밤 12시 10분에 자동으로 다음 작업을 수행합니다:

1. **음원 사용 내역 배치 기록**: rewards 테이블의 pending 상태 데이터를 블록체인에 일괄 기록
2. **리워드 토큰 배치 지급**: reward_code=1인 기록들을 회사별로 집계하여 ERC20 토큰 지급

## 🏗 시스템 구조

### Backend (NestJS)
- **RecordService**: 데이터베이스 조회 및 상태 관리
- **SchedulerService**: 자동화된 스케줄링 및 블록체인 처리
- **TestController**: 수동 실행 및 시스템 상태 확인 API

### Smart Contracts (Solidity)
- **RecordUsage.sol**: 음원 사용 내역 기록 및 리워드 처리 통합 컨트랙트
- **RewardToken2.sol**: ERC20 기반 리워드 토큰 컨트랙트

## 🚀 설치 및 설정

### 1. 환경 설정

`.env` 파일을 생성하고 다음 값들을 설정하세요:

```bash
# 블록체인 네트워크 설정
INFURA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=YOUR_PRIVATE_KEY_WITHOUT_0x

# 스마트 컨트랙트 주소 (배포 후 설정)
RECORD_USAGE_CONTRACT_ADDRESS=0xYourRecordUsageContractAddress
REWARD_TOKEN_CONTRACT_ADDRESS=0xYourRewardTokenContractAddress

# 데이터베이스 설정
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### 2. 스마트 컨트랙트 배포

```bash
# 통합 배포 (RewardToken2 + RecordUsage)
npx hardhat run scripts/deploy-integrated.js --network sepolia

# 배포 후 출력된 주소들을 .env 파일에 추가
```

### 3. Backend 실행

```bash
cd apps/backend
npm install
npm run start:dev
```

## 📊 API 엔드포인트

### 테스트 및 모니터링 API

```bash
# 시스템 상태 확인
GET /test/system-status

# 일일 사용량 조회
GET /test/daily-usage?status=pending&date=2024-01-15

# 리워드 집계 조회
GET /test/reward-aggregation?date=2024-01-15

# 회사별 리워드 조회
GET /test/company-rewards?companyId=1&date=2024-01-15

# 수동 배치 실행
POST /test/manual-batch
{
  "targetDate": "2024-01-15"  // 선택사항
}

# 수동 리워드 처리
POST /test/manual-reward
{
  "targetDate": "2024-01-15"  // 선택사항
}
```

## 🔧 테스트

### 스마트 컨트랙트 통합 테스트

```bash
# 컨트랙트 기능 테스트
npx hardhat run scripts/test-integrated.js --network sepolia
```

### Backend API 테스트

```bash
# 시스템 상태 확인
curl http://localhost:3000/test/system-status

# 수동 실행 테스트
curl -X POST http://localhost:3000/test/manual-batch \
  -H "Content-Type: application/json" \
  -d '{"targetDate": "2024-01-15"}'
```

## 📈 모니터링

### 스케줄러 로그 확인

시스템은 매일 밤 12시 10분에 자동 실행되며, 다음 로그를 출력합니다:

```
=== 일일 블록체인 기록 스케줄러 시작 ===
처리 대상 날짜: Mon Jan 15 2024
처리할 레코드 수: 150
배치 처리 성공 - 총 150개 레코드, TX: 0x1234...
=== 리워드 토큰 배치 처리 시작 ===
리워드 지급 대상: 5개 회사
리워드 토큰 배치 지급 완료 - TX: 0x5678...
=== 일일 블록체인 기록 스케줄러 완료 ===
```

### 데이터베이스 상태 확인

```sql
-- 일일 처리 현황
SELECT 
    DATE(created_at) as date,
    status,
    COUNT(*) as count,
    SUM(CASE WHEN reward_code = '1' THEN amount ELSE 0 END) as total_reward_amount
FROM rewards 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at), status
ORDER BY date DESC, status;

-- 회사별 리워드 현황
SELECT 
    company_id,
    COUNT(*) as reward_count,
    SUM(amount) as total_amount,
    status
FROM rewards 
WHERE reward_code = '1' AND created_at >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY company_id, status;
```

## 🔄 작업 흐름

### 일일 자동 처리 (매일 12:10 AM)

1. **데이터 조회**: 전날의 pending 상태 rewards 레코드 조회
2. **배치 기록**: RecordUsage 컨트랙트로 사용 내역 일괄 전송
3. **상태 업데이트**: 성공한 레코드들을 successed 상태로 변경
4. **리워드 집계**: reward_code=1인 레코드들을 회사별로 집계
5. **토큰 지급**: RewardToken2를 통해 배치로 토큰 민팅 및 지급
6. **완료 처리**: 리워드 레코드 상태 업데이트

### 수동 실행

개발 및 테스트 목적으로 언제든지 수동 실행 가능:

```bash
# 특정 날짜 배치 처리
curl -X POST http://localhost:3000/test/manual-batch \
  -H "Content-Type: application/json" \
  -d '{"targetDate": "2024-01-15"}'

# 리워드만 별도 처리
curl -X POST http://localhost:3000/test/manual-reward \
  -H "Content-Type: application/json" \
  -d '{"targetDate": "2024-01-15"}'
```

## 🚨 주의사항

### 보안
- 프라이빗 키는 절대 코드에 하드코딩하지 마세요
- 프로덕션 환경에서는 `.env` 파일 권한을 제한하세요
- 테스트 API는 프로덕션에서 비활성화하세요

### 가스비 최적화
- 배치 크기를 조정하여 가스 한도 내에서 처리
- 가스 가격을 네트워크 상황에 맞게 조정
- 트랜잭션 실패 시 재시도 로직 구현

### 데이터 정합성
- 블록체인 기록 전 데이터 검증
- 트랜잭션 실패 시 롤백 처리
- 중복 처리 방지 메커니즘

## 📋 Requirements

- Node.js 18+
- PostgreSQL 13+
- Hardhat
- NestJS 9+
- ethers.js 6+

## 🤝 Contributing

1. 새로운 기능 추가 시 테스트 코드 작성
2. 가스 사용량 최적화 고려
3. 로그 및 모니터링 추가
4. 문서 업데이트

## 📄 License

MIT License
