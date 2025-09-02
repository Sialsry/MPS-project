# MPS (Music Platform Service)
## 블록체인 기반 B2B 음원 라이브러리 & 실시간 모니터링 플랫폼

MPS는 기업들이 음원을 안전하고 투명하게 이용할 수 있도록 돕는 B2B 플랫폼입니다. 블록체인 기술을 활용하여 음원 사용 내역을 투명하게 추적하고, 유효 재생에 대한 리워드 시스템을 제공합니다.

## 🎯 핵심 기능

### 📡 API 기반 음원 서비스
- **음원 스트리밍**: `GET /api/music/{music_id}/play`
- **Range 요청 지원**: HTTP Range 헤더를 통한 부분 다운로드
- **가사 다운로드**: `GET /api/lyric/{music_id}/download`
- API 키 기반 인증 및 권한 관리
- 등급별 차별화된 서비스 제공
- 서버 기반 실시간 재생 추적

### 🎵 Range 기반 재생 추적 시스템
- **단일 API 구조**: GET 요청만으로 재생 추적 완료
- **Range 요청 분석**: 클라이언트의 HTTP Range 패턴으로 재생 진행도 파악
- **자동 세션 관리**: 브라우저의 자연스러운 스트리밍 동작 활용
- **유효재생 판정**: 파일의 60% 이상 요청 시 리워드 지급 대상
- **실시간 추적**: 각 Range 요청마다 서버에서 진행도 계산

### 🔐 등급별 서비스 체계
- **Free**: 제한된 음원, 리워드 없음
- **Standard/Business**: 전체 음원 이용, 리워드 지급, 월간 구독제

### ⛓️ 블록체인 트래킹
- 유효 재생 조건: 60초 이상 재생 또는 가사 파일 전송 완료
- Sepolia 테스트넷 기반 투명한 사용 내역 기록
- ERC20 토큰 리워드 시스템

### 📊 실시간 모니터링
- 음원 사용 현황 실시간 추적
- 기업별/음원별 상세 통계
- 관리자 대시보드를 통한 종합 모니터링

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Web    │    │   Admin Web     │    │   External APIs │
│   (Next.js)     │    │   (Next.js)     │    │   (3rd party)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────────────────────────────┐
          │            Backend API Server                │
          │              (NestJS)                       │
          └─────────────────────┬───────────────────────┘
                                │
          ┌─────────────────────┼───────────────────────┐
          │                     │                       │
    ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
    │PostgreSQL │         │Blockchain │         │File Store │
    │ Database  │         │(Sepolia)  │         │  (AWS S3) │
    └───────────┘         └───────────┘         └───────────┘
```

## 🛠️ 기술 스택

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT, API Key
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Language**: TypeScript

### DevOps
- **Deployment**: AWS (예정)
- **Version Control**: Git
- **Package Manager**: npm/pnpm

## 📁 프로젝트 구조

```
MPS-project/
├── apps/
│   ├── backend/                 # NestJS API 서버
│   │   ├── src/
│   │   │   ├── db/             # 데이터베이스 스키마 & 설정
│   │   │   │   └── schema/     # Drizzle 스키마 정의
│   │   │   ├── controllers/    # API 컨트롤러
│   │   │   ├── services/       # 비즈니스 로직
│   │   │   └── main.ts         # 애플리케이션 엔트리포인트
│   │   └── drizzle/           # 데이터베이스 마이그레이션
│   └── frontend/
│       ├── admin/              # 관리자 웹 대시보드
│       └── client/             # 클라이언트 웹 페이지
└── package.json
```

## 🗄️ 데이터베이스 스키마

### 핵심 엔티티
- **Companies**: 기업 정보 및 구독 상태
- **Musics**: 음원 메타데이터 및 파일 정보
- **Music_plays**: 음원 재생 기록 및 유효성 검증
- **Rewards**: 리워드 지급 내역
- **Playlists**: 기업별 음원 재생 목록

### 주요 관계
- 기업 ↔ 음원 재생 (N:N)
- 음원 ↔ 카테고리/태그 (N:N)
- 재생 기록 → 리워드 (1:1, 유효 재생 시)

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- PostgreSQL 14+
- npm 또는 pnpm

### 개발 환경 설정

1. **저장소 클론**
```bash
git clone https://github.com/Sialsry/MPS-project.git
cd MPS-project
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env.local 파일 생성
cp .env.example .env.local
```

4. **데이터베이스 설정**
```bash
cd apps/backend
npm run db:generate
npm run db:migrate
```

5. **개발 서버 실행**
```bash
# Backend (포트 3001)
cd apps/backend
npm run start:dev

