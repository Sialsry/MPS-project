'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import MusicPreviewModal from '@/components/modals/MusicPreviewModal'

export default function MusicCreatePage() {
  const router = useRouter()
  const [previewOpen, setPreviewOpen] = useState(false)

  // 기본 정보
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [genre, setGenre] = useState('Pop')
  const [tags, setTags] = useState('차분한, 릴렉스, 배경음악')
  const [releaseYear, setReleaseYear] = useState<number | ''>(2024)
  const [durationSec, setDurationSec] = useState<number | ''>(180)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [lyricsFile, setLyricsFile] = useState<File | null>(null)
  const [lyricsText, setLyricsText] = useState('')
  const [lyricsInputType, setLyricsInputType] = useState<'file' | 'text'>('text')

  // 가격/리워드
  const [priceRef, setPriceRef] = useState(7)
  const [rewardPerPlay, setRewardPerPlay] = useState(0.007)
  const [maxPlayCount, setMaxPlayCount] = useState<number | ''>(1000)

  // API 설정
  const [accessTier, setAccessTier] = useState<'all' | 'subscribed'>('all')

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
    // 여기에 실제 저장 로직 추가
    console.log('음원 등록:', {
      title, artist, genre, tags, releaseYear, durationSec,
      priceRef, rewardPerPlay, maxPlayCount, accessTier
    })
    alert('음원이 등록되었습니다.')
  }

  return (
    <div className="space-y-6 pb-24">
      {/* 기본 정보 섹션 */}
      <Card>
        <Title variant="section">음원 기본 정보</Title>
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
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-white/80">썸네일 (.jpg/.png)</label>
              <span className="text-xs text-white/50">*미등록시 기본 이미지로 설정됩니다</span>
            </div>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png" 
              onChange={onSelectThumb} 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white ring-1 ring-white/8 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:px-3 file:py-1.5 file:text-teal-300 hover:file:bg-teal-500/30 transition-all duration-200" 
            />
            {thumbFile && (
              <div className="flex items-center gap-2 text-sm text-teal-300">
                <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                선택됨: {thumbFile.name}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">음원명 <span className="text-red-400">*</span></label>
            <input 
              value={title} 
              onChange={(e)=>setTitle(e.target.value)} 
              placeholder="음원 제목을 입력하세요" 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">아티스트</label>
            <input 
              value={artist} 
              onChange={(e)=>setArtist(e.target.value)} 
              placeholder="아티스트명" 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">장르 <span className="text-red-400">*</span></label>
            <select 
              value={genre} 
              onChange={(e)=>setGenre(e.target.value)} 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm"
            >
              <option>Pop</option>
              <option>Rock</option>
              <option>Jazz</option>
              <option>HipHop</option>
              <option>Classical</option>
              <option>Electronic</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">태그 (쉼표로 구분)</label>
            <input 
              value={tags} 
              onChange={(e)=>setTags(e.target.value)} 
              placeholder="차분한, 릴렉스, 배경음악" 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">발매년도</label>
            <input 
              type="number" 
              value={releaseYear} 
              onChange={(e)=>setReleaseYear(e.target.value ? Number(e.target.value) : '')} 
              placeholder="2024" 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">재생 시간 (초) <span className="text-red-400">*</span></label>
            <input 
              type="number" 
              value={durationSec} 
              onChange={(e)=>setDurationSec(e.target.value ? Number(e.target.value) : '')} 
              placeholder="180" 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">가사 <span className="text-red-400">*</span></label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input 
                    type="radio" 
                    checked={lyricsInputType === 'text'} 
                    onChange={() => setLyricsInputType('text')}
                    className="text-teal-400"
                  />
                  직접 입력
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input 
                    type="radio" 
                    checked={lyricsInputType === 'file'} 
                    onChange={() => setLyricsInputType('file')}
                    className="text-teal-400"
                  />
                  파일 업로드
                </label>
              </div>
              {lyricsInputType === 'text' ? (
                <textarea 
                  value={lyricsText} 
                  onChange={(e)=>setLyricsText(e.target.value)} 
                  placeholder="가사를 입력하세요..." 
                  rows={4}
                  className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 resize-none text-sm" 
                />
              ) : (
                <div className="space-y-2">
                  <input 
                    type="file" 
                    accept=".txt,.doc,.docx" 
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

      {/* 가격 및 리워드 설정 섹션 */}
      <Card>
        <Title variant="section">가격 및 리워드 설정</Title>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">참고 가격 (원)</label>
            <input 
              type="number" 
              value={priceRef} 
              onChange={(e)=>setPriceRef(Number(e.target.value))} 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">1회 재생당 리워드 (토큰) <span className="text-red-400">*</span></label>
            <input 
              type="number" 
              step="0.001"
              value={rewardPerPlay} 
              onChange={(e)=>setRewardPerPlay(Number(e.target.value))} 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">최대 재생 횟수 <span className="text-red-400">*</span></label>
            <input 
              type="number" 
              value={maxPlayCount} 
              onChange={(e)=>setMaxPlayCount(e.target.value ? Number(e.target.value) : '')} 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm" 
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-white/80">예상 총 리워드</div>
            <div className="text-lg font-semibold text-teal-300">
              {totalReward.toFixed(3)} 토큰
            </div>
          </div>
        </div>
      </Card>

      {/* API 설정 섹션 */}
      <Card>
        <Title variant="section">API 설정</Title>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">엔드포인트 URL</label>
            <input 
              value="/api/music/{music_id}/play" 
              readOnly
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white/60 outline-none ring-1 ring-white/8 transition-all duration-200 text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">API 키 권한</label>
            <select 
              value={accessTier} 
              onChange={(e)=>setAccessTier(e.target.value as 'all' | 'subscribed')} 
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm"
            >
              <option value="all">모든 기업 (무료)</option>
              <option value="subscribed">구독 기업만</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={() => setPreviewOpen(true)}
          className="rounded bg-white/10 border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10 hover:text-white"
        >
          미리보기
        </button>
        <button onClick={onSave} className="rounded bg-teal-600/90 px-3 py-2 text-sm text-white hover:bg-teal-500">음원 등록</button>
      </div>

      {/* 미리보기 모달 */}
      <MusicPreviewModal 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        musicData={{
          title,
          artist,
          genre,
          tags,
          releaseYear: releaseYear || 2024,
          durationSec: durationSec || 180,
          priceRef,
          rewardPerPlay,
          maxPlayCount: maxPlayCount || 1000,
          accessTier,
          lyricsText: lyricsInputType === 'text' ? lyricsText : undefined
        }}
      />
    </div>
  )
} 