import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function RenewalRateCard() {
  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">구독 갱신률</Title>
        <div className="text-3xl font-bold text-white">88%</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">(전월 대비 +3%)</div>
          <div className="mt-2">
            <div className="text-xs text-white/60">신규 해지: 5개 기업 · 재구독: 35개 기업</div>
          </div>
        </div>
      </div>
    </Card>
  )
} 