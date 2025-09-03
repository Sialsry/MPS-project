'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'

type Props = { 
  open: boolean; 
  onClose: () => void; 
  title?: string;
  musicData?: {
    id?: string;
    title: string;
    artist: string;
    category?: string;
    genre?: string;
    tags?: string;
    releaseDate?: string;
    releaseYear?: number;
    durationSec?: number;
    musicType?: '일반' | 'Inst' | '가사만';
    priceMusicOnly?: number;
    priceLyricsOnly?: number;
    priceBoth?: number;
    rewardPerPlay?: number;
    maxPlayCount?: number;
    accessTier?: 'all' | 'subscribed';
    lyricist?: string;
    composer?: string;
    arranger?: string;
    isrc?: string;
    coverImageUrl?: string;
    createdAt?: string;
    lyricsText?: string;
    lyricsFilePath?: string;
  }
}

export default function MusicStatsModal({ open, onClose, title = '음원 상세', musicData }: Props) {
  const [showLyricsModal, setShowLyricsModal] = useState(false)
  
  const formatDateHyphen = (s?: string) => {
    if (!s) return '-'
    const d = new Date(s)
    if (isNaN(d.getTime())) return '-'
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-7xl rounded-2xl border border-white/10 bg-neutral-900/90 text-white shadow-2xl backdrop-blur-md max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-teal-300">음원 상세 정보</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/15 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          {/* 음원 상세 정보 */}
          <div className="grid gap-6 mb-6">
            <Card>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-4 w-1.5 rounded bg-teal-300" />
                  <div className="text-lg font-semibold">음원 기본 정보</div>
                </div>
                <div className="flex gap-8 items-stretch">
                  {/* 음원 커버 이미지 */}
                  <div className="flex-shrink-0">
                    <div className="h-full min-h-[16rem] max-w-[22rem] rounded-lg border border-white/10 overflow-hidden bg-white/5 self-stretch">
                      {musicData?.id ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${musicData.id}/cover`} 
                          alt={`${musicData.title} 커버`}
                          className="h-full w-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              target.nextElementSibling.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${musicData?.id ? 'hidden' : ''}`}>
                        <div className="text-center">
                          <svg className="w-20 h-20 mx-auto text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <div className="text-xs text-white/40">음원 커버</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-white/60 mb-1">음원명</div>
                        <div className="text-white font-medium">{musicData?.title || title}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">아티스트</div>
                        <div className="text-white font-medium">{musicData?.artist || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">음원 ID</div>
                        <div className="text-white font-medium">{musicData?.id || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">카테고리</div>
                        <div className="text-white font-medium">{musicData?.category || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">음원 유형</div>
                        <div className="text-white font-medium">
                          {(musicData?.musicType ?? '일반') === 'Inst' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">Inst</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/15 text-teal-300 border border-teal-500/30">일반</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">재생 시간</div>
                        <div className="text-white font-medium">
                          {typeof musicData?.durationSec === 'number' ? 
                            `${Math.floor(musicData.durationSec / 60)}분 ${musicData.durationSec % 60}초` : 
                            '-'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">발매일</div>
                        <div className="text-white font-medium">
                          {formatDateHyphen(musicData?.releaseDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">ISRC</div>
                        <div className="text-white font-medium font-mono">{musicData?.isrc || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">작사자</div>
                        <div className="text-white font-medium">{musicData?.lyricist || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">작곡자</div>
                        <div className="text-white font-medium">{musicData?.composer || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">편곡자</div>
                        <div className="text-white font-medium">{musicData?.arranger || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">참고가격</div>
                        <div className="text-white font-medium text-xs">
                          {(musicData?.musicType ?? '일반') === 'Inst'
                            ? `${musicData?.priceMusicOnly ?? 3}원`
                            : `${musicData?.priceMusicOnly ?? 7}원, ${musicData?.priceLyricsOnly ?? 2}원`}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">호출당 리워드</div>
                        <div className="text-white font-medium">{typeof musicData?.rewardPerPlay === 'number' ? `${musicData.rewardPerPlay} 토큰` : '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">월 최대 한도</div>
                        <div className="text-white font-medium">{typeof musicData?.maxPlayCount === 'number' ? `${musicData.maxPlayCount.toLocaleString()} 회` : '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">태그</div>
                        <div className="text-white font-medium break-words">{musicData?.tags?.trim() ? musicData.tags : '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">정규화 태그</div>
                        <div className="text-white font-medium break-words">{(musicData as any)?.normalizedTags?.trim() ? (musicData as any).normalizedTags : '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">API 접근 권한</div>
                        <div className="text-white font-medium">
                          {musicData?.accessTier === 'all' ? (
                            <div className="flex gap-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                Free
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                Standard
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Business
                              </span>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Business
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                Standard
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">등록일</div>
                        <div className="text-white font-medium">
                          {formatDateHyphen(musicData?.createdAt)}
                        </div>
                      </div>
                      {musicData?.musicType !== 'Inst' && (
                        <div>
                          <div className="text-white/60 mb-1">가사</div>
                          {musicData?.lyricsText && musicData.lyricsText.trim().length > 0 ? (
                            <button
                              onClick={() => setShowLyricsModal(true)}
                              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              가사보기
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          ) : musicData?.lyricsFilePath ? (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${musicData.id}/lyrics?mode=download`}
                              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              가사 다운로드
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-white/50 text-sm">가사가 없습니다.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>


        </div>
      </div>

      {/* 가사 모달 */}
      {showLyricsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl bg-neutral-900 border border-white/10">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-white">{musicData?.title || title} 가사</h2>
                <p className="text-white/60 text-sm mt-1">{musicData?.artist || 'Unknown'}</p>
              </div>
              <button
                onClick={() => setShowLyricsModal(false)}
                className="rounded-lg bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 가사 내용 */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="text-white/80 text-base leading-relaxed whitespace-pre-line">
                {musicData?.lyricsText && musicData.lyricsText.trim().length > 0 ? musicData.lyricsText : '가사가 없습니다.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 