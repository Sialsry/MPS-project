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
    normalizedTags?: string;
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
        <div className="flex items-center justify-between pr-4 pl-6 py-3 border-b border-white/10">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-white">
              {(musicData?.title || title)}
              <span className="ml-2 text-white/60 font-normal">· {musicData?.artist || 'Unknown'}</span>
            </div>
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
        <div className="flex-1 overflow-y-auto px-4 pt-1 pb-2 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          <div className="space-y-3">
            {/* 세부 정보: 테이블형 정의 리스트 */}
            <Card>
              <div className="px-4 pt-0 pb-3">
                <div className="text-sm font-semibold text-white mb-4">세부 정보</div>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* 좌측 썸네일 */}
                  <div className="md:col-span-3">
                    <div className="w-full rounded-lg border border-white/10 overflow-hidden bg-white/5">
                      {musicData?.id ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${musicData.id}/cover`} 
                          alt={`${musicData?.title || title} 커버`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="h-40 flex items-center justify-center text-white/40 text-sm">커버 없음</div>
                      )}
                    </div>
                  </div>

                  {/* 우측 정의 리스트 */}
                  <div className="md:col-span-9">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <dt className="text-white/60 mb-1">음원 ID</dt>
                        <dd className="text-white">{musicData?.id || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">카테고리</dt>
                        <dd className="text-white">{musicData?.category || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">음원 유형</dt>
                        <dd className="text-white">
                          {(musicData?.musicType ?? '일반') === 'Inst' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">Inst</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/15 text-teal-300 border border-teal-500/30">일반</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">재생 시간</dt>
                        <dd className="text-white">{typeof musicData?.durationSec === 'number' ? `${Math.floor(musicData.durationSec / 60)}분 ${musicData.durationSec % 60}초` : '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">발매일</dt>
                        <dd className="text-white">{formatDateHyphen(musicData?.releaseDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">ISRC</dt>
                        <dd className="text-white font-mono">{musicData?.isrc || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">호출당 리워드</dt>
                        <dd className="text-white">{typeof musicData?.rewardPerPlay === 'number' ? `${musicData.rewardPerPlay} 토큰` : '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">월 최대 한도</dt>
                        <dd className="text-white">{typeof musicData?.maxPlayCount === 'number' ? `${musicData.maxPlayCount.toLocaleString()} 회` : '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">API 접근 권한</dt>
                        <dd className="text-white">
                          {musicData?.accessTier === 'all' ? (
                            <span className="inline-flex flex-wrap gap-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Free</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">Standard</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">Business</span>
                            </span>
                          ) : (
                            <span className="inline-flex flex-wrap gap-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">Standard</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">Business</span>
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">등록일</dt>
                        <dd className="text-white">{formatDateHyphen(musicData?.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">참고가격</dt>
                        <dd className="text-white text-xs">{(musicData?.musicType ?? '일반') === 'Inst' ? `${musicData?.priceMusicOnly ?? 3}원` : `${musicData?.priceMusicOnly ?? 7}원, ${musicData?.priceLyricsOnly ?? 2}원`}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">작사자</dt>
                        <dd className="text-white">{musicData?.lyricist || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">작곡자</dt>
                        <dd className="text-white">{musicData?.composer || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-white/60 mb-1">편곡자</dt>
                        <dd className="text-white">{musicData?.arranger || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            {/* 태그: 칩 형태 */}
            <Card>
              <div className="px-4 pt-0 pb-3">
                <div className="text-sm font-semibold text-white mb-4">태그</div>
                <div className="flex flex-wrap gap-1">
                  {(musicData?.tags || '').split(',').map(t => t.trim()).filter(Boolean).length > 0 ? (
                    (musicData?.tags || '').split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={`tag-${i}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/15">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/50 text-sm">-</span>
                  )}
                </div>

                <div className="text-sm font-semibold text-white mt-3 mb-4">정규화 태그</div>
                <div className="flex flex-wrap gap-1">
                  {(musicData?.normalizedTags || '').split(',').map(t => t.trim()).filter(Boolean).length > 0 ? (
                    (musicData?.normalizedTags || '').split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={`ntag-${i}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/15">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/50 text-sm">-</span>
                  )}
                </div>
              </div>
            </Card>

            {/* 가사 */}
            {musicData?.musicType !== 'Inst' && (
              <Card>
                <div className="px-4 pt-0 pb-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-white">가사</div>
                    {(musicData?.lyricsText && musicData.lyricsText.trim().length > 0) ? (
                      <button
                        onClick={() => setShowLyricsModal(true)}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
                      >
                        전체 보기
                      </button>
                    ) : musicData?.lyricsFilePath ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${musicData.id}/lyrics?mode=download`}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
                      >
                        파일 다운로드
                      </a>
                    ) : null}
                  </div>
                  <div className="text-white/80 text-sm leading-relaxed max-h-28 overflow-hidden whitespace-pre-line">
                    {musicData?.lyricsText && musicData.lyricsText.trim().length > 0 ? musicData.lyricsText : '가사가 없습니다.'}
                  </div>
                </div>
              </Card>
            )}
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
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="text-white/80 text-base leading-relaxed whitespace-pre-line">
                  {musicData?.lyricsText && musicData.lyricsText.trim().length > 0 ? musicData.lyricsText : '가사가 없습니다.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 