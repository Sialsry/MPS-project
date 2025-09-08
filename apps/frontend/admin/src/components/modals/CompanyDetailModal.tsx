'use client'

import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import { Company } from '@/lib/types'

type Props = {
  open: boolean
  onClose: () => void
  company: Company | null
}

export default function CompanyDetailModal({ open, onClose, company }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'usage' | 'rewards'>('info')

  if (!open || !company) return null

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  const usageData = {
    labels: months,
    series: [
      { label: '현재 기업', data: company.monthlyUsage },
      { label: '업계 평균', data: [1200, 1350, 1100, 1400, 1600, 1800, 2000, 1900, 2100, 1950, 2200, 2400] }
    ]
  }

  const rewardsData = {
    labels: months,
    datasets: [
      {
        label: '적립',
        data: company.monthlyRewards,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Business': return 'from-purple-400/15 to-purple-500/15 text-purple-300 border-purple-400/25'
      case 'Standard': return 'from-blue-400/15 to-blue-500/15 text-blue-300 border-blue-400/25'
      case 'Free': return 'from-gray-400/15 to-gray-500/15 text-gray-300 border-gray-400/25'
      default: return 'from-teal-400/15 to-blue-400/15 text-teal-300 border-teal-400/25'
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
              <h2 className="text-xl font-semibold text-white">{company.name} 상세 정보</h2>
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
              { id: 'info', label: '기업 기본 정보' },
              { id: 'usage', label: '음원 사용 현황' },
              { id: 'rewards', label: '리워드 현황' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === tab.id
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
            {/* 기업 기본 정보 탭 */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* 기업 개요 카드 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    기업 개요
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">기업명</span>
                        <span className="text-white font-medium">{company.name}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">등급</span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(company.tier)}`}>
                          {company.tier}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">가입일</span>
                        <span className="text-white">{company.joinedDate}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-white/60 text-sm">사업자 번호</span>
                        <span className="text-white">{company.businessNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">이메일</span>
                        <span className="text-white">{company.contactEmail}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-white/60 text-sm">전화번호</span>
                        <span className="text-white">{company.contactPhone}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-white/60 text-sm">구독 시작일</span>
                        <span className="text-white">{company.subscriptionStart}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-white/60 text-sm">구독 종료일</span>
                        <span className="text-white">{company.subscriptionEnd}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 핵심 지표 카드 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    핵심 지표
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-teal-400 mb-1">{company.totalTokens.toLocaleString()}</div>
                      <div className="text-sm text-white/80">보유 토큰</div>
                      <div className="text-xs text-white/50 mt-1">현재 잔액</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-teal-400 mb-1">+{company.monthlyEarned.toLocaleString()}</div>
                      <div className="text-sm text-white/80">이번 달 적립</div>
                      <div className="text-xs text-white/50 mt-1">신규 적립</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-teal-400 mb-1">{company.monthlyUsed.toLocaleString()}</div>
                      <div className="text-sm text-white/80">이번 달 사용</div>
                      <div className="text-xs text-white/50 mt-1">소모량</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-teal-400 mb-1">{company.activeTracks}</div>
                      <div className="text-sm text-white/80">활성 음원</div>
                      <div className="text-xs text-white/50 mt-1">사용 중</div>
                    </div>
                  </div>
                </div>

                {/* 사용률 및 활동 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    사용률 및 활동 현황
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">토큰 사용률</span>
                        <span className="text-white font-medium">{company.usageRate}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${company.usageRate}%` }}
                        />
                      </div>
                      <div className="text-xs text-white/50">
                        월 한도 대비 {company.usageRate}% 사용 중
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">최근 활동</span>
                        <span className="text-white">{company.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 음원 사용 현황 탭 */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* 월별 API 사용량 차트 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    월별 API 사용량
                  </h3>
                  <div className="h-64">
                    <SimpleLineChart
                      labels={months}
                      series={[
                        { label: '현재 기업', data: company.monthlyUsage },
                        { label: '업계 평균', data: [1200, 1350, 1100, 1400, 1600, 1800, 2000, 1900, 2100, 1950, 2200, 2400] }
                      ]}
                      colors={['#14b8a6', '#9ca3af']}
                    />
                  </div>
                </div>

                {/* 전체 음원 사용 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                      전체 음원 사용 현황
                    </h3>
                    <select
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                      onChange={(e) => {
                        // 월별 필터링 로직 구현 예정
                      }}
                    >
                      <option value="all">전체 기간</option>
                      <option value="1">1월</option>
                      <option value="2">2월</option>
                      <option value="3">3월</option>
                      <option value="4">4월</option>
                      <option value="5">5월</option>
                      <option value="6">6월</option>
                      <option value="7">7월</option>
                      <option value="8">8월</option>
                      <option value="9">9월</option>
                      <option value="10">10월</option>
                      <option value="11">11월</option>
                      <option value="12">12월</option>
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left">
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-white/80 font-medium">순위</th>
                          <th className="px-4 py-3 text-white/80 font-medium">음원명</th>
                          <th className="px-4 py-3 text-white/80 font-medium">카테고리</th>
                          <th className="px-4 py-3 text-white/80 font-medium">사용 횟수</th>
                          <th className="px-4 py-3 text-white/80 font-medium">사용률</th>
                          <th className="px-4 py-3 text-white/80 font-medium">최근 사용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.topTracks.map((track, index) => {
                          const usagePercentage = Math.round((track.usage / Math.max(...company.topTracks.map(t => t.usage))) * 100)
                          return (
                            <tr key={track.title} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3">
                                <span className={`text-sm font-bold ${index === 0 ? 'text-teal-400' :
                                    index === 1 ? 'text-teal-400' :
                                      index === 2 ? 'text-teal-400' :
                                        'text-white'
                                  }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-white">{track.title}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
                                  {track.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-teal-400 font-medium">{track.usage.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-white/10 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-teal-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${usagePercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-white/70 text-xs">{usagePercentage}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-white/60 text-xs">
                                {new Date().toLocaleDateString('ko-KR')}
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
                {/* 월별 리워드 적립 차트 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    월별 리워드 적립
                  </h3>
                  <div className="h-64">
                    <SimpleLineChart
                      labels={months}
                      series={[
                        { label: '현재 기업', data: company.monthlyRewards },
                        { label: '업계 평균', data: [8000, 9500, 11000, 12500, 14000, 15500, 17000, 16500, 18000, 17500, 19000, 20500] }
                      ]}
                      colors={['#14b8a6', '#9ca3af']}
                    />
                  </div>
                </div>

                {/* 월별 리워드 상세 현황 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    월별 리워드 상세 현황
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left">
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-white/80 font-medium">월</th>
                          <th className="px-4 py-3 text-white/80 font-medium">총 적립</th>
                          <th className="px-4 py-3 text-white/80 font-medium">월별 적립</th>
                          <th className="px-4 py-3 text-white/80 font-medium">구독제 할인 사용</th>
                          <th className="px-4 py-3 text-white/80 font-medium">남은 리워드</th>
                          <th className="px-4 py-3 text-white/80 font-medium">누적 잔액</th>
                        </tr>
                      </thead>
                      <tbody>
                        {months.map((month, index) => {
                          const monthlyReward = company.monthlyRewards[index]
                          const subscriptionDiscount = Math.floor(monthlyReward * 0.3) // 30% 할인 사용 가정
                          const remainingReward = monthlyReward - subscriptionDiscount
                          const cumulativeBalance = company.monthlyRewards.slice(0, index + 1).reduce((sum, reward) => sum + reward, 0)

                          return (
                            <tr key={month} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 font-medium text-white">{month}</td>
                              <td className="px-4 py-3 text-teal-400 font-medium">
                                {monthlyReward.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-white/80">
                                +{monthlyReward.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-orange-400">
                                -{subscriptionDiscount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-white/80">
                                {remainingReward.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-teal-400 font-medium">
                                {cumulativeBalance.toLocaleString()}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 연간 요약 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
                    연간 리워드 요약
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-teal-400 mb-1">
                        {company.monthlyRewards.reduce((sum, reward) => sum + reward, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-white/80">총 적립 리워드</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-orange-400 mb-1">
                        {company.monthlyRewards.reduce((sum, reward) => sum + Math.floor(reward * 0.3), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-white/80">총 할인 사용</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-white mb-1">
                        {company.monthlyRewards.reduce((sum, reward) => sum + (reward - Math.floor(reward * 0.3)), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-white/80">총 남은 리워드</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-white/10">
                      <div className="text-2xl font-bold text-teal-400 mb-1">
                        {Math.round(company.monthlyRewards.reduce((sum, reward) => sum + reward, 0) / 12).toLocaleString()}
                      </div>
                      <div className="text-sm text-white/80">월 평균 적립</div>
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