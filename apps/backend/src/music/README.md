# Music API 사용 가이드

## 개요
MPS 플랫폼의 음원 재생 및 가사 다운로드 API입니다.

## 인증
모든 API 요청에는 `x-api-key` 헤더가 필요합니다.

```http
x-api-key: your-64-character-hex-api-key
```

## API 엔드포인트

### 1. 음원 재생
```http
GET /api/music/{music_id}/play
```

#### Headers
- `x-api-key`: API 키 (필수)
- `user-agent`: 클라이언트 정보 (선택)
- `range`: HTTP Range 요청 (선택, 스트리밍용)

#### Response
- **200 OK**: 음원 스트리밍 데이터
- **206 Partial Content**: Range 요청 시 부분 데이터
- **401 Unauthorized**: 유효하지 않은 API 키
- **403 Forbidden**: 재생 권한 없음
- **404 Not Found**: 음원 없음

#### 예시
```bash
curl -X GET "http://localhost:3001/api/music/1/play" \
  -H "x-api-key: your-api-key" \
  -H "user-agent: MyApp/1.0"
```

### 2. 가사 다운로드
```http
GET /api/music/{music_id}/lyric/download
```

#### 동작 설명
- 외부 API를 통한 가사 파일 다운로드
- `music_plays` 테이블에 `use_case = '2'` (가사 이용)로 기록
- `lyrics_download_count`는 증가하지 않음 (플랫폼 내 조회용이므로)
- 유효 재생으로 처리되어 리워드 지급 대상

#### Headers
- `x-api-key`: API 키 (필수)
- `user-agent`: 클라이언트 정보 (선택)

#### Response
- **200 OK**: 가사 파일 다운로드
- **401 Unauthorized**: 유효하지 않은 API 키
- **403 Forbidden**: 다운로드 권한 없음
- **404 Not Found**: 음원 또는 가사 파일 없음

#### 예시
```bash
curl -X GET "http://localhost:3001/api/music/1/lyric/download" \
  -H "x-api-key: your-api-key" \
  -o "song_lyrics.txt"
```

## 등급별 제한사항

### Free 등급
- 월 1,000회 재생 제한
- Grade 0 음원만 이용 가능
- 리워드 지급 없음

### Standard 등급
- 월 10,000회 재생 제한
- Grade 0-1 음원 이용 가능
- 유효 재생 시 리워드 지급
- 구독료 납부 필요

### Business 등급
- 월 100,000회 재생 제한
- 모든 음원 이용 가능
- 유효 재생 시 리워드 지급
- 구독료 납부 필요

## 유효 재생 조건
- **음원 재생**: 60초 이상 연속 재생
- **가사 다운로드**: 파일 다운로드 완료

## 리워드 시스템
- 유효 재생 시 음원별 단가에 따른 리워드 지급
- 매일 자정 일괄 처리 (블록체인 기록)
- 월간 구독료 할인에 사용 가능

## 에러 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | API 키 없음 또는 유효하지 않음 |
| 403 | Forbidden | 권한 없음 (등급, 구독 상태) |
| 404 | Not Found | 음원 또는 파일 없음 |
| 429 | Too Many Requests | 요청 제한 초과 |
| 500 | Internal Server Error | 서버 오류 |

## 개발 환경 설정

### 1. 환경 변수 설정
```env
# .env 파일
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/mps_database"
MUSIC_STORAGE_PATH="./storage/music"
LYRIC_STORAGE_PATH="./storage/lyrics"
```

### 2. 디렉토리 구조
```
apps/backend/
├── storage/
│   ├── music/          # 음원 파일
│   └── lyrics/         # 가사 파일
├── src/
│   └── music/
│       ├── music.controller.ts
│       ├── music.service.ts
│       ├── api-key.service.ts
│       └── music.module.ts
```

### 3. 서버 실행
```bash
cd apps/backend
npm install
npm run start:dev
```

## 가사 통계 구분

### 플랫폼 내 가사 조회
- **저장 위치**: `musics.lyrics_download_count`
- **용도**: 라이브러리 플랫폼 내에서 가사를 조회한 횟수
- **증가 조건**: 플랫폼 UI에서 가사 보기 클릭 시

### 외부 API 가사 다운로드
- **저장 위치**: `music_plays` 테이블 (`use_case = '2'`)
- **용도**: API를 통해 외부에서 가사 파일을 다운로드한 횟수
- **증가 조건**: `/api/music/{id}/lyric/download` API 호출 시
- **특징**: 유효 재생으로 처리되어 리워드 지급 대상

## 모니터링
- 모든 재생 기록은 `music_plays` 테이블에 저장
- 실시간 통계는 관리자 대시보드에서 확인
- 블록체인 기록은 Sepolia 테스트넷에 저장

## 보안 고려사항
- API 키는 SHA-256으로 해시화하여 저장
- 파일 경로 검증으로 디렉토리 트래버설 방지
- Rate limiting 구현 권장
- HTTPS 사용 필수 (프로덕션)
