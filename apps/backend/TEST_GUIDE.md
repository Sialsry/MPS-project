# MPS Music API 테스트 가이드

## 🚀 서버 시작
```bash
cd apps/backend
npm run start:dev
```

## 📊 더미 데이터 정보

### 🏢 테스트 회사 계정
| 등급 | 회사명 | 이메일 | API 키 |
|------|--------|--------|--------|
| Free | 테스트 프리 컴퍼니 | free@test.com | `free_test_api_key_64_characters_long_string_for_testing_purpose` |
| Standard | 스탠다드 미디어 | standard@test.com | `standard_test_api_key_64_characters_long_string_for_testing` |
| Business | 비즈니스 엔터테인먼트 | business@test.com | `business_test_api_key_64_characters_long_string_for_testing` |

### 🎵 테스트 음원 목록
| ID | 제목 | 아티스트 | 등급 | Inst | 설명 |
|----|------|----------|------|------|------|
| 1 | 테스트 발라드 | 김가수 | 0 (Free) | No | 모든 등급 재생 가능 |
| 2 | Standard Only 힙합 | 랩퍼A | 1 (Standard+) | No | Standard 이상만 재생 가능 |
| 3 | Business Only 록 | 록밴드 | 2 (Business) | No | Business만 재생 가능 |
| 4 | 인스트루멘탈 재즈 | 재즈트리오 | 0 (Free) | Yes | 인스트루멘탈, 가사 없음 |
| 5 | EDM 댄스트랙 | DJ Producer | 1 (Standard+) | No | Standard 이상만 재생 가능 |

## 🧪 API 테스트 예제

### 1. 음원 재생 테스트

#### ✅ 성공 케이스 - Free 등급으로 Free 음원 재생
```bash
curl -X GET "http://localhost:3001/api/music/1/play" \
  -H "x-api-key: free_test_api_key_64_characters_long_string_for_testing_purpose"
```

#### ✅ 성공 케이스 - Standard 등급으로 Standard 음원 재생
```bash
curl -X GET "http://localhost:3001/api/music/2/play" \
  -H "x-api-key: standard_test_api_key_64_characters_long_string_for_testing"
```

#### ❌ 실패 케이스 - Free 등급으로 Standard 음원 재생 시도
```bash
curl -X GET "http://localhost:3001/api/music/2/play" \
  -H "x-api-key: free_test_api_key_64_characters_long_string_for_testing_purpose"
```
예상 결과: `403 Forbidden - 재생 권한이 없습니다.`

#### ❌ 실패 케이스 - 잘못된 API 키
```bash
curl -X GET "http://localhost:3001/api/music/1/play" \
  -H "x-api-key: invalid_api_key"
```
예상 결과: `401 Unauthorized - 유효하지 않은 API 키입니다.`

### 2. 가사 다운로드 테스트

#### ✅ 성공 케이스 - 가사가 있는 음원
```bash
curl -X GET "http://localhost:3001/api/music/1/lyric/download" \
  -H "x-api-key: free_test_api_key_64_characters_long_string_for_testing_purpose" \
  -o "downloaded_lyrics.txt"
```
**결과**: 
- 가사 파일 다운로드 성공
- `music_plays` 테이블에 `use_case = '2'` 기록
- `lyrics_download_count`는 변경되지 않음 (플랫폼 내 조회용이므로)

#### ❌ 실패 케이스 - 인스트루멘탈 음원 (가사 없음)
```bash
curl -X GET "http://localhost:3001/api/music/4/lyric/download" \
  -H "x-api-key: free_test_api_key_64_characters_long_string_for_testing_purpose"
```
예상 결과: `404 Not Found - 가사 파일이 없습니다.`

## 💡 PowerShell 테스트 예제

### 음원 재생 (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/music/1/play" `
  -Headers @{"x-api-key"="free_test_api_key_64_characters_long_string_for_testing_purpose"} `
  -Method GET
```

### 가사 다운로드 (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/music/1/lyric/download" `
  -Headers @{"x-api-key"="free_test_api_key_64_characters_long_string_for_testing_purpose"} `
  -Method GET -OutFile "lyrics.txt"
```

## 🔍 리워드 시스템 테스트

### Standard/Business 등급 리워드 확인
1. Standard 또는 Business API 키로 음원 재생
2. 60초 이상 재생하여 유효 재생 처리
3. 데이터베이스에서 `music_plays` 테이블 확인
4. `reward_code = '1'`, `reward_amount = '10'` 확인

### 리워드 한도 테스트
- Standard/Business 등급: 월 5,000회 리워드 한도
- 한도 초과 시 `reward_code = '3'` 반환

## 📂 파일 경로
- 음원 파일: `apps/backend/storage/music/`
- 가사 파일: `apps/backend/storage/lyrics/`

## 🗄️ 데이터베이스 확인

### 재생 기록 확인
```sql
SELECT * FROM music_plays ORDER BY played_at DESC LIMIT 10;
```

### 외부 가사 다운로드 확인
```sql
SELECT * FROM music_plays WHERE use_case = '2' ORDER BY played_at DESC;
```

### 플랫폼 내 가사 조회 확인
```sql
SELECT id, title, lyrics_download_count FROM musics;
```

### 리워드 내역 확인
```sql
SELECT * FROM music_plays WHERE reward_code = '1' ORDER BY played_at DESC;
```

### 회사별 총 리워드 확인
```sql
SELECT name, total_rewards_earned FROM companies;
```

## 🔧 개발 도구

### 데이터베이스 스튜디오 실행
```bash
npm run db:studio
```

### 더미 데이터 재생성
```bash
# 기존 데이터 삭제 후 재생성
npm run db:seed
```

## 📊 모니터링

서버 실행 시 콘솔에서 다음 로그를 확인할 수 있습니다:
- 재생 세션 시작/종료
- 리워드 지급 내역
- 가사 다운로드 기록
- API 오류 로그

## 🚨 일반적인 문제 해결

### 1. 서버 연결 안됨
- 서버가 실행 중인지 확인: `npm run start:dev`
- 포트 3001이 사용 중인지 확인

### 2. API 키 오류
- API 키가 정확한 64자리 16진수 문자열인지 확인
- 대소문자 구분하여 정확히 입력

### 3. 파일 없음 오류
- `storage/music/`, `storage/lyrics/` 디렉터리와 파일들이 존재하는지 확인
- 시드 스크립트로 더미 파일 재생성: `npm run db:seed`

### 4. 권한 오류
- 회사 등급과 음원 등급 확인
- 구독 상태 확인 (Standard/Business는 활성 구독 필요)

## 📈 성능 테스트

### 동시 요청 테스트
```bash
# Apache Bench 사용 예제
ab -n 100 -c 10 -H "x-api-key: free_test_api_key_64_characters_long_string_for_testing_purpose" \
  http://localhost:3001/api/music/1/play
```

### 부하 테스트 시나리오
1. 여러 API 키로 동시 요청
2. 다양한 음원에 대한 순차적 요청
3. 리워드 한도 도달 테스트
4. 유효/무효 재생 패턴 테스트
