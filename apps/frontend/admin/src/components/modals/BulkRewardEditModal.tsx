'use client'
import { useState } from 'react'

type Music = {
  id: string
  title: string
  category: string
  rewardPerPlay: number
  totalRewardCount: number | null
  status: 'active' | 'inactive'
}

interface BulkRewardEditModalProps {
  open: boolean
  onClose: () => void
  selectedMusics: Music[]
  onSuccess?: () => void
}

export default function BulkRewardEditModal({ open, onClose, selectedMusics, onSuccess }: BulkRewardEditModalProps) {
  const [rewardPercentage, setRewardPercentage] = useState<number | ''>('')
  const [limitPercentage, setLimitPercentage] = useState<number | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  const [missingPolicy, setMissingPolicy] = useState<'skip' | 'default'>('skip')
  const [defaultRpp, setDefaultRpp] = useState<number | ''>('')
  const [defaultLimit, setDefaultLimit] = useState<number | ''>('')

  if (!open || selectedMusics.length === 0) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const tasks = selectedMusics.map(async (music) => {
        const applyRpp = rewardPercentage !== ''
        const applyLimit = limitPercentage !== ''
        let baseRpp = Number(music.rewardPerPlay || 0)
        let baseLimit = music.totalRewardCount

        if (missingPolicy === 'default') {
          if ((baseRpp === 0 || isNaN(baseRpp)) && defaultRpp !== '') baseRpp = Number(defaultRpp)
          if ((baseLimit == null || baseLimit === 0) && defaultLimit !== '') baseLimit = Number(defaultLimit)
        }

        // 건너뛰기 정책: 필요한 기준값이 없으면 스킵
        if (missingPolicy === 'skip') {
          if ((applyRpp && (baseRpp === 0 || isNaN(baseRpp))) || (applyLimit && (baseLimit == null || baseLimit === 0))) {
            return false
          }
        }

        const newRpp = applyRpp ? Number((baseRpp * (1 + Number(rewardPercentage) / 100)).toFixed(6)) : baseRpp
        const newLimit = applyLimit
          ? (baseLimit != null ? Math.max(0, Math.round(baseLimit * (1 + Number(limitPercentage) / 100))) : 0)
          : (baseLimit ?? 0)

        const body = {
          totalRewardCount: newLimit,
          rewardPerPlay: newRpp,
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/${music.id}/rewards`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return true
      })
      await Promise.all(tasks)
      
      // 성공 시 콜백 실행 (페이지 새로고침)
      if (onSuccess) {
        onSuccess()
      }
      
      onClose()
    } catch (err) {
      console.error('일괄 수정 실패:', err)
      alert('일괄 수정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNewReward = (currentReward: number) => {
    const base = (currentReward && currentReward > 0) ? currentReward : (missingPolicy === 'default' && defaultRpp !== '' ? Number(defaultRpp) : currentReward)
    if (!rewardPercentage) return base
    return base * (1 + Number(rewardPercentage) / 100)
  }

  const calculateNewLimit = (currentLimit: number | null) => {
    // 미설정 음원 처리
    if (!currentLimit || currentLimit === 0) {
      if (missingPolicy === 'default' && defaultLimit !== '') {
        const base = Number(defaultLimit);
        if (!limitPercentage) return base;
        return Math.round(base * (1 + Number(limitPercentage) / 100));
      }
      return null; // 미설정 상태 유지
    }
    
    // 기존 한도가 있는 경우
    if (!limitPercentage) return currentLimit;
    return Math.round(currentLimit * (1 + Number(limitPercentage) / 100));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">일괄 리워드 수정</h2>
            <span className="text-sm text-teal-300 bg-teal-400/10 px-2 py-1 rounded-full">
              {selectedMusics.length}개 선택됨
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 미설정 음원 처리 옵션 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80">리워드 미설정 음원 처리</h3>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-white/80">
                <input
                  type="radio"
                  className="accent-teal-400"
                  checked={missingPolicy === 'skip'}
                  onChange={() => setMissingPolicy('skip')}
                />
                미설정 음원은 건너뛰기
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-white/80">
                <input
                  type="radio"
                  className="accent-teal-400"
                  checked={missingPolicy === 'default'}
                  onChange={() => setMissingPolicy('default')}
                />
                기본값으로 설정 후 퍼센트 적용
              </label>
            </div>
            {missingPolicy === 'default' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">기본 호출당 리워드</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={defaultRpp}
                    onChange={(e) => setDefaultRpp(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="예: 0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">기본 월 한도</label>
                  <input
                    type="number"
                    step="1"
                    value={defaultLimit}
                    onChange={(e) => setDefaultLimit(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="예: 2000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 선택된 음원 목록 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80">선택된 음원</h3>
            <div className="h-64 overflow-y-auto space-y-2">
              {selectedMusics.length > 0 ? (
                selectedMusics.map((music) => (
                  <div key={music.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {music.title} · <span className="text-white/60">{music.category}</span>
                      </div>
                      <div className="text-xs text-teal-300">
                        현재: {(music.rewardPerPlay ?? 0).toFixed(3)} 토큰
                        {music.totalRewardCount ? ` / ${music.totalRewardCount.toLocaleString()}회` : ' / 한도 없음'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <p className="text-sm">음원을 선택해주세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 수정 설정 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 호출당 리워드 수정 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  호출당 리워드 조정 (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={rewardPercentage}
                    onChange={(e) => setRewardPercentage(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="예: 10 (10% 증가)"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                    %
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  양수: 증가, 음수: 감소 (예: 10 = 10% 증가, -5 = 5% 감소)
                </p>
              </div>

              {/* 리워드 미리보기 */}
              {rewardPercentage !== '' && (
                <div className="p-4 bg-teal-500/10 border border-teal-400/20 rounded-lg">
                  <h4 className="text-sm font-medium text-teal-300 mb-2">리워드 변경 미리보기</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMusics.slice(0, 3).map((music) => (
                      <div key={music.id} className="flex justify-between">
                        <span className="text-white/70 truncate">{music.title}</span>
                        <span className="text-white font-medium">
                          {(music.rewardPerPlay ?? 0).toFixed(3)} → {calculateNewReward(music.rewardPerPlay ?? 0).toFixed(3)}
                        </span>
                      </div>
                    ))}
                    {selectedMusics.length > 3 && (
                      <div className="text-xs text-white/50 text-center">
                        ... 외 {selectedMusics.length - 3}개 음원
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 월 한도 수정 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  월 한도 조정 (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={limitPercentage}
                    onChange={(e) => setLimitPercentage(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
                    placeholder="예: 20 (20% 증가)"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                    %
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  양수: 증가, 음수: 감소 (무제한 음원은 제외)
                </p>
              </div>

              {/* 한도 미리보기 */}
              {limitPercentage !== '' && (
                <div className="p-4 bg-teal-500/10 border border-teal-400/20 rounded-lg">
                  <h4 className="text-sm font-medium text-teal-300 mb-2">한도 변경 미리보기</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMusics.slice(0, 3).map((music) => {
                      const currentLimit = music.totalRewardCount || 0;
                      const newLimit = calculateNewLimit(music.totalRewardCount);
                      
                      return (
                        <div key={music.id} className="flex justify-between">
                          <span className="text-white/70 truncate">{music.title}</span>
                          <span className="text-white font-medium">
                            {currentLimit > 0 ? currentLimit.toLocaleString() : '미설정'} → {newLimit ? newLimit.toLocaleString() : '미설정'}
                          </span>
                        </div>
                      );
                    })}
                    {selectedMusics.length > 3 && (
                      <div className="text-xs text-white/50 text-center">
                        ... 외 {selectedMusics.length - 3}개 음원
                      </div>
                    )}
                    {selectedMusics.filter(m => m.totalRewardCount).length === 0 && missingPolicy === 'skip' && (
                      <div className="text-xs text-white/50 text-center">
                        한도가 설정된 음원이 없습니다 (설정되지 않은 음원은 건너뜁니다)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || (!rewardPercentage && !limitPercentage && missingPolicy === 'skip')}
              className="px-3 py-2 text-xs font-medium text-white bg-teal-500/90 rounded-lg hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  수정 중...
                </div>
              ) : (
                '일괄 수정'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 