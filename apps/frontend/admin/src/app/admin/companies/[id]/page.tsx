'use client'

import Card from '@/components/ui/Card'
import { useParams } from 'next/navigation'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const idNum = Number(id) || 1
  const name = `Company ${String.fromCharCode(64 + ((idNum-1)%26)+1)}`

  const topTracks = [
    { 
      name: 'Song A', 
      validCount: 1234, 
      totalCount: 1480,
      pct: 24 
    },
    { 
      name: 'Song B', 
      validCount: 987, 
      totalCount: 1184,
      pct: 19 
    },
    { 
      name: 'Song C', 
      validCount: 765, 
      totalCount: 918,
      pct: 15 
    },
    { 
      name: '기타', 
      validCount: 2014, 
      totalCount: 2417,
      pct: 42 
    },
  ]

  // 전체 유효재생률 계산
  const totalValid = topTracks.reduce((sum, track) => sum + track.validCount, 0)
  const totalPlays = topTracks.reduce((sum, track) => sum + track.totalCount, 0)
  const overallValidRate = Math.round((totalValid / totalPlays) * 100)

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-2 text-lg font-semibold text-white">{name}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm text-white/80">
            <div>사업자등록번호: <span className="text-white">123-45-67890</span></div>
            <div>대표자명: <span className="text-white">김철수</span></div>
            <div>연락처: <span className="text-white">02-1234-5678</span></div>
            <div>이메일: <span className="text-white">admin@companya.com</span></div>
          </div>
          <div className="space-y-2 text-sm text-white/80">
            <div>홈페이지 url: <span className="text-white">-</span></div>
            <div>담당자: <span className="text-white">이영희</span> (<span className="text-white">dev@companya.com</span>)</div>
            <div>등급: <span className="text-white">Business</span></div>
            <div>가입일: <span className="text-white">2024.01.15</span></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 text-sm font-semibold">TOP 유효재생 음원 (이번 달)</div>
          <div className="mb-3 p-3 bg-white/5 rounded-lg">
            <div className="text-sm text-white/80">
              전체 유효재생률: <span className="text-teal-300 font-medium">{overallValidRate}%</span>
            </div>
            <div className="text-xs text-white/60 mt-1">
              유효재생: {totalValid.toLocaleString()}회 / 총재생: {totalPlays.toLocaleString()}회
            </div>
          </div>
          <div className="space-y-3">
            {topTracks.map((t, i) => {
              const validRate = Math.round((t.validCount / t.totalCount) * 100)
              return (
                <div key={i} className="text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-white/90">{t.name}</div>
                    <div className="text-white/60">
                      <div className="text-right">
                        <div className="text-teal-300 font-medium">{t.validCount.toLocaleString()}회</div>
                        <div className="text-xs text-white/50">
                          {validRate}% · 총 {t.totalCount.toLocaleString()}회
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
                    <div className="h-full bg-teal-400" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-2 text-sm font-semibold">리워드 토큰 현황</div>
          <div className="space-y-2 text-sm text-white/80">
            <div>현재 보유: <span className="text-white">1,234.567</span> 토큰</div>
            <div>이번 달 적립: <span className="text-teal-300">+456.789</span> 토큰</div>
            <div>이번 달 사용: <span className="text-white/90">-234.567</span> 토큰 <span className="text-white/60">(할인 적용)</span></div>
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="text-xs text-white/60">
                유효재생 기준 리워드: <span className="text-teal-300">{overallValidRate}%</span> 효율
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full bg-teal-400" style={{ width: '68%' }} />
          </div>
        </Card>
      </div>
    </div>
  )
} 