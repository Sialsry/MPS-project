'use client'
import React, { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

type Props = { 
  open: boolean; 
  onClose: () => void; 
  isCreateMode?: boolean;
  musicData?: {
    id?: string;
    title: string;
    artist: string;
    category?: string;
    tags: string;
    releaseDate?: string;
    durationSec: number;
    musicType?: '일반' | 'Inst' | '가사만';
    priceMusicOnly?: number;
    priceLyricsOnly?: number;
    priceBoth?: number;
    priceRef?: number;
    rewardPerPlay: number;
    maxPlayCount: number;
    accessTier: 'all' | 'subscribed';
    lyricsText?: string;
    lyricist?: string;
    composer?: string;
    arranger?: string;
    isrc?: string;
  }
}

export default function MusicEditModal({ open, onClose, isCreateMode = false, musicData }: Props) {
  if (!open) return null



  // 기본 정보
  const [title, setTitle] = useState(isCreateMode ? '' : (musicData?.title || ''))
  const [artist, setArtist] = useState(isCreateMode ? '' : (musicData?.artist || ''))
  const [category, setCategory] = useState(isCreateMode ? '' : (musicData?.category || ''))
  const [tags, setTags] = useState(isCreateMode ? '' : (musicData?.tags || ''))
  const [releaseDate, setReleaseDate] = useState(isCreateMode ? '' : (musicData?.releaseDate || ''))
  const [durationSec, setDurationSec] = useState<number | ''>(isCreateMode ? '' : (musicData?.durationSec || ''))
  const [musicType, setMusicType] = useState<'일반' | 'Inst' | '가사만'>(isCreateMode ? '일반' : '일반')
  
  // 메타데이터 정보
  const [lyricist, setLyricist] = useState(isCreateMode ? '' : (musicData?.lyricist || ''))
  const [composer, setComposer] = useState(isCreateMode ? '' : (musicData?.composer || ''))
  const [arranger, setArranger] = useState(isCreateMode ? '' : (musicData?.arranger || ''))
  const [isrc, setIsrc] = useState(isCreateMode ? '' : (musicData?.isrc || ''))
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [lyricsFile, setLyricsFile] = useState<File | null>(null)
  const [lyricsText, setLyricsText] = useState(isCreateMode ? '' : '')
  const [lyricsInputType, setLyricsInputType] = useState<'file' | 'text'>(isCreateMode ? 'text' : 'text')

  // 가격/리워드
  const [priceRef, setPriceRef] = useState(isCreateMode ? 7 : (musicData?.priceRef || 7))
  const [priceMusicOnly, setPriceMusicOnly] = useState(isCreateMode ? 7 : (musicData?.priceMusicOnly || 7))
  const [priceLyricsOnly, setPriceLyricsOnly] = useState(isCreateMode ? 2 : (musicData?.priceLyricsOnly || 2))
  const [priceBoth, setPriceBoth] = useState(isCreateMode ? 7 : (musicData?.priceBoth || 7))
  const [hasRewards, setHasRewards] = useState(isCreateMode ? true : true)
  const [rewardPerPlay, setRewardPerPlay] = useState(isCreateMode ? 0.007 : (musicData?.rewardPerPlay || 0.007))
  const [maxPlayCount, setMaxPlayCount] = useState<number | ''>(isCreateMode ? '' : (musicData?.maxPlayCount || ''))

  // API 설정
  const [accessTier, setAccessTier] = useState<'all' | 'subscribed'>(isCreateMode ? 'subscribed' : (musicData?.accessTier || 'all'))

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
    // 여기에 실제 수정/등록 로직 추가
    if (isCreateMode) {
      console.log('음원 등록됨:', {
        title, artist, category, tags, releaseDate, durationSec, musicType,
        lyricist, composer, arranger, isrc,
        priceMusicOnly, priceLyricsOnly, priceBoth, rewardPerPlay, maxPlayCount, accessTier
      })
    } else {
      console.log('음원 수정됨:', {
        title, artist, category, tags, releaseDate, durationSec, musicType,
        lyricist, composer, arranger, isrc,
        priceMusicOnly, priceLyricsOnly, priceBoth, rewardPerPlay, maxPlayCount, accessTier
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl border border-white/10 bg-neutral-900/90 text-white shadow-2xl backdrop-blur-md flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white">{isCreateMode ? '음원 등록' : '음원 수정'}</h3>
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
                  <label className="block text-sm font-medium text-white/80">카테고리 <span className="text-red-400">*</span></label>
                  <select 
                    value={category || ''} 
                    onChange={(e)=>setCategory(e.target.value)} 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                  >
                    <option value="">카테고리 선택</option>
                    <option value="가요">가요</option>
                    <option value="팝">팝</option>
                    <option value="클래식">클래식</option>
                    <option value="재즈">재즈</option>
                    <option value="록">록</option>
                    <option value="일렉트로닉">일렉트로닉</option>
                    <option value="힙합">힙합</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">음원 유형 <span className="text-red-400">*</span></label>
                  <select 
                    value={musicType} 
                    onChange={(e) => {
                      const newType = e.target.value as '일반' | 'Inst'
                      setMusicType(newType)
                      
                      // 음원 유형에 따라 기본 가격 자동 설정
                      if (newType === '일반') {
                        setPriceBoth(7) // 일반 음원: 가사+멜로디 (7원)
                        setPriceMusicOnly(7) // 일반 음원 사용 (7원)
                      } else {
                        setPriceMusicOnly(3) // Inst 음원 (3원)
                      }
                      setPriceLyricsOnly(2) // 가사만은 항상 2원
                    }} 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                  >
                    <option value="일반">일반</option>
                    <option value="Inst">Inst</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">발매일</label>
                  <input 
                    value={releaseDate} 
                    onChange={(e)=>setReleaseDate(e.target.value)} 
                    type="date" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
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
                
                {/* 메타데이터 정보 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">작사자</label>
                  <input 
                    value={lyricist} 
                    onChange={(e)=>setLyricist(e.target.value)} 
                    placeholder="김작사" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">작곡자</label>
                  <input 
                    value={composer} 
                    onChange={(e)=>setComposer(e.target.value)} 
                    placeholder="박작곡" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">편곡자</label>
                  <input 
                    value={arranger} 
                    onChange={(e)=>setArranger(e.target.value)} 
                    placeholder="이편곡" 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">ISRC</label>
                  <input 
                    value={isrc} 
                    onChange={(e)=>setIsrc(e.target.value)} 
                    placeholder="KRZ0123456789" 
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
              
              {/* 가격 설정 */}
              <div className="mb-6">
                <div className="mb-3 text-sm font-medium text-white/80">가격 설정</div>
                
                {/* 음원 유형 선택 */}
                <div className="mb-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-white/80">
                      <input 
                        type="radio" 
                        name="musicType" 
                        checked={musicType === '일반'} 
                        onChange={() => setMusicType('일반')} 
                        className="text-teal-500 focus:ring-teal-500/20"
                      /> 
                      일반 음원 (가사+멜로디)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white/80">
                      <input 
                        type="radio" 
                        name="musicType" 
                        checked={musicType === 'Inst'} 
                        onChange={() => setMusicType('Inst')} 
                        className="text-teal-500 focus:ring-teal-500/20"
                      /> 
                      Inst 음원
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white/80">
                      <input 
                        type="radio" 
                        name="musicType" 
                        checked={musicType === '가사만'} 
                        onChange={() => setMusicType('가사만')} 
                        className="text-teal-500 focus:ring-teal-500/20"
                      /> 
                      가사만
                    </label>
                  </div>
                </div>
                
                {/* 선택된 유형에 따른 가격 입력 */}
                <div className="pt-2">
                  {musicType === '일반' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/60">일반 음원 가격:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          value={priceBoth} 
                          onChange={(e)=>setPriceBoth(Number(e.target.value)||0)} 
                          type="number" 
                          placeholder="4"
                          className="w-24 rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-center" 
                        />
                        <span className="text-sm text-white/60">원</span>
                      </div>
                    </div>
                  )}
                  
                  {musicType === 'Inst' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/60">Inst 음원 가격:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          value={priceMusicOnly} 
                          onChange={(e)=>setPriceMusicOnly(Number(e.target.value)||0)} 
                          type="number" 
                          placeholder="3"
                          className="w-24 rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-center" 
                        />
                        <span className="text-sm text-white/60">원</span>
                      </div>
                    </div>
                  )}
                  
                  {musicType === '가사만' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/60">가사만 가격:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          value={priceLyricsOnly} 
                          onChange={(e)=>setPriceLyricsOnly(Number(e.target.value)||0)} 
                          type="number" 
                          placeholder="2"
                          className="w-24 rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-center" 
                        />
                        <span className="text-sm text-white/60">원</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 리워드 설정 */}
              <div className="mb-6">
                <div className="mb-3 text-sm font-medium text-white/80">리워드 설정</div>
                                 <div className="mb-4">
                   <label className="flex items-center gap-2 text-sm text-white/80">
                     <input 
                       type="checkbox" 
                       checked={hasRewards} 
                       onChange={(e) => {
                         const checked = e.target.checked
                         setHasRewards(checked)
                         // 리워드가 있으면 구독기업만, 없으면 모든기업 사용 가능
                         setAccessTier(checked ? 'subscribed' : 'all')
                       }} 
                       className="text-teal-400 focus:ring-teal-500/20 rounded"
                     /> 
                     이 음원에 리워드 시스템 적용
                   </label>

                 </div>
                
                {hasRewards && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                )}
              </div>

              {/* 리워드 미리보기 */}
              {hasRewards && (
                <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-4">
                  <div className="text-sm text-teal-300 font-medium mb-1">리워드 미리보기</div>
                  {maxPlayCount ? (
                    <p className="text-sm text-white/80">
                      총 리워드: <span className="text-sm font-semibold text-teal-300">{totalReward}</span> 토큰
                    </p>
                  ) : (
                    <p className="text-sm text-white/80">
                      최대 재생 횟수를 입력하면 총 리워드를 확인할 수 있습니다
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* API 설정 섹션 */}
            <Card>
              <Title>API 설정 <span className="text-red-400 text-sm">*</span></Title>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">음원 재생 엔드포인트</label>
                  <div className="w-full rounded-lg bg-black/20 px-3 py-2.5 text-sm text-white/60 outline-none ring-1 ring-white/8 font-mono">
                    /api/music/{isCreateMode ? '{music_id}' : (musicData?.id || 'N/A')}/play
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">가사 다운로드 엔드포인트</label>
                  <div className="w-full rounded-lg bg-black/20 px-3 py-2.5 text-sm text-white/60 outline-none ring-1 ring-white/8 font-mono">
                    /api/lyric/{isCreateMode ? '{music_id}' : (musicData?.id || 'N/A')}/download
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">API 키 권한</label>
                  <select 
                    value={accessTier} 
                    onChange={(e)=>setAccessTier(e.target.value as any)} 
                    className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                  >
                    <option value="all">Free 등급 사용 가능</option>
                    <option value="subscribed">Standard, Business 등급 사용 가능</option>
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
              {isCreateMode ? '등록 완료' : '수정 완료'}
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