# Admin Dashboard (포트 4001)
cd apps/frontend/admin
npm run dev
```

## 📋 API 사용 가이드

### 인증
모든 API 요청에는 `x-api-key` 헤더가 필요합니다.

### 음원 재생 (Range 요청 기반)

#### 기본 사용법
```http
GET /api/music/{music_id}/play
Headers:
  x-api-key: YOUR_API_KEY

Response Headers:
  X-Session-ID: 12345  # 재생 세션 고유 ID
  X-Progress: 25       # 현재 재생 진행도 (%)
```

#### Range 요청 자동 처리
브라우저의 오디오 플레이어는 자동으로 HTTP Range 요청을 보냅니다:

```http
GET /api/music/{music_id}/play
Headers:
  x-api-key: YOUR_API_KEY
  Range: bytes=0-1023    # 첫 번째 청크

Response:
  Status: 206 Partial Content
  Content-Range: bytes 0-1023/5242880
  X-Session-ID: 12345
  X-Progress: 0
```

```http
GET /api/music/{music_id}/play
Headers:
  x-api-key: YOUR_API_KEY
  Range: bytes=1024-2047  # 두 번째 청크

Response:
  Status: 206 Partial Content
  Content-Range: bytes 1024-2047/5242880
  X-Session-ID: 12345
  X-Progress: 15
```

#### 유효재생 자동 판정
```http
GET /api/music/{music_id}/play
Headers:
  x-api-key: YOUR_API_KEY
  Range: bytes=3145728-  # 파일의 60% 이상 요청

Response:
  Status: 206 Partial Content
  X-Session-ID: 12345
  X-Progress: 65         # 60% 이상 → 자동으로 유효재생 처리
```

### 가사 다운로드
```http
GET /api/lyric/{music_id}/download
Headers:
  x-api-key: YOUR_API_KEY
```

### 클라이언트 구현 예시

```html
<!-- 단순한 HTML 오디오 태그만으로 추적 가능 -->
<audio controls>
  <source src="/api/music/123/play" type="audio/mpeg">
</audio>

<script>
// 별도 JavaScript 코드 없이 자동 추적
// 브라우저가 Range 요청을 자동으로 보내고
// 서버에서 재생 진행도를 실시간 추적
</script>
```

### 고급 모니터링 (선택사항)
```javascript
// 진행도를 실시간으로 모니터링하려면:
const audio = document.querySelector('audio');
const sessionId = null;

audio.addEventListener('loadstart', async () => {
  // 첫 번째 요청에서 세션 ID 추출
  const response = await fetch(audio.src, { 
    method: 'HEAD',
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  sessionId = response.headers.get('X-Session-ID');
  console.log('세션 시작:', sessionId);
});

// 60% 이상 재생 시 서버에서 자동으로 유효재생 처리됨
// 클라이언트에서 별도 처리 불필요
```

## 💰 리워드 시스템

### 유효 재생 조건
- **음원 재생**: 파일의 60% 이상 Range 요청 시 자동 인정
- **가사 이용**: 파일 다운로드 완료
- **자동 추적**: 서버에서 Range 요청 패턴 분석으로 진행도 계산

### Range 기반 재생 추적 원리
1. **초기 요청**: 클라이언트가 음원 재생 시작
2. **Range 요청들**: 브라우저가 자동으로 파일을 청크 단위로 요청
3. **진행도 계산**: 서버에서 요청된 바이트 범위로 재생 진행도 산출
4. **자동 판정**: 60% 이상 진행 시 유효재생으로 자동 처리

### 장점
- **구현 단순성**: 클라이언트에서 별도 JavaScript 코드 불필요
- **정확성**: 실제 다운로드된 데이터 기반 추적
- **자연스러움**: 브라우저의 기본 동작 활용

### 리워드 지급
- **주기**: 매일 자정 일괄 처리
- **토큰**: ERC20 기반 리워드 토큰
- **용도**: 월간 구독료 할인
- **투명성**: 모든 지급 내역 블록체인 기록

## 📊 모니터링 & 통계

### 실시간 대시보드
- 현재 재생 중인 음원 현황
- 일/월별 사용량 통계
- 기업별 이용 패턴 분석

### 블록체인 투명성
- 모든 유효 재생 블록체인 기록
- 리워드 지급 내역 추적 가능
- 위변조 불가능한 사용 증명

## 🔧 개발 도구

### 데이터베이스
```bash
# 스키마 생성
npm run db:generate

# 마이그레이션 실행
npm run db:migrate

# DB 스튜디오 실행
npm run db:studio
```

### 테스트
```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e
```

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 연락처

- **Repository**: [MPS-project](https://github.com/Sialsry/MPS-project)
- **Issues**: [GitHub Issues](https://github.com/Sialsry/MPS-project/issues)

---

> **Note**: 현재 개발 단계로 Sepolia 테스트넷을 사용하고 있습니다. 메인넷 배포 시 별도 공지 예정입니다.