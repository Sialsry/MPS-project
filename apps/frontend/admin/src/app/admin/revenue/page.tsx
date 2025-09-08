'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import BarCategoryTop5 from '@/components/charts/BarCategoryTop5'
import PieTierDistribution from '@/components/charts/PieTierDistribution'

export default function RevenueDashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [company, setCompany] = useState<'전체'|'Company A'|'Company B'|'Company C'|'Company D'>('전체')
  const [lifecycleFilter, setLifecycleFilter] = useState<'전체'|'1월'|'2월'|'3월'|'4월'|'5월'|'6월'|'7월'|'8월'|'9월'|'10월'|'11월'|'12월'>('전체')

  // KPI 데이터
  const kpis = [
    { 
      title: '이번 달 매출', 
      value: '₩12,345,678', 
      change: '+15.3%', 
      detail: '전월: ₩10,714,286',
      note: '* 구독료 기준'
    },
    { 
      title: '연간 누적 매출', 
      value: '₩98,765,432', 
      change: '+8.7%', 
      detail: '작년: ₩90,857,143',
      note: '* 누적 기준'
    },
    { 
      title: '평균 ARPU', 
      value: '₩234,567', 
      change: '+12.5%', 
      detail: '전월: ₩208,571',
      note: '* 기업당 평균'
    },
    { 
      title: '구독 이탈률', 
      value: '2.1%', 
      change: '-0.3%', 
      detail: '전월: 2.4%',
      note: '* 월간 기준'
    },
  ]

  // TOP 기업 데이터
  const standardTop = [
    { name: 'Company A', amount: 1234567, pct: 35, growth: '+12.3%' },
    { name: 'Company B', amount: 987654, pct: 28, growth: '+8.7%' },
    { name: 'Company C', amount: 654321, pct: 18, growth: '+15.2%' },
    { name: 'Company D', amount: 432198, pct: 12, growth: '+5.4%' },
    { name: '기타 5개사', amount: 234567, pct: 7, growth: '+3.1%' },
  ]
  const businessTop = [
    { name: 'Company A', amount: 1234567, pct: 35, growth: '+18.9%' },
    { name: 'Company B', amount: 987654, pct: 28, growth: '+11.2%' },
    { name: 'Company C', amount: 654321, pct: 18, growth: '+22.5%' },
    { name: 'Company D', amount: 432198, pct: 12, growth: '+7.8%' },
    { name: '기타 5개사', amount: 234567, pct: 7, growth: '+4.2%' },
  ]

  // 차트 데이터
  const labels = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  
  const series = [
    {
      label: 'Free',
      data: [400, 480, 540, 600, 680, 720, 800, 880, 920, 1000, 1080, 1200]
    },
    {
      label: 'Standard',
      data: [600, 720, 810, 900, 980, 1100, 1200, 1300, 1400, 1500, 1600, 1750]
    },
    {
      label: 'Business',
      data: [800, 960, 1080, 1200, 1300, 1450, 1600, 1750, 1900, 2050, 2200, 2400]
    }
  ]

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

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full px-6 py-6">
      {/* KPI Cards */}
      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {kpis.map((kpi, i) => (
            <Card key={i}>
              <div className="space-y-1">
                <Title variant="card">{kpi.title}</Title>
                <div className="text-3xl font-bold text-white">{kpi.value}</div>
                <div className="space-y-0.5">
                  <div className="text-sm text-teal-300">({kpi.change})</div>
                  <div className="mt-2 space-y-0.5">
                    <div className="text-xs text-white/60">{kpi.detail}</div>
                    <div className="text-xs text-white/60">{kpi.note}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section className="mb-8">
        <Title variant="section" className="mb-4">매출 분석</Title>
        <div className="grid gap-5 [grid-template-columns:2fr_1fr] max-[1200px]:grid-cols-1">
          <Card>
            <Title variant="card" className="mb-4">월별 매출 추이 (등급별)</Title>
            <div className="h-80">
              <SimpleLineChart labels={labels} series={series} />
            </div>
          </Card>
                    <Card>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Title variant="card" className="mb-0">구독 생명주기 분석</Title>
              <select 
                value={lifecycleFilter} 
                onChange={e=>setLifecycleFilter(e.target.value as any)} 
                className="rounded bg-black/40 px-2 py-1 text-white text-xs outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60"
              >
                <option value="전체">전체</option>
                <option value="1월">1월</option>
                <option value="2월">2월</option>
                <option value="3월">3월</option>
                <option value="4월">4월</option>
                <option value="5월">5월</option>
                <option value="6월">6월</option>
                <option value="7월">7월</option>
                <option value="8월">8월</option>
                <option value="9월">9월</option>
                <option value="10월">10월</option>
                <option value="11월">11월</option>
                <option value="12월">12월</option>
              </select>
            </div>
            <div className="h-80">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white/70 mb-1">구독 갱신</div>
                    <div className="text-2xl font-bold text-teal-400 mb-2">
                      {lifecycleFilter === '전체' ? '1,080' : 
                       lifecycleFilter === '12월' ? '1,080' :
                       lifecycleFilter === '11월' ? '1,050' :
                       lifecycleFilter === '10월' ? '1,020' :
                       lifecycleFilter === '9월' ? '1,000' :
                       lifecycleFilter === '8월' ? '980' :
                       lifecycleFilter === '7월' ? '950' :
                       lifecycleFilter === '6월' ? '920' :
                       lifecycleFilter === '5월' ? '900' :
                       lifecycleFilter === '4월' ? '880' :
                       lifecycleFilter === '3월' ? '850' :
                       lifecycleFilter === '2월' ? '820' : '800'}
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      {lifecycleFilter === '전체' ? '+8.2%' : '+5.2%'}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white/70 mb-1">신규 구독</div>
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {lifecycleFilter === '전체' ? '230' : 
                       lifecycleFilter === '12월' ? '230' :
                       lifecycleFilter === '11월' ? '220' :
                       lifecycleFilter === '10월' ? '210' :
                       lifecycleFilter === '9월' ? '200' :
                       lifecycleFilter === '8월' ? '190' :
                       lifecycleFilter === '7월' ? '180' :
                       lifecycleFilter === '6월' ? '175' :
                       lifecycleFilter === '5월' ? '160' :
                       lifecycleFilter === '4월' ? '140' :
                       lifecycleFilter === '3월' ? '150' :
                       lifecycleFilter === '2월' ? '135' : '120'}
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      {lifecycleFilter === '전체' ? '+15.3%' : '+12.1%'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white/70 mb-1">업그레이드</div>
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {lifecycleFilter === '전체' ? '52' : 
                       lifecycleFilter === '12월' ? '52' :
                       lifecycleFilter === '11월' ? '50' :
                       lifecycleFilter === '10월' ? '48' :
                       lifecycleFilter === '9월' ? '45' :
                       lifecycleFilter === '8월' ? '42' :
                       lifecycleFilter === '7월' ? '40' :
                       lifecycleFilter === '6월' ? '38' :
                       lifecycleFilter === '5월' ? '35' :
                       lifecycleFilter === '4월' ? '32' :
                       lifecycleFilter === '3월' ? '30' :
                       lifecycleFilter === '2월' ? '28' : '25'}
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      {lifecycleFilter === '전체' ? '+4.0%' : '+3.2%'}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white/70 mb-1">구독 취소</div>
                    <div className="text-2xl font-bold text-red-400 mb-2">
                      {lifecycleFilter === '전체' ? '42' : 
                       lifecycleFilter === '12월' ? '42' :
                       lifecycleFilter === '11월' ? '40' :
                       lifecycleFilter === '10월' ? '38' :
                       lifecycleFilter === '9월' ? '35' :
                       lifecycleFilter === '8월' ? '32' :
                       lifecycleFilter === '7월' ? '30' :
                       lifecycleFilter === '6월' ? '28' :
                       lifecycleFilter === '5월' ? '25' :
                       lifecycleFilter === '4월' ? '22' :
                       lifecycleFilter === '3월' ? '20' :
                       lifecycleFilter === '2월' ? '18' : '15'}
                    </div>
                    <div className="text-sm text-red-400 font-medium">
                      {lifecycleFilter === '전체' ? '+5.0%' : '+4.1%'}
                    </div>
                  </div>
                </div>
                
                {/* 간단한 요약 */}
                <div className="flex justify-center items-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-teal-400">
                      {lifecycleFilter === '전체' ? '85.2%' : '82.1%'}
                    </div>
                    <div className="text-white/60">갱신율</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-400">
                      {lifecycleFilter === '전체' ? '22.6%' : '20.8%'}
                    </div>
                    <div className="text-white/60">업그레이드율</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-400">
                      {lifecycleFilter === '전체' ? '3.9%' : '3.5%'}
                    </div>
                    <div className="text-white/60">이탈률</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* TOP Companies Section */}
      <section className="mb-8">
        <Title variant="section" className="mb-4">기업별 매출 현황</Title>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
          {/* Standard TOP */}
          <Card>
            <Title variant="card" className="mb-4">Standard 등급 TOP 매출 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">비중</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">성장률</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {standardTop.map((company, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 px-3 font-medium ${
                        i < 3 ? 'text-teal-300' : 'text-white/60'
                      }`}>{i + 1}</td>
                      <td className="py-2 px-3 text-white/80">{company.name}</td>
                      <td className="py-2 px-3 text-white/70">₩{company.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white/60">{company.pct}%</td>
                      <td className="py-2 px-3 text-green-400">{company.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Business TOP */}
          <Card>
            <Title variant="card" className="mb-4">Business 등급 TOP 매출 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">비중</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-white/60">성장률</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {businessTop.map((company, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 px-3 font-medium ${
                        i < 3 ? 'text-teal-300' : 'text-white/60'
                      }`}>{i + 1}</td>
                      <td className="py-2 px-3 text-white/80">{company.name}</td>
                      <td className="py-2 px-3 text-white/70">₩{company.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white/60">{company.pct}%</td>
                      <td className="py-2 px-3 text-green-400">{company.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>



    </div>
  )
} 