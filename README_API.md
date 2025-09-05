# MPS API 개발자 문서

외부 B2B 파트너가 음원 재생 및 가사 다운로드 기능을 통합하기 위해 필요한 최소·핵심 정보를 제공합니다.

## ✅ 개요
- Base URL: `https://<your-domain>` (개발 환경 예: `http://localhost:3001`)
- 인증: 모든 요청은 `x-api-key` 헤더 필수
- 반환 포맷: 음원/가사는 스트리밍 & 파일, 오류는 JSON `{ message: string }`
- 상태 관리: 서버 발급 `X-Play-Token` 헤더 + 쿠키(`pt`)로 후속 Range 요청 식별 (클라이언트 직접 처리 필요 없음)

## 🔐 인증
| 항목 | 설명 |
|------|------|
| 헤더 | `x-api-key: <발급받은 키>` |
| 등급 | `free`, `standard`, `business` |
| 권한 | 등급별 재생 가능 음원/리워드 정책 다름 |

오류 응답 예시:
```json
{ "statusCode": 401, "message": "API 키가 필요합니다." }
```

## 🎵 음원 재생 API
```
GET /api/music/{music_id}/play
```
### 요청 헤더
| 이름 | 예시 | 비고 |
|------|------|------|
| x-api-key | free_test_... | 필수 |
| Range | bytes=0-1048575 | 브라우저/플레이어가 자동 생성 (첫 요청은 없어도 됨) |
| X-Play-Token | <서버가 이전 응답에서 제공> | 선택 (재생 이어받기) |

### 응답 (Partial Content)
| 헤더 | 설명 |
|------|------|
| Status 206 | Range 전송 |
| Content-Range | `bytes <start>-<end>/<total>` |
| Accept-Ranges | `bytes` |
| Content-Type | `audio/mpeg` |
| X-Play-Token | 재생 토큰 (다음 Range 요청 시 자동 쿠키/헤더로 재사용 가능) |
| Set-Cookie | `pt=<토큰>; Path=/; HttpOnly; SameSite=Lax` |

### 유효재생 판정 로직 (서버 내부)
1. 누적 전송 바이트 ≥ 60% → 즉시 유효재생
2. 또는 누적 ≥ 50% && 경과 시간 ≥ 30초 → 유효재생
3. 최초 유효재생 시 1회만:
   - `music_plays.is_valid_play = true`
   - 월별 리워드 잔량 차감 (가능 시)
   - `rewards` 레코드 1건 생성

클라이언트는 별도 콜백/확인 호출 필요 없음.

### 샘플 (cURL)
```bash
curl -H "x-api-key: <API_KEY>" -H "Range: bytes=0-1048575" \
  -o part1.mp3 \
  http://localhost:3001/api/music/1/play
```

## 📝 가사 다운로드 API
```
GET /api/lyric/{music_id}/download
```
### 특징
- 파일 전체가 전송되면 즉시 유효재생 1건 처리 (use_case='2')
- `use_price = lyrics_price` 로 기록
- 리워드 가능하면 동일 정책으로 차감 및 기록

### 응답
| 헤더 | 값 |
|------|----|
| Status 200 | OK |
| Content-Type | text/plain; charset=utf-8 |
| Content-Disposition | attachment; filename="lyrics_<id>.txt" |

### 샘플 (cURL)
```bash
curl -H "x-api-key: <API_KEY>" \
  -o lyrics_1.txt \
  http://localhost:3001/api/lyric/1/download
```

## 🧾 리워드 코드 정의
| 코드 | 의미 | 지급 여부 |
|------|------|-----------|
| '0' | 리워드 대상 아님 (등급/설정 미충족) | X |
| '1' | 정상 지급 | O |
| '2' | 해당 음원 월 잔여 리워드 소진 | X |
| '3' | 기업 월간 리워드 한도 초과 | X |

## 📂 주요 테이블 (요약)
| 테이블 | 목적 |
|--------|------|
| musics | 음원 메타 및 가격(plays/lyrics) |
| music_plays | 모든 재생/가사 이용 기록 (유효 여부 포함) |
| monthly_music_rewards | 월별 리워드 설정/잔량 |
| rewards | 실제 리워드 지급 내역 (유효재생 시 생성) |

## ⚠️ 에러 처리 패턴
| 상태 | 상황 |
|------|------|
| 401 | API 키 없음/잘못됨 |
| 403 | 등급/구독 조건 불충족 |
| 404 | 음원/가사 없음 |
| 429 | (향후) Rate limit 정책 위반 |
| 500 | 서버 내부 오류 |

## 🔐 보안 권장
- API 키를 브라우저 직접 노출 대신 서버 사이드 프록시 통해 전달
- 토큰(X-Play-Token)은 서버/쿠키로 자동 관리 (수동 캐싱 지양)
- Range 재생을 임의 스크립트로 병렬 남용하지 않도록 모니터링

## 🧪 통합 체크리스트
| 체크 | 설명 |
|------|------|
| ✅ 단일 파일 재생 성공 | 206 응답 수신 & 오디오 플레이 정상 |
| ✅ 60% 이상 진행 | 내부 유효재생 처리 (중복 없음) |
| ✅ 가사 다운로드 | 즉시 유효재생 & rewards 레코드 1건 |
| ✅ 잔량 0 경우 | reward_code '2'로 기록 |
| ✅ 기업 한도 초과 | reward_code '3'로 기록 |

## ❓ FAQ
**Q. 진행도/유효재생 여부를 클라이언트에서 어떻게 알 수 있나요?**  
A. 직접 알 필요 없습니다. 내부적으로 처리되며 rewards/musics 집계 API(별도 제공 예정)로 사후 조회만 하면 됩니다.

**Q. 한 번 유효재생이 된 후 추가 Range 요청이 오면?**  
A. 더 이상 리워드/통계 중복 처리는 발생하지 않습니다.

**Q. 가사 다운로드를 여러 번 해도 리워드가 계속 지급되나요?**  
A. (현재 기본 정책) 매 다운로드마다 1건 처리. 필요 시 중복 제한은 별도 옵션으로 확장 가능합니다.

## 📅 향후 예정
- 집계/통계 전용 REST & WebSocket 스트림
- 리워드 온체인 배치 실행 API
- Rate limiting & Abuse detection

문의: 팀 담당자에게 별도 채널로 연락 주세요.
