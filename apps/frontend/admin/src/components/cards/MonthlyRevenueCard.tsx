import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function MonthlyRevenueCard() {
  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">이번 달 예상 매출</Title>
        <div className="text-3xl font-bold text-white">₩12,500,000</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">(전월 대비 +12%)</div>
          <div className="mt-2 space-y-0.5">
            <div className="text-xs text-white/60">전월: ₩11,160,714</div>
            <div className="text-xs text-white/60">* 구독료 기준</div>
          </div>
        </div>
      </div>
    </Card>
  )
} 