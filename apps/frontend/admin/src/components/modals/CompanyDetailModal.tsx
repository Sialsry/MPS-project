'use client'

import { useState } from 'react'
import SimpleLineChart from '@/components/charts/SimpleLineChart'

type Company = {
  id: string
  name: string
  tier: string
  totalTokens: number
  monthlyEarned: number
  monthlyUsed: number
  usageRate: number
  activeTracks: number
  status: 'active' | 'inactive' | 'suspended'
  lastActivity: string
  joinedDate: string
  contactEmail: string
  contactPhone: string
  businessNumber: string
  subscriptionStart: string
  subscriptionEnd: string
  monthlyUsage: number[]
  monthlyRewards: number[]
  topTracks: Array<{ title: string; usage: number; category: string }>
  // 추가 필드들
  ceoName: string
  profileImageUrl: string
  homepageUrl: string
  smartAccountAddress: string
  apiKeyHash: string
  createdAt: string
  updatedAt: string
}

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
            {/* 기업 기본 정보 탭 */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* 기업 기본 정보 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300" />
                      <div className="text-lg font-semibold">기업 기본 정보</div>
                    </div>
                    <div className="flex gap-8 items-start">
                      {/* 회사 이미지 */}
                      <div className="flex-shrink-0">
                        <div className="w-64 h-64 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                          {company.profileImageUrl ? (
                            <img 
                              src={company.profileImageUrl} 
                              alt={`${company.name} 로고`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  target.nextElementSibling.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${company.profileImageUrl ? 'hidden' : ''}`}>
                            <div className="text-center">
                              <svg className="w-20 h-20 mx-auto text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <div className="text-xs text-white/40">회사 이미지</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 기업 정보 */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                          <div>
                            <div className="text-white/60 mb-1">기업명</div>
                            <div className="text-white font-medium">{company.name}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">등급</div>
                            <div className="text-white font-medium">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                company.tier === 'Business' ? 'bg-gradient-to-r from-purple-400/15 to-purple-500/15 text-purple-300 border border-purple-400/25' :
                                company.tier === 'Standard' ? 'bg-gradient-to-r from-blue-400/15 to-blue-500/15 text-blue-300 border border-blue-400/25' :
                                'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                              }`}>
                                {company.tier}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">대표자명</div>
                            <div className="text-white font-medium">{company.ceoName}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">사업자 번호</div>
                            <div className="text-white font-medium">{company.businessNumber}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">이메일</div>
                            <div className="text-white font-medium">{company.contactEmail}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">전화번호</div>
                            <div className="text-white font-medium">{company.contactPhone}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">홈페이지</div>
                            <div className="text-white font-medium">
                              {company.homepageUrl ? (
                                <a href={company.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">
                                  {company.homepageUrl}
                                </a>
                              ) : (
                                <span className="text-white/40">-</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">스마트어카운트</div>
                            <div className="text-white font-medium font-mono text-xs">
                              {company.smartAccountAddress ? (
                                <span className="text-teal-400">
                                  {company.smartAccountAddress.slice(0, 8)}...{company.smartAccountAddress.slice(-6)}
                                </span>
                              ) : (
                                <span className="text-white/40">-</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">가입일</div>
                            <div className="text-white font-medium">{company.createdAt}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">수정일</div>
                            <div className="text-white font-medium">{company.updatedAt}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">구독 시작일</div>
                            <div className="text-white font-medium">{company.subscriptionStart}</div>
                          </div>
                          <div>
                            <div className="text-white/60 mb-1">구독 종료일</div>
                            <div className="text-white font-medium">{company.subscriptionEnd}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 핵심 지표 */}
                <div className="rounded-xl border border-white/10 p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-4 w-1.5 rounded bg-teal-300" />
                      <div className="text-lg font-semibold">핵심 지표</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-white/60 mb-1">보유 토큰</div>
                        <div className="text-teal-400 font-medium">{company.totalTokens.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">이번 달 적립</div>
                        <div className="text-teal-400 font-medium">+{company.monthlyEarned.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">이번 달 사용</div>
                        <div className="text-white font-medium">{company.monthlyUsed.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">활성 음원</div>
                        <div className="text-white font-medium">{company.activeTracks}개</div>
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
                    월별 리워드 발생 API호출 추이
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
                          <th className="px-4 py-3 text-white/80 font-medium">리워드 발생 횟수(유효재생)</th>
                          <th className="px-4 py-3 text-white/80 font-medium">적립 리워드</th>
                          <th className="px-4 py-3 text-white/80 font-medium">최근 사용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.topTracks.map((track, index) => {
                          const usagePercentage = Math.round((track.usage / Math.max(...company.topTracks.map(t => t.usage))) * 100)
                          return (
                            <tr key={track.title} className="border-b border-white/5 hover:bg-white/5 transition-colors">
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
                              <td className="px-4 py-3 font-medium text-white">{track.title}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
                                  {track.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-teal-400 font-medium">{track.usage.toLocaleString()}</td>
                              <td className="px-4 py-3 text-teal-400 font-medium">
                                {(track.usage * 0.007).toFixed(1)} 토큰
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
                              <td className="px-4 py-3 text-teal-400">
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
                      <div className="text-2xl font-bold text-teal-400 mb-1">
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