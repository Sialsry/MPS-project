'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import SimpleLineChart from '@/components/charts/SimpleLineChart'

export default function ApiManagementPage() {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set())
      setSelectAll(false)
    } else {
      const allIndices = new Set([...Array(10)].map((_, i) => i))
      setSelectedItems(allIndices)
      setSelectAll(true)
    }
  }

  const handleItemSelect = (index: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
    setSelectAll(newSelected.size === 10)
  }

  // API 사용량 차트 데이터
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}시`,
    calls: [1200, 1100, 900, 800, 700, 600, 500, 400, 600, 800, 1200, 1500, 1800, 2000, 2200, 2100, 2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300][i] || 1000,
    errors: [20, 18, 15, 12, 10, 8, 5, 3, 8, 12, 18, 22, 25, 28, 30, 29, 27, 25, 23, 21, 19, 17, 15, 13][i] || 15
  }))

  const rows = Array.from({length:10}).map((_,i)=> ({
    company: `Company ${String.fromCharCode(65+i)}`,
    key: `sk_live_${Math.random().toString(36).slice(2,8)}...`,
    created: `2024.${String(((i*2)%12)+1).padStart(2,'0')}.${String(((i*5)%28)+1).padStart(2,'0')}`,
    lastUsed: `${(i+1)*2}분 전`,
    callsPerHour: (1200 - i*53),
    status: i%6===0 ? '비활성' : '활성',
  }))

  return (
    <div className="space-y-6">
      {/* KPI 카드와 차트를 같은 라인에 배치 */}
      <section className="mb-8">
        <div className="grid gap-5 [grid-template-columns:1fr_1.5fr] max-lg:grid-cols-1">
          {/* KPI 카드들 */}
          <div className="grid gap-4 [grid-template-columns:repeat(2,1fr)] max-md:grid-cols-1">
            <Card>
              <div className="space-y-1">
                <Title variant="card">총 API 키</Title>
                <div className="text-3xl font-bold text-white">45개</div>
                <div className="space-y-0.5">
                  <div className="text-sm text-teal-300">+3 신규</div>
                  <div className="mt-2">
                    <div className="text-xs text-white/60">활성: 42개 · 비활성: 3개</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-1">
                <Title variant="card">시간당 평균 호출</Title>
                <div className="text-3xl font-bold text-white">12,345회</div>
                <div className="space-y-0.5">
                  <div className="text-sm text-teal-400">+8.2% 증가</div>
                  <div className="mt-2">
                    <div className="text-xs text-white/60">전일 대비</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-1">
                <Title variant="card">성공률</Title>
                <div className="text-3xl font-bold text-white">99.8%</div>
                <div className="space-y-0.5">
                  <div className="text-sm text-teal-400">+0.1% 개선</div>
                  <div className="mt-2">
                    <div className="text-xs text-white/60">전일 대비</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-1">
                <Title variant="card">평균 응답시간</Title>
                <div className="text-3xl font-bold text-white">125ms</div>
                <div className="space-y-0.5">
                  <div className="text-sm text-teal-400">+5ms 증가</div>
                  <div className="mt-2">
                    <div className="text-xs text-white/60">전일 대비</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 차트 */}
          <Card>
            <Title variant="card" className="mb-4">24시간 API 호출량</Title>
            <div className="h-80">
              <SimpleLineChart 
                labels={hourlyData.map(d => d.hour)}
                series={[
                  { label: 'API 호출', data: hourlyData.map(d => d.calls) },
                  { label: '에러 발생', data: hourlyData.map(d => d.errors) }
                ]}
                colors={['#14b8a6', '#ef4444']}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* API 키 관리 테이블 */}
      <Card>
        <div className="mb-3 text-sm font-semibold">API 키 관리</div>
        
        {/* 검색/필터 및 API 키 현황 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="min-w-[300px]">
              <input 
                className="w-full px-3 py-2 text-white placeholder-white/50 outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm" 
                placeholder="기업명, API 키로 검색 .." 
              />
            </div>
            <div className="min-w-[120px]">
              <select className="w-full px-3 py-2 text-white outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm">
                <option>전체 상태</option>
                <option>활성</option>
                <option>비활성</option>
              </select>
            </div>
            <div className="min-w-[120px]">
              <select className="w-full px-3 py-2 text-white outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm">
                <option>최신순</option>
                <option>사용순</option>
                <option>이름순</option>
              </select>
            </div>
            <button 
              disabled={selectedItems.size === 0}
              className={`rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedItems.size === 0 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              일괄 비활성화
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/60">
              총 API 키: <span className="text-teal-300 font-semibold">45</span>개 | 
              선택됨: <span className="text-teal-300 font-semibold">{selectedItems.size}</span>개
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="accent-teal-400 rounded" 
                    />
                  </th>
                  <th className="px-6 py-4 text-white/70 font-medium">기업명</th>
                  <th className="px-6 py-4 text-white/70 font-medium">API 키</th>
                  <th className="px-6 py-4 text-white/70 font-medium">생성일</th>
                  <th className="px-6 py-4 text-white/70 font-medium">마지막 사용</th>
                  <th className="px-6 py-4 text-white/70 font-medium">호출수/시간</th>
                  <th className="px-6 py-4 text-white/70 font-medium">상태</th>
                  <th className="px-6 py-4 text-white/70 font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=> (
                  <tr key={i} className={`border-b border-white/5 transition-all duration-200 ${
                    i % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                  } hover:bg-white/8`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(i)}
                        onChange={() => handleItemSelect(i)}
                        className="accent-teal-400 rounded" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{r.company}</div>
                    </td>
                    <td className="px-6 py-4 text-white/80 font-mono">{r.key}</td>
                    <td className="px-6 py-4 text-white/80">{r.created}</td>
                    <td className="px-6 py-4 text-white/80">{r.lastUsed}</td>
                    <td className="px-6 py-4 text-white/80">{r.callsPerHour.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        r.status === '활성' 
                          ? 'bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25'
                          : 'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                      }`}>
                        {r.status === '활성' ? '●' : '○'} {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
                          재생성
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
} 