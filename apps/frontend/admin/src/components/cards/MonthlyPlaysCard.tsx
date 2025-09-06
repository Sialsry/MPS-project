import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

function getPrevYearMonth(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000)
  const y = kst.getUTCFullYear()
  const m = kst.getUTCMonth() + 1
  const prev = new Date(Date.UTC(y, m - 2, 1))
  const py = prev.getUTCFullYear()
  const pm = String(prev.getUTCMonth() + 1).padStart(2, '0')
  return `${py}-${pm}`
}

function getDaysInMonthKST(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 3600 * 1000)
  const y = kst.getUTCFullYear()
  const m = kst.getUTCMonth() + 1
  return new Date(y, m, 0).getDate()
}

export default function MonthlyPlaysCard() {
  const [cur, setCur] = useState<{ valid: number; total: number } | null>(null)
  const [prev, setPrev] = useState<{ valid: number; total: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevYM = useMemo(() => getPrevYearMonth(), [])

  useEffect(() => {
    let aborted = false
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const curRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/stats/plays/valid`)
        if (!curRes.ok) throw new Error(`HTTP ${curRes.status}`)
        const cur = await curRes.json()
        const prevRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/musics/stats/plays/valid?yearMonth=${prevYM}`)
        if (!prevRes.ok) throw new Error(`HTTP ${prevRes.status}`)
        const prv = await prevRes.json()
        if (aborted) return
        setCur({ valid: Number(cur.validPlays ?? 0), total: Number(cur.totalPlays ?? 0) })
        setPrev({ valid: Number(prv.validPlays ?? 0), total: Number(prv.totalPlays ?? 0) })
      } catch (e: any) {
        if (aborted) return
        setError(e.message || '조회 실패')
        setCur(null)
        setPrev(null)
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    fetchStats()
    return () => { aborted = true }
  }, [prevYM])

  const validPlays = cur?.valid ?? 0
  const totalPlays = cur?.total ?? 0
  const validRate = totalPlays > 0 ? Math.round((validPlays / totalPlays) * 100) : 0
  const lastMonthChange = prev && prev.valid > 0 ? Math.round(((validPlays - prev.valid) / prev.valid) * 100) : null
  const dailyAverage = Math.floor(validPlays / getDaysInMonthKST())

  return (
    <Card>
      <div className="space-y-1">
        <Title variant="card">이번 달 유효재생</Title>
        <div className="text-3xl font-bold text-white">{loading ? '...' : (error ? '-' : `${validPlays.toLocaleString()}회`)}</div>
        <div className="space-y-0.5">
          <div className="text-sm text-teal-300">
            {loading ? '' : lastMonthChange === null ? '(전월 대비 -)' : `(전월 대비 ${lastMonthChange > 0 ? '+' : ''}${lastMonthChange}%)`}
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-white/60">
              유효재생률: <span className="text-teal-300 font-medium">{loading || error ? '-' : `${validRate}%`}</span>
            </div>
            <div className="text-xs text-white/40">
              총재생: {loading || error ? '-' : totalPlays.toLocaleString()}회
            </div>
            <div className="text-xs text-white/60">
              일평균: {loading || error ? '-' : dailyAverage.toLocaleString()}회
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 