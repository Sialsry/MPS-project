import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function MonthlyPlaysCard() {
  // 예시 데이터 (실제로는 API에서 받아올 데이터)
  const validPlays = 524300
  const totalPlays = 612000
  const validRate = Math.round((validPlays / totalPlays) * 100)
  const lastMonthChange = 8 // 전월 대비 변화율
  const dailyAverage = Math.floor(validPlays / 30) // 이번 달 30일 기준

  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">이번 달 유효재생</Title>
        <div className="text-3xl font-bold text-white">{validPlays.toLocaleString()}회</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">(전월 대비 +{lastMonthChange}%)</div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-white/60">
              유효재생률: <span className="text-teal-300 font-medium">{validRate}%</span>
            </div>
            <div className="text-xs text-white/40">
              총재생: {totalPlays.toLocaleString()}회
            </div>
            <div className="text-xs text-white/60">
              일평균: {dailyAverage.toLocaleString()}회
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 