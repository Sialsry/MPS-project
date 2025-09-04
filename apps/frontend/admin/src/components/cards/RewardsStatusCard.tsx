import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function RewardsStatusCard() {
  // 예시 데이터 (실제로는 API에서 받아올 데이터)
  const validPlays = 8500
  const totalPlays = 12000
  const validRate = Math.round((validPlays / totalPlays) * 100)
  const rewardPerValidPlay = 0.007
  const totalRewardsIssued = validPlays * rewardPerValidPlay
  const maxRewardsLimit = 100000 // 월 최대 리워드 한도
  const rewardUsageRate = Math.round((totalRewardsIssued / maxRewardsLimit) * 100)

  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">유효재생 리워드 현황</Title>
        <div className="text-3xl font-bold text-white">{validRate}%</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">유효재생률 (60초 이상)</div>
          <div className="mt-3 mb-2 h-1.5 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full rounded bg-teal-300" style={{ width: `${validRate}%` }} />
          </div>
          <div className="text-xs text-white/60">
            유효재생: {validPlays.toLocaleString()}회
          </div>
          <div className="text-xs text-white/40">
            총재생: {totalPlays.toLocaleString()}회
          </div>
        </div>
      </div>
    </Card>
  )
} 