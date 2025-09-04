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
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // 달력 데이터 생성
  const generateCalendarData = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const calendar = []
    const currentDate = new Date(startDate)
    
    for (let week = 0; week < 6; week++) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const isCurrentMonth = currentDate.getMonth() === month
        const isToday = currentDate.toDateString() === new Date().toDateString()
        
        // 고정 매출 데이터 (실제로는 API에서 가져올 데이터)
        const subscriptionRevenue = isCurrentMonth ? 250000 : 0
        const usageRevenue = isCurrentMonth ? 120000 : 0
        const totalRevenue = subscriptionRevenue + usageRevenue
        
        weekData.push({
          date: new Date(currentDate),
          isCurrentMonth,
          isToday,
          subscriptionRevenue,
          usageRevenue,
          totalRevenue
        })
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      calendar.push(weekData)
    }
    
    return calendar
  }

  const calendarData = generateCalendarData(currentMonth)

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
  
  const subscriptionSeries = [
    {
      label: 'Standard',
      data: [4000000, 4200000, 4400000, 4600000, 4800000, 5000000, 5200000, 5400000, 5600000, 5800000, 6000000, 6200000]
    },
    {
      label: 'Business',
      data: [2500000, 2700000, 2900000, 3100000, 3300000, 3500000, 3700000, 3900000, 4100000, 4300000, 4500000, 4700000]
    }
  ]

  const usageSeries = [
    {
      label: '일반음원',
      data: [1500000, 1650000, 1800000, 1950000, 2100000, 2250000, 2400000, 2550000, 2700000, 2850000, 3000000, 3150000]
    },
    {
      label: '가사만',
      data: [600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000, 1000000, 1050000, 1100000, 1150000]
    },
    {
      label: 'Inst음원',
      data: [400000, 450000, 500000, 550000, 600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000]
    }
  ]



  const formatRevenue = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return amount.toString()
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentMonth(newDate)
  }

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
      {/* 달력 섹션 */}
      <section className="mb-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title variant="section">월별 매출 달력</Title>
            
            {/* 월별 요약 정보 */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-white/60">이번 달 구독료</div>
                <div className="text-base font-bold text-teal-400">₩7,750,000</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60">이번 달 사용료</div>
                <div className="text-base font-bold text-blue-400">₩3,720,000</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60">이번 달 총 매출</div>
                <div className="text-lg font-bold text-white">₩11,470,000</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeMonth('prev')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm"
              >
                ◀
              </button>
              <span className="text-base font-medium text-white">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </span>
              <button
                onClick={() => changeMonth('next')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm"
              >
                ▶
              </button>
            </div>
          </div>
          
                    <div className="grid grid-cols-7">
            {/* 요일 헤더 */}
            <div className="p-2 text-center text-xs font-medium text-white/60">일</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">월</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">화</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">수</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">목</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">금</div>
            <div className="p-2 text-center text-xs font-medium text-white/60">토</div>
            
            {/* 날짜 그리드 */}
            {calendarData.flat().map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[60px] p-2 border-b border-r border-white/10
                  ${!day.isCurrentMonth ? 'opacity-40' : ''}
                  ${day.isToday ? 'bg-teal-500/20 border-teal-400' : ''}
                  ${index % 7 === 6 ? 'border-r-0' : ''}
                  ${index >= calendarData.flat().length - 7 ? 'border-b-0' : ''}
                `}
              >
                <div className="text-xs text-white/60 mb-1">
                  {day.date.getDate()}
                </div>
                {day.isCurrentMonth && day.totalRevenue > 0 && (
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white">
                      ₩{formatRevenue(day.totalRevenue)}
                    </div>
                    <div className="text-xs text-teal-400">
                      구독: ₩{formatRevenue(day.subscriptionRevenue)}
                    </div>
                    <div className="text-xs text-blue-400">
                      사용: ₩{formatRevenue(day.usageRevenue)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          
        </Card>
      </section>

      {/* Charts Section */}
      <section className="mb-8">
        <Title variant="section" className="mb-4">매출 분석</Title>
        <div className="grid gap-5 [grid-template-columns:1fr_1fr] max-[1200px]:grid-cols-1">
          <Card>
            <Title variant="card" className="mb-4">월별 구독료 추이</Title>
            <div className="h-80">
              <SimpleLineChart labels={labels} series={subscriptionSeries} />
            </div>
          </Card>
          <Card>
            <Title variant="card" className="mb-4">월별 사용료 추이</Title>
            <div className="h-80">
              <SimpleLineChart labels={labels} series={usageSeries} />
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
            <Title variant="card" className="mb-4">Standard 등급 TOP 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">비중</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {standardTop.map((company, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 px-3 font-medium text-center ${
                        i < 3 ? 'text-teal-300' : 'text-white/60'
                      }`}>{i + 1}</td>
                      <td className="py-2 px-3 text-white/80 text-center">{company.name}</td>
                      <td className="py-2 px-3 text-teal-400 font-semibold text-center">₩{company.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white/60 text-center">{company.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Business TOP */}
          <Card>
            <Title variant="card" className="mb-4">Business 등급 TOP 기업</Title>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">순위</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">기업명</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">매출</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-white/60">비중</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {businessTop.map((company, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 px-3 font-medium text-center ${
                        i < 3 ? 'text-teal-300' : 'text-white/60'
                      }`}>{i + 1}</td>
                      <td className="py-2 px-3 text-white/80 text-center">{company.name}</td>
                      <td className="py-2 px-3 text-teal-400 font-semibold text-center">₩{company.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white/60 text-center">{company.pct}%</td>
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