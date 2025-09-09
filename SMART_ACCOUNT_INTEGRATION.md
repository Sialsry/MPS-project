# 스마트 계정 통합 가이드

회원가입 시 스마트 계정이 자동으로 생성되도록 백엔드를 수정했습니다.

## 변경 사항

### 1. 새로운 파일들

- `apps/backend/src/client/companies/blockchain.service.ts`: 블록체인 관련 로직 처리
- `apps/backend/src/client/companies/abi/SmartAccountFactory.json`: 스마트 계정 팩토리 ABI
- `.env.example`: 필요한 환경변수 예시

### 2. 수정된 파일들

- `companies.service.ts`: 회원가입 시 스마트 계정 생성 로직 추가
- `companies.controller.ts`: 스마트 계정 관련 엔드포인트 추가
- `companies.module.ts`: BlockchainService 의존성 추가
- `companies.repository.ts`: 스마트 계정 주소 업데이트 메서드 추가

### 3. 환경변수 설정

`.env` 파일에 다음 변수들을 추가해야 합니다:

```env
# 블록체인 설정 (스마트 계정 생성용)
INFURA_RPC=https://sepolia.infura.io/v3/your_project_id
PRIVATE_KEY=your_private_key_here
SmartAccountFactory=0x_your_smart_account_factory_address
```

## API 엔드포인트

### 1. 회원가입 (기존 개선)
- **POST** `/companies/register`
- 기존 회원가입 기능에 스마트 계정 생성이 추가됨
- 응답에 블록체인 정보가 포함됨:

```json
{
  "id": 1,
  "name": "회사명",
  "email": "test@example.com",
  "grade": "free",
  "created_at": "2025-09-09T...",
  "api_key": "평문_API_키",
  "api_key_hint": "abcd...1234",
  "blockchain": {
    "eoaAddress": "0x...",
    "smartAccountAddress": "0x...",
    "transactionHash": "0x..."
  }
}
```

### 2. 스마트 계정 생성/조회 (새로 추가)
- **POST** `/companies/:id/smart-account`
- 기존 회원의 스마트 계정을 생성하거나 조회

## 동작 방식

### 회원가입 시 스마트 계정 생성

1. **개인키 생성**: `email + 사업자번호`로 고유한 개인키 생성
2. **EOA 주소 생성**: 개인키에서 EOA(Externally Owned Account) 주소 도출
3. **스마트 계정 확인**: 해당 EOA에 대한 스마트 계정이 이미 존재하는지 확인
4. **스마트 계정 생성**: 없으면 새로 생성, 있으면 기존 주소 사용
5. **DB 저장**: `companies` 테이블의 `smart_account_address` 필드에 저장

### 오류 처리

- 스마트 계정 생성 실패 시에도 회원가입은 계속 진행됨 (소프트 실패)
- 로그에 오류 내용이 기록됨
- 필요 시 나중에 별도 엔드포인트로 스마트 계정 생성 가능

## 설치 및 실행

1. **의존성 설치**:
   ```bash
   cd apps/backend
   npm install ethers
   ```

2. **환경변수 설정**:
   ```bash
   cp .env.example .env
   # .env 파일을 편집해서 실제 값들을 입력
   ```

3. **빌드 및 실행**:
   ```bash
   npm run build
   npm run start:dev
   ```

## 보안 고려사항

1. **개인키 생성**: 현재는 고정 salt를 사용하지만, 실제 운영에서는 더 안전한 방법 고려
2. **환경변수**: `PRIVATE_KEY` 등 민감한 정보는 안전하게 관리
3. **가스비**: 스마트 계정 생성 시 가스비가 발생하므로 paymaster 지갑에 충분한 ETH 필요

## 테스트

회원가입 API를 호출해서 스마트 계정이 정상적으로 생성되는지 확인:

```bash
curl -X POST http://localhost:3000/companies/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 회사",
    "business_number": "123-45-67890",
    "email": "test@example.com",
    "password": "password123"
  }'
```
