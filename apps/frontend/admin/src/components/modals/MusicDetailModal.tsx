'use client'

import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'

type Music = {
  id: string
  title: string
  category: string
  monthlyUsed: number
  monthlyLimit: number | null
  companies: number
  rewardPerPlay: number
  status: 'active' | 'inactive'
  monthlyUsage: number[]
  monthlyRewards: number[]
  topCompanies: Array<{ name: string; usage: number; tier: string }>
  totalRewards: number
  totalPlays: number
  averageRating: number
  releaseDate: string
  duration: number // 초 단위로 변경
  artist: string
  musicType: '일반' | 'Inst' // 음원 유형 추가
}

type Props = {
  open: boolean
  onClose: () => void
  music: Music | null
}

export default function MusicDetailModal({ open, onClose, music }: Props) {
  const [activeTab, setActiveTab] = useState<'usage' | 'rewards'>('usage')

  if (!open || !music) return null

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  const usageData = {
    labels: months,
    series: [
      { label: '현재 음원', data: music.monthlyUsage },
      { label: '업계 평균', data: [800, 950, 1100, 1200, 1350, 1500, 1600, 1550, 1700, 1650, 1800, 2000] }
    ]
  }

  const rewardsData = {
    labels: months,
    series: [
      { label: '현재 음원', data: music.monthlyRewards },
      { label: '업계 평균', data: [5000, 6000, 7000, 8000, 9000, 10000, 11000, 10500, 12000, 11500, 13000, 14000] }
    ]
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      { bg: 'from-purple-400/15 to-purple-500/15', text: 'text-purple-300', border: 'border-purple-400/25' },
      { bg: 'from-blue-400/15 to-blue-500/15', text: 'text-blue-300', border: 'border-blue-400/25' },
      { bg: 'from-teal-400/15 to-teal-500/15', text: 'text-teal-300', border: 'border-teal-400/25' },
      { bg: 'from-green-400/15 to-green-500/15', text: 'text-green-300', border: 'border-green-400/25' },
      { bg: 'from-yellow-400/15 to-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-400/25' },
      { bg: 'from-orange-400/15 to-orange-500/15', text: 'text-orange-300', border: 'border-orange-400/25' },
      { bg: 'from-red-400/15 to-red-500/15', text: 'text-red-300', border: 'border-red-400/25' },
      { bg: 'from-pink-400/15 to-pink-500/15', text: 'text-pink-300', border: 'border-pink-400/25' },
      { bg: 'from-indigo-400/15 to-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-400/25' },
      { bg: 'from-cyan-400/15 to-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-400/25' }
    ]

    let hash = 0
    for (let i = 0; i < category.length; i++) {
      const char = category.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }

    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400'
      case 'inactive': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <>
      {/* 커스텀 스크롤바 스타일 */}
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
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl bg-neutral-900 border border-white/10">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-white">{music.title} 상세 정보</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-white/10 flex-shrink-0">
                          {[
                { id: 'usage', label: '리워드 발생 현황' },
                { id: 'rewards', label: '사용 기업 현황' }
              ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-teal-400 border-teal-400'
                    : 'text-white/60 border-transparent hover:text-white/80 hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* 기본 정보 섹션 */}
            <div className="rounded-xl border border-white/10 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                기본 정보
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-white/60">음원 ID</div>
                  <div className="text-white font-medium">{music.id}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">제목</div>
                  <div className="text-white font-medium">{music.title}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">아티스트</div>
                  <div className="text-white font-medium">{music.artist}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">카테고리</div>
                  <div className="text-white font-medium">{music.category}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">음원 유형</div>
                  <div className="text-white font-medium">
                    {music.musicType === 'Inst' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-400/25">
                        Inst
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/15 text-teal-300 border border-teal-400/25">
                        일반
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">발매일</div>
                  <div className="text-white font-medium">
                    {new Date(music.releaseDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">재생시간</div>
                  <div className="text-white font-medium">
                    {Math.floor(music.duration / 60)}분 {music.duration % 60}초
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">상태</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(music.status)}`}></div>
                    <span className="text-white font-medium capitalize">{music.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 사용 현황 탭 */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* 월별 API 사용량 차트 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    월별 리워드 발생 API호출 추이
                  </h3>
                  <div className="h-64">
                    <SimpleLineChart 
                      labels={months}
                      series={usageData.series}
                      colors={['#14b8a6', '#9ca3af']}
                    />
                  </div>
                </div>

                {/* 월별 사용 상세 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    월별 리워드 발생 현황
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-center">
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-white/80 font-medium">월</th>
                          <th className="px-4 py-3 text-white/80 font-medium">리워드 발생 횟수(유효재생)</th>
                          <th className="px-4 py-3 text-white/80 font-medium">사용 기업</th>
                          <th className="px-4 py-3 text-white/80 font-medium">리워드 발생률</th>
                          <th className="px-4 py-3 text-white/80 font-medium">월별 리워드 지급액</th>
                        </tr>
                      </thead>
                      <tbody>
                        {months.map((month, index) => {
                          const usageRaw = Array.isArray(music.monthlyUsage) ? music.monthlyUsage[index] : 0
                          const usage = typeof usageRaw === 'number' && isFinite(usageRaw) ? usageRaw : 0
                          const monthlyLimit = typeof (music as any).monthlyLimit === 'number' && isFinite((music as any).monthlyLimit) ? (music as any).monthlyLimit as number : null
                          const usageRate = monthlyLimit ? Math.round((usage / monthlyLimit) * 100) : null
                          const rpp = typeof (music as any).rewardPerPlay === 'number' && isFinite((music as any).rewardPerPlay) ? (music as any).rewardPerPlay as number : 0
                          const monthlyReward = usage * rpp
                          
                          return (
                            <tr key={month} className="border-b border-white/5">
                              <td className="px-4 py-3 font-medium text-white text-center">{month}</td>
                              <td className="px-4 py-3 text-teal-400 font-medium text-center">{usage.toLocaleString()}</td>
                              <td className="px-4 py-3 text-white/80 text-center">{Math.floor(usage / 100)}개</td>
                              <td className="px-4 py-3 text-center">
                                {usageRate !== null ? (
                                  <div className="flex items-center justify-center gap-3">
                                    <div className="w-20 bg-white/10 rounded-full h-1.5">
                                      <div
                                        className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(usageRate, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-white/70 text-xs font-medium">{usageRate}%</span>
                                  </div>
                                ) : (
                                  <span className="text-white/50 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-teal-400 font-medium text-center">
                                {monthlyReward.toLocaleString()} 토큰
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 기업별 리워드 적립 현황 탭 */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                {/* 사용 기업 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                      월별 사용 기업 현황
                    </h3>
                    <select 
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                      onChange={(e) => {
                        // 월별 필터링 로직 (필요시 구현)
                      }}
                    >
                      <option value="all">전체 기간</option>
                      {months.map((month, index) => (
                        <option key={month} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* 선택된 월의 모든 사용 기업 테이블 */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-center">
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-white/80 font-medium text-center">순위</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">기업명</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">등급</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">월 리워드 적립</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">전월 대비</th>
                          <th className="px-4 py-3 text-white/80 font-medium text-center">전체 리워드 대비</th>
                        </tr>
                      </thead>
                      <tbody>
                        {music.topCompanies.map((company, index) => {
                          // 리워드 기반 데이터 생성
                          const monthlyReward = Math.floor(company.usage * music.rewardPerPlay * 1000) / 1000 // 소수점 3자리
                          const prevMonthReward = Math.floor(company.usage * music.rewardPerPlay * 0.8 * 1000) / 1000 // 전월은 80% 가정
                          const rewardChange = monthlyReward - prevMonthReward
                          const rewardChangePercent = Math.round((rewardChange / prevMonthReward) * 100)
                          
                          // 전체 리워드 대비 비율 계산
                          const totalMonthlyReward = music.topCompanies.reduce((sum, c) => 
                            sum + Math.floor(c.usage * music.rewardPerPlay * 1000) / 1000, 0
                          )
                          const rewardShare = Math.round((monthlyReward / totalMonthlyReward) * 100)
                          
                          return (
                            <tr key={company.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <span className={`text-sm font-bold ${
                                  index === 0 ? 'text-teal-400' :
                                  index === 1 ? 'text-teal-400' :
                                  index === 2 ? 'text-teal-400' :
                                  'text-white'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-white text-center">{company.name}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  company.tier === 'Business' ? 'bg-gradient-to-r from-purple-400/15 to-purple-500/15 text-purple-300 border border-purple-400/25' :
                                  company.tier === 'Standard' ? 'bg-gradient-to-r from-blue-400/15 to-blue-500/15 text-blue-300 border border-blue-400/25' :
                                  'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                                }`}>
                                  {company.tier}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-teal-400 font-medium text-center">{monthlyReward.toFixed(3)} 토큰</td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-xs font-medium text-teal-400">
                                  {rewardChange > 0 ? '+' : ''}{rewardChange.toFixed(3)} ({rewardChangePercent > 0 ? '+' : ''}{rewardChangePercent}%)
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 bg-white/10 rounded-full h-1.5">
                                    <div 
                                      className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(rewardShare, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-white/70 text-xs">{rewardShare}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>


                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 