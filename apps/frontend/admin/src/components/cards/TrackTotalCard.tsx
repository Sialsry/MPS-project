import Link from 'next/link'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function TrackTotalCard() {
  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">총 음원 수</Title>
        <div className="text-3xl font-bold text-white">1,245곡</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">(전월 대비 +5%)</div>
          <div className="mt-2 space-y-0.5">
            <div className="text-xs text-white/60">전월: 1,185곡</div>
            <div className="text-xs text-white/60">활성 API: 132개 · 비활성 API: 8개</div>
          </div>
        </div>
        <div className="mt-3">
          <Link href="/admin/musics" className="text-xs text-teal-300 underline underline-offset-4 hover:text-teal-200">음원 관리 →</Link>
        </div>
      </div>
    </Card>
  )
} 