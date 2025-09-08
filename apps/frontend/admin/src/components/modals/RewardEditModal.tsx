'use client'
import { useState } from 'react'

type Music = {
  id: string
  title: string
  category: string
  rewardPerPlay: number
  maxPlayCount: number | null
  status: 'active' | 'inactive'
}

interface RewardEditModalProps {
  open: boolean
  onClose: () => void
  music: Music | null
}

export default function RewardEditModal({ open, onClose, music }: RewardEditModalProps) {
  const [rewardPerPlay, setRewardPerPlay] = useState(music?.rewardPerPlay || 0)
  const [maxPlayCount, setMaxPlayCount] = useState<number | ''>(music?.maxPlayCount || '')
  const [isLoading, setIsLoading] = useState(false)

  if (!open || !music) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: API 호출로 리워드 수정
    console.log('리워드 수정:', { 
      musicId: music.id, 
      newReward: rewardPerPlay,
      newMaxPlayCount: maxPlayCount
    })
    
    // 임시 딜레이
    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">리워드 수정</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 음원 정보 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{music.title}</h3>
                <p className="text-sm text-white/60">{music.category}</p>
              </div>
            </div>
          </div>

          {/* 리워드 설정 */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  1회 재생당 리워드 (토큰) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={rewardPerPlay}
                    onChange={(e) => setRewardPerPlay(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="0.000"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                    토큰
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  현재: {music.rewardPerPlay.toFixed(3)} 토큰
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  최대 재생 횟수 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxPlayCount}
                  onChange={(e) => setMaxPlayCount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                  placeholder="1000"
                />
                <p className="text-xs text-white/50 mt-1">
                  현재: {music.maxPlayCount ? music.maxPlayCount.toLocaleString() : '무제한'}
                </p>
              </div>
            </div>

            {/* 리워드 미리보기 */}
            <div className="p-4 bg-gradient-to-r from-teal-400/10 to-blue-400/10 border border-teal-400/20 rounded-lg">
              <h4 className="text-sm font-medium text-teal-300 mb-2">리워드 미리보기</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">100회 호출 시:</span>
                  <span className="text-white font-medium">{(rewardPerPlay * 100).toFixed(1)} 토큰</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">1,000회 호출 시:</span>
                  <span className="text-white font-medium">{(rewardPerPlay * 1000).toFixed(1)} 토큰</span>
                </div>
                {maxPlayCount && (
                  <div className="flex justify-between">
                    <span className="text-white/70">최대 재생 시 (총 {maxPlayCount.toLocaleString()}회):</span>
                    <span className="text-white font-medium">{(rewardPerPlay * maxPlayCount).toFixed(1)} 토큰</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || (rewardPerPlay === music.rewardPerPlay && maxPlayCount === music.maxPlayCount)}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-teal-500/90 rounded-lg hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  수정 중...
                </div>
              ) : (
                '리워드 수정'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 