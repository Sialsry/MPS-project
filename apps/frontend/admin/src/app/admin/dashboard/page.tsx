'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import CompanyTotalCard from '@/components/cards/CompanyTotalCard'
import TrackTotalCard from '@/components/cards/TrackTotalCard'
import MonthlyPlaysCard from '@/components/cards/MonthlyPlaysCard'
import MonthlyRevenueCard from '@/components/cards/MonthlyRevenueCard'
import RewardsStatusCard from '@/components/cards/RewardsStatusCard'
import RenewalRateCard from '@/components/cards/RenewalRateCard'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import BarCategoryTop5 from '@/components/charts/BarCategoryTop5'
import PieTierDistribution from '@/components/charts/PieTierDistribution'

export default function DashboardPage() {
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [hourlyLoading, setHourlyLoading] = useState(false)
  const [hourlyError, setHourlyError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [topTracks, setTopTracks] = useState<Array<{ rank: number; validPlays: number; totalPlays: number }>>(
    Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, validPlays: 0, totalPlays: 0 }))
  )

  useEffect(() => {
    // 마지막 업데이트 시간
    const updateTime = () => {
      const now = new Date()
      const s = now.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setLastUpdated(s)
    }
    const fetchHourly = async () => {
      try {
        setHourlyLoading(true)
        setHourlyError(null)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/companies/stats/hourly-plays`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        const data = (j.labels || []).map((label: string, i: number) => ({
          hour: label,
          free: { valid: j.free?.[i] ?? 0, total: j.free?.[i] ?? 0 },
          standard: { valid: j.standard?.[i] ?? 0, total: j.standard?.[i] ?? 0 },
          business: { valid: j.business?.[i] ?? 0, total: j.business?.[i] ?? 0 },
          prevAvg: j.prevAvg?.[i] ?? 0,
        }))
        setHourlyData(data)
      } catch (e: any) {
        setHourlyError(e.message || '조회 실패')
        setHourlyData([])
      } finally {
        setHourlyLoading(false)
      }
    }

    fetchHourly()
    updateTime()

    // 인기 음원 TOP10 데이터는 클라이언트에서만 랜덤 생성하여 SSR/CSR 불일치 방지
    const generateTopTracks = () => {
      const data = Array.from({ length: 10 }, (_, idx) => {
        const validPlays = Math.floor(Math.random() * 2000 + 800)
        const totalPlays = Math.floor(validPlays * (1 + Math.random() * 0.3 + 0.1))
        return { rank: idx + 1, validPlays, totalPlays }
      })
      setTopTracks(data)
    }
    generateTopTracks()

    const interval = setInterval(() => {
      fetchHourly()
      updateTime()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full px-6 py-6">
      <DashboardHeader 
        title="B2B Music Licensing Platform" 
        subtitle="관리자 대시보드 · 유효재생 모니터링"
        lastUpdated={lastUpdated}
      />

      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <TrackTotalCard />
          <CompanyTotalCard />
          <MonthlyPlaysCard />
          <MonthlyRevenueCard />
          <RewardsStatusCard />
          <RenewalRateCard />
        </div>
      </section>

      <section className="mb-8">
        <Title variant="section" className="mb-4">차트 분석</Title>
        <div className="grid gap-5 [grid-template-columns:1.5fr_1fr_0.8fr] max-[1200px]:grid-cols-2 max-md:grid-cols-1">
          <Card>
            <Title variant="card" className="mb-4">24시간 유효재생 (요금제별 + 전일 평균)</Title>
            <div className="h-80">
              <SimpleLineChart 
                labels={hourlyData.map(d => d.hour)}
                series={[
                  { label: 'Free (유효재생)', data: hourlyData.map(d => d.free?.valid || 0) },
                  { label: 'Standard (유효재생)', data: hourlyData.map(d => d.standard?.valid || 0) },
                  { label: 'Business (유효재생)', data: hourlyData.map(d => d.business?.valid || 0) },
                  { label: '전일 평균 (유효재생)', data: hourlyData.map(d => d.prevAvg ?? 0) }
                ]}
              />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">등급별 기업 분포</Title>
            <div className="h-80">
              <PieTierDistribution />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">카테고리 Top5 유효재생</Title>
            <div className="h-80">
              <BarCategoryTop5 />
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-8">
        <Title variant="section" className="mb-4">실시간 모니터링</Title>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
          {/* 실시간 API 호출 */}
          <Card>
            <Title variant="card" className="mb-4">실시간 API 호출</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">상태</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">엔드포인트</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">기업</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">시간</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">/api/rewards/claim</td>
                    <td className="py-2 px-3 text-white/60">MelOn</td>
                    <td className="py-2 px-3 text-white/40">오전 10:38:13</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">/api/music/play</td>
                    <td className="py-2 px-3 text-white/60">Kakao</td>
                    <td className="py-2 px-3 text-white/40">오전 10:38:11</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">/api/rewards/claim</td>
                    <td className="py-2 px-3 text-white/60">MelOn</td>
                    <td className="py-2 px-3 text-white/40">오전 10:38:09</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">/api/auth/verify</td>
                    <td className="py-2 px-3 text-white/60">Kakao</td>
                    <td className="py-2 px-3 text-white/40">오전 10:38:07</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">/api/music/play</td>
                    <td className="py-2 px-3 text-white/60">MelOn</td>
                    <td className="py-2 px-3 text-white/40">오전 10:38:05</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* 인기 음원 TOP 10 */}
          <Card>
            <Title variant="card" className="mb-4">인기 음원 TOP 10 (유효재생)</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">음원명</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">24시간 유효재생</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {topTracks.map(({ rank, validPlays, totalPlays }) => {
                    const denom = totalPlays > 0 ? totalPlays : 1
                    const validRate = Math.round((validPlays / denom) * 100)
                    return (
                      <tr key={rank} className="border-b border-white/5">
                        <td className={`py-2 px-3 font-medium ${rank <= 3 ? 'text-teal-300' : 'text-white/60'}`}>{rank}</td>
                        <td className="py-2 px-3 text-white/80">Track Title {rank}</td>
                        <td className="py-2 px-3 text-white/60">
                          <div className="flex items-center gap-2">
                            <span>{validPlays.toLocaleString()}회</span>
                            <span className="text-xs text-white/50">({validRate}%)</span>
                          </div>
                          <div className="text-xs text-white/40">총 {totalPlays.toLocaleString()}회</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 트랜잭션 현황 */}
          <Card>
            <Title variant="card" className="mb-4">트랜잭션 현황</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">시간</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">상태</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">처리 건수</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">가스비</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">해시</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 text-white/40">오전 10:38:11</td>
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">20/22건</td>
                    <td className="py-2 px-3 text-white/60">0.005 ETH</td>
                    <td className="py-2 px-3 text-white/40">0x86d70c...b07e</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3 text-white/40">오전 10:38:01</td>
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">24/33건</td>
                    <td className="py-2 px-3 text-white/60">0.005 ETH</td>
                    <td className="py-2 px-3 text-white/40">0x4d253c...5313</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-white/40">오전 10:37:51</td>
                    <td className="py-2 px-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </td>
                    <td className="py-2 px-3 text-white/80">19/26건</td>
                    <td className="py-2 px-3 text-white/60">0.003 ETH</td>
                    <td className="py-2 px-3 text-white/40">0x50fde9...20a7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

    </div>
  )
}