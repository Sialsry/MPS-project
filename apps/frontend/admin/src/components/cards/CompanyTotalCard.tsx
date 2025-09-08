import Link from 'next/link'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function CompanyTotalCard() {
  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">총 가입 기업 수</Title>
        <div className="text-3xl font-bold text-white">340개</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">+20 신규</div>
          <div className="mt-2">
            <div className="text-xs text-white/60">Free: 0개 · Standard: 220개 · Business: 120개</div>
          </div>
        </div>
        <div className="mt-3">
          <Link href="/admin/companies" className="text-xs text-teal-300 underline underline-offset-4 hover:text-teal-200">기업 관리 →</Link>
        </div>
      </div>
    </Card>
  )
} 