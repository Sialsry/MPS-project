'use client'
import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

type Props = { 
  open: boolean; 
  onClose: () => void; 
  musicData?: {
    title: string;
    artist: string;
    genre: string;
    tags: string;
    releaseYear: number;
    durationSec: number;
    priceRef: number;
    rewardPerPlay: number;
    maxPlayCount: number;
    accessTier: 'all' | 'subscribed';
  }
}

export default function MusicEditModal({ open, onClose, musicData }: Props) {
  if (!open) return null

  // 기본 정보
  const [title, setTitle] = useState(musicData?.title || '')
  const [artist, setArtist] = useState(musicData?.artist || '')
  const [genre, setGenre] = useState(musicData?.genre || 'Pop')
  const [tags, setTags] = useState(musicData?.tags || '')
  const [releaseYear, setReleaseYear] = useState<number | ''>(musicData?.releaseYear || '')
  const [durationSec, setDurationSec] = useState<number | ''>(musicData?.durationSec || '')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [lyricsFile, setLyricsFile] = useState<File | null>(null)
  const [lyricsText, setLyricsText] = useState('')
  const [lyricsInputType, setLyricsInputType] = useState<'file' | 'text'>('text')

  // 가격/리워드
  const [priceRef, setPriceRef] = useState(musicData?.priceRef || 7)
  const [rewardPerPlay, setRewardPerPlay] = useState(musicData?.rewardPerPlay || 0.007)
  const [maxPlayCount, setMaxPlayCount] = useState<number | ''>(musicData?.maxPlayCount || '')

  // API 설정
  const [accessTier, setAccessTier] = useState<'all' | 'subscribed'>(musicData?.accessTier || 'all')

  // 미리보기
  const totalReward = useMemo(() => {
    const rewardPerPlayNum = Number(rewardPerPlay) || 0
    const maxPlayCountNum = Number(maxPlayCount) || 0
    
    if (maxPlayCountNum > 0) {
      return rewardPerPlayNum * maxPlayCountNum
    }
    
    return 0
  }, [rewardPerPlay, maxPlayCount])

  function onSelectAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setAudioFile(f)
  }

  function onSelectThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setThumbFile(f)
  }

  function onSelectLyrics(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setLyricsFile(f)
  }

  function onSave() {
    // 여기에 실제 수정 로직 추가
    console.log('음원 수정됨:', {
      title, artist, genre, tags, releaseYear, durationSec,
      priceRef, rewardPerPlay, maxPlayCount, accessTier
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl border border-white/10 bg-neutral-900/90 text-white shadow-2xl backdrop-blur-md flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white">음원 수정</h3>
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
        <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
          <div className="space-y-6">
            {/* 기본 정보 섹션 */}
            <Card>
              <Title>음원 기본 정보</Title>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/80">음원 파일 (.mp3/.wav/.flac)</label>
                  <input 
                    type="file" 
                    accept=".mp3,.wav,.flac" 
                    onChange={onSelectAudio} 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white ring-1 ring-white/8 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:px-3 file:py-1.5 file:text-teal-300 hover:file:bg-teal-500/30 transition-all duration-200" 
                  />
                  {audioFile && (
                    <div className="flex items-center gap-2 text-sm text-teal-300">
                      <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                      선택됨: {audioFile.name}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/80">썸네일 (.jpg/.png)</label>
                  <div className="space-y-3">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png" 
                      onChange={onSelectThumb} 
                      className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white ring-1 ring-white/8 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:px-3 file:py-1.5 file:text-teal-300 hover:file:bg-teal-500/30 transition-all duration-200" 
                    />
                    {thumbFile ? (
                      <div className="flex items-center gap-2 text-sm text-teal-300">
                        <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                        선택됨: {thumbFile.name}
                      </div>
                    ) : (
                      <div className="text-xs text-white/50">
                        *미등록시 기본 이미지로 설정됩니다
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">음원명 <span className="text-red-400">*</span></label>
                  <input 
                    value={title} 
                    onChange={(e)=>setTitle(e.target.value)} 
                    placeholder="음원 제목을 입력하세요" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">아티스트</label>
                  <input 
                    value={artist} 
                    onChange={(e)=>setArtist(e.target.value)} 
                    placeholder="아티스트명" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">장르 <span className="text-red-400">*</span></label>
                  <select 
                    value={genre} 
                    onChange={(e)=>setGenre(e.target.value)} 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                  >
                    <option>Pop</option>
                    <option>Rock</option>
                    <option>Jazz</option>
                    <option>HipHop</option>
                    <option>Classical</option>
                    <option>Electronic</option>
                    <option>Folk</option>
                    <option>Country</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">발매년도</label>
                  <input 
                    value={releaseYear} 
                    onChange={(e)=>setReleaseYear(e.target.value ? Number(e.target.value) : '')} 
                    type="number" 
                    placeholder="2024" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">태그 (쉼표로 구분)</label>
                  <input 
                    value={tags} 
                    onChange={(e)=>setTags(e.target.value)} 
                    placeholder="차분한, 릴렉스, 배경음악" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">재생 시간 (초) <span className="text-red-400">*</span></label>
                  <input 
                    value={durationSec} 
                    onChange={(e)=>setDurationSec(e.target.value ? Number(e.target.value) : '')} 
                    type="number" 
                    placeholder="180" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-white/80">가사 <span className="text-red-400">*</span></label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-white/80">
                        <input 
                          type="radio" 
                          checked={lyricsInputType === 'text'} 
                          onChange={() => setLyricsInputType('text')} 
                          className="text-teal-500 focus:ring-teal-500/20"
                        /> 
                        직접 입력
                      </label>
                      <label className="flex items-center gap-2 text-white/80">
                        <input 
                          type="radio" 
                          checked={lyricsInputType === 'file'} 
                          onChange={() => setLyricsInputType('file')} 
                          className="text-teal-500 focus:ring-teal-500/20"
                        /> 
                        파일 업로드
                      </label>
                    </div>
                    
                    {lyricsInputType === 'text' ? (
                      <textarea 
                        value={lyricsText}
                        onChange={(e) => setLyricsText(e.target.value)}
                        placeholder="가사를 직접 입력하세요..." 
                        rows={4}
                        className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 resize-none" 
                      />
                    ) : (
                      <div className="space-y-2">
                        <input 
                          type="file" 
                          accept=".txt,.lrc,.srt" 
                          onChange={onSelectLyrics} 
                          className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white ring-1 ring-white/8 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:px-3 file:py-1.5 file:text-teal-300 hover:file:bg-teal-500/30 transition-all duration-200" 
                        />
                        {lyricsFile && (
                          <div className="flex items-center gap-2 text-sm text-teal-300">
                            <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                            선택됨: {lyricsFile.name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* 가격 및 리워드 설정 */}
            <Card>
              <Title>가격 및 리워드 설정</Title>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">참고 가격 (원)</label>
                  <input 
                    value={priceRef} 
                    onChange={(e)=>setPriceRef(Number(e.target.value)||0)} 
                    type="number" 
                    placeholder="7"
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">1회 재생당 리워드 (토큰) <span className="text-red-400">*</span></label>
                  <input 
                    value={rewardPerPlay} 
                    onChange={(e)=>setRewardPerPlay(Number(e.target.value)||0)} 
                    type="number" 
                    step="0.001" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">최대 재생 횟수 <span className="text-red-400">*</span></label>
                  <input 
                    value={maxPlayCount} 
                    onChange={(e)=>setMaxPlayCount(e.target.value ? Number(e.target.value) : '')} 
                    type="number" 
                    placeholder="1000" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-teal-500/20 bg-teal-500/10 p-4">
                <div className="text-sm text-teal-300 font-medium mb-1">리워드 미리보기</div>
                {maxPlayCount ? (
                  <p className="text-sm text-white/80">
                    총 리워드: <span className="text-teal-300 font-semibold">{totalReward}</span> 토큰
                  </p>
                ) : (
                  <p className="text-sm text-white/80">
                    최대 재생 횟수를 입력하면 총 리워드를 확인할 수 있습니다
                  </p>
                )}
              </div>
            </Card>

            {/* API 설정 섹션 */}
            <Card>
              <Title>API 설정 <span className="text-red-400 text-sm">*</span></Title>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">엔드포인트 URL</label>
                  <input 
                    value="/api/music/{music_id}/play" 
                    readOnly 
                    className="w-full cursor-not-allowed rounded-lg bg-black/20 px-3 py-2.5 text-sm text-white/60 outline-none ring-1 ring-white/8" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">API 키 권한</label>
                  <select 
                    value={accessTier} 
                    onChange={(e)=>setAccessTier(e.target.value as any)} 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                  >
                    <option value="all">모든 기업 (무료)</option>
                    <option value="subscribed">구독 기업만</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 액션 푸터 */}
        <div className="border-t border-white/10 bg-neutral-900/90 p-4">
          <div className="flex items-center justify-end">
            <button 
              onClick={onSave} 
              className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2.5 text-sm text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
            >
              수정 완료
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
} 