# Daily Reward Processor

하루마다 DB에 저장된 음원 사용 기록을 블록체인 컨트랙트에 전송하는 백엔드 서비스입니다.

## 설치 및 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
```bash
cp .env.example .env.local
# .env.local 파일을 열어서 실제 값으로 수정
```

3. 컨트랙트 배포 (필요한 경우):
- RecordUsage 컨트랙트가 배포되어 있어야 함
- 환경 변수에 컨트랙트 주소 설정

## 실행 방법

### 개발 환경
```bash
# 즉시 테스트 실행
npm run test

# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev

# 일반 실행
npm start
```

### 프로덕션 환경
```bash
# 빌드
npm run build

# 실행
npm run start:prod
```

## 주요 기능

1. **일일 배치 처리**: 매일 00:05에 자동으로 전날 데이터를 처리
2. **DB 쿼리**: `rewards` 테이블에서 `status='pending'`인 데이터를 가져옴
3. **데이터 가공**: 컨트랙트 전송을 위한 형태로 변환
4. **블록체인 전송**: 가공된 데이터를 컨트랙트의 `recordDailyUsage` 함수로 전송
5. **상태 업데이트**: 전송 결과에 따라 DB 상태를 `successed` 또는 `falied`로 업데이트

## 데이터 흐름

1. `rewards` 테이블에서 pending 상태인 데이터 조회
2. 다음 필드들을 추출:
   - `company_id`: 사용한 기업 ID
   - `music_id`: 사용된 음원 ID  
   - `play_id`: DB 비교용 ID
   - `reward_code`: 리워드 지급 여부 (0=무보상, 1=보상, 2=음원한도, 3=기업한도)
   - `created_at`: 사용 시간 (초 단위 타임스탬프로 변환)
3. 컨트랙트 `recordDailyUsage(company_id, music_id, play_id, reward_code, created_at)` 호출
4. 트랜잭션 결과에 따라 DB 상태 업데이트

## 환경 변수

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `INFURA_RPC`: Ethereum RPC 엔드포인트
- `PRIVATE_KEY`: 트랜잭션 서명용 개인키
- `RECORD_USAGE_CONTRACT_ADDRESS`: RecordUsage 컨트랙트 주소

## 주의사항

1. **컨트랙트 ABI**: `src/dailyRewardProcessor.ts`에서 실제 컨트랙트 ABI로 교체 필요
2. **가스 최적화**: 네트워크 상황에 따라 가스비 조정 필요
3. **에러 처리**: 실패한 트랜잭션은 자동으로 `falied` 상태로 마킹
4. **트랜잭션 간격**: 네트워크 부하 방지를 위해 2초 간격으로 전송
