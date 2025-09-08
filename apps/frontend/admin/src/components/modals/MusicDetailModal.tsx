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
  duration: string
  artist: string
}

type Props = {
  open: boolean
  onClose: () => void
  music: Music | null
}

export default function MusicDetailModal({ open, onClose, music }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'usage' | 'rewards'>('info')

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
              { id: 'info', label: '음원 기본 정보' },
              { id: 'usage', label: '사용 현황' },
              { id: 'rewards', label: '리워드 현황' }
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
            {/* 음원 기본 정보 탭 */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* 음원 개요 카드 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    음원 개요
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">음원명</span>
                        <span className="text-white font-medium">{music.title}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">아티스트</span>
                        <span className="text-white">{music.artist}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">카테고리</span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(music.category).bg} ${getCategoryColor(music.category).text} border ${getCategoryColor(music.category).border}`}>
                          {music.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-white/60 text-sm">상태</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(music.status)}`}></div>
                          <span className="text-white">
                            {music.status === 'active' ? '활성' : '비활성'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">출시일</span>
                        <span className="text-white">{music.releaseDate}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">재생 시간</span>
                        <span className="text-white">{music.duration}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">호출당 리워드</span>
                        <span className="text-white">{music.rewardPerPlay.toFixed(3)} 토큰</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-white/60 text-sm">평균 평점</span>
                        <span className="text-white">{music.averageRating.toFixed(1)}/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 사용 현황 탭 */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* 월별 API 사용량 차트 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">월별 API 사용량</h3>
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
                  <h3 className="text-lg font-semibold text-white mb-4">월별 사용 상세 현황</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left">
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-white/80 font-medium">월</th>
                          <th className="px-4 py-3 text-white/80 font-medium">사용 횟수</th>
                          <th className="px-4 py-3 text-white/80 font-medium">사용 기업</th>
                          <th className="px-4 py-3 text-white/80 font-medium">사용률</th>
                          <th className="px-4 py-3 text-white/80 font-medium">트렌드</th>
                        </tr>
                      </thead>
                      <tbody>
                        {months.map((month, index) => {
                          const usage = music.monthlyUsage[index]
                          const usageRate = music.monthlyLimit ? Math.round((usage / music.monthlyLimit) * 100) : null
                          const trend = index > 0 ? usage - music.monthlyUsage[index - 1] : 0
                          
                          return (
                            <tr key={month} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 font-medium text-white">{month}</td>
                              <td className="px-4 py-3 text-teal-400 font-medium">{usage.toLocaleString()}</td>
                              <td className="px-4 py-3 text-white/80">{Math.floor(usage / 100)}개</td>
                              <td className="px-4 py-3">
                                {usageRate !== null ? (
                                  <div className="flex items-center gap-3">
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
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium ${
                                  trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-white/60'
                                }`}>
                                  {trend > 0 ? '+' : ''}{trend.toLocaleString()}
                                </span>
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

            {/* 리워드 현황 탭 */}
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
                      <thead className="text-left">
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-white/80 font-medium">순위</th>
                          <th className="px-4 py-3 text-white/80 font-medium">기업명</th>
                          <th className="px-4 py-3 text-white/80 font-medium">등급</th>
                          <th className="px-4 py-3 text-white/80 font-medium">월 사용량</th>
                          <th className="px-4 py-3 text-white/80 font-medium">전월 대비</th>
                          <th className="px-4 py-3 text-white/80 font-medium">사용률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {music.topCompanies.map((company, index) => {
                          // 더미 월별 데이터 생성
                          const monthlyUsage = Math.floor(company.usage / 12) + Math.floor(Math.random() * 200) + 100
                          const prevMonthUsage = Math.floor(company.usage / 12) + Math.floor(Math.random() * 200) + 80
                          const change = monthlyUsage - prevMonthUsage
                          const changePercent = Math.round((change / prevMonthUsage) * 100)
                          const usageRate = Math.round((monthlyUsage / Math.max(...music.topCompanies.map(c => Math.floor(c.usage / 12) + 200))) * 100)
                          
                          return (
                            <tr key={company.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3">
                                <span className={`text-sm font-bold ${
                                  index === 0 ? 'text-teal-400' :
                                  index === 1 ? 'text-teal-400' :
                                  index === 2 ? 'text-teal-400' :
                                  'text-white'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-white">{company.name}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  company.tier === 'Business' ? 'bg-gradient-to-r from-purple-400/15 to-purple-500/15 text-purple-300 border border-purple-400/25' :
                                  company.tier === 'Standard' ? 'bg-gradient-to-r from-blue-400/15 to-blue-500/15 text-blue-300 border border-blue-400/25' :
                                  'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                                }`}>
                                  {company.tier}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-teal-400 font-medium">{monthlyUsage.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium ${
                                  change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-white/60'
                                }`}>
                                  {change > 0 ? '+' : ''}{change.toLocaleString()} ({changePercent > 0 ? '+' : ''}{changePercent}%)
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-white/10 rounded-full h-1.5">
                                    <div 
                                      className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(usageRate, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-white/70 text-xs">{usageRate}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 요약 통계 */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg border border-white/10">
                      <div className="text-lg font-bold text-teal-400">{music.companies}</div>
                      <div className="text-xs text-white/60">총 사용 기업</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-white/10">
                      <div className="text-lg font-bold text-white">
                        {Math.round(music.totalPlays / music.companies).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/60">기업당 평균</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-white/10">
                      <div className="text-lg font-bold text-teal-400">
                        {Math.round(music.totalRewards / music.companies).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/60">기업당 리워드</div>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-white/10">
                      <div className="text-lg font-bold text-white">
                        {Math.round(music.topCompanies[0]?.usage / Math.max(...music.topCompanies.map(c => c.usage)) * 100)}%
                      </div>
                      <div className="text-xs text-white/60">1위 점유율</div>
                    </div>
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