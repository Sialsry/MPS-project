'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'
import DailyTxDetailModal from '@/components/modals/DailyTxDetailModal'

// 일별 집계된 트랜잭션(리워드 처리) 데이터 타입
type DailyRewardBatch = {
  id: string // YYYY-MM-DD
  date: string
  executedAt: string | null // 실행된 시간
  totalReward: number // 발행된 리워드 토큰 총량
  dbValidPlayCount: number // DB 기준 유효재생 수
  onchainRecordedPlayCount: number // 온체인 이벤트 기준 기록 수
  txHash: string | null
  status: 'success' | 'pending' | 'not-executed' | 'failed'
  mismatch?: boolean
  blockNumber?: number | null
  gasUsed?: number | null
}

export default function RewardsTokensPage() {
  // 대납자 지갑 정보 (샘플)
  const [sponsorWallet, setSponsorWallet] = useState({
    address: '0x9f8a...bC42',
    ethBalance: 2.3456,
    lastUpdated: '2025-09-04 14:42:15'
  })

  // 일별 집계 (샘플 데이터)
  const [dailyBatches] = useState<DailyRewardBatch[]>([
    {
      id: '2025-09-04',
      date: '2025-09-04',
      executedAt: null,
      totalReward: 0,
      dbValidPlayCount: 1234,
      onchainRecordedPlayCount: 0,
      txHash: null,
      status: 'not-executed',
      mismatch: true
    },
    {
      id: '2025-09-03',
      date: '2025-09-03',
      executedAt: '2025-09-03 23:59:43',
      totalReward: 45210,
      dbValidPlayCount: 9812,
      onchainRecordedPlayCount: 9812,
      txHash: '0xabc123...89ef',
      status: 'success',
      mismatch: false,
      blockNumber: 18456732,
      gasUsed: 185000
    },
    {
      id: '2025-09-02',
      date: '2025-09-02',
      executedAt: '2025-09-02 23:58:55',
      totalReward: 43890,
      dbValidPlayCount: 9655,
      onchainRecordedPlayCount: 9601,
      txHash: '0xdef456...12aa',
      status: 'success',
      mismatch: true,
      blockNumber: 18432110,
      gasUsed: 192340
    },
    {
      id: '2025-09-01',
      date: '2025-09-01',
      executedAt: '2025-09-01 23:59:10',
      totalReward: 40110,
      dbValidPlayCount: 9100,
      onchainRecordedPlayCount: 9100,
      txHash: '0x9876ff...cc21',
      status: 'failed',
      mismatch: true,
      blockNumber: 18411002,
      gasUsed: 90000
    }
  ])

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const selectedBatch = dailyBatches.find(b => b.id === selectedBatchId) || null

  const [isProcessingToday, setIsProcessingToday] = useState(false)

  const handleProcessToday = async () => {
    if (isProcessingToday) return
    setIsProcessingToday(true)
    try {
      // TODO: API 호출 -> 금일 유효재생 묶음 트랜잭션 실행 & 리워드 토큰 발행/배포
      await new Promise(r => setTimeout(r, 1500))
    } catch (e) {
      console.error('금일 처리 실패', e)
    } finally {
      setIsProcessingToday(false)
    }
  }

  const getBatchStatusBadge = (status: DailyRewardBatch['status']) => {
    switch (status) {
      case 'success':
        return { text: '성공', className: 'bg-green-500/15 text-green-300 border-green-500/30' }
      case 'pending':
        return { text: '진행중', className: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' }
      case 'failed':
        return { text: '실패', className: 'bg-red-500/15 text-red-300 border-red-500/30' }
      case 'not-executed':
        return { text: '미실행', className: 'bg-white/10 text-white/60 border-white/20' }
      default:
        return { text: status, className: 'bg-white/10 text-white/80 border-white/20' }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title variant="section">토큰/온체인 관리</Title>
        <div className="text-sm text-white/60">
          블록체인 연동 상태: <span className="text-green-400 font-semibold">연결됨</span>
        </div>
      </div>

      {/* 토큰 기본 정보 + 대납자 지갑 + 처리 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Title variant="card">ERC20 토큰 정보</Title>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">컨트랙트 주소:</span>
              <span className="text-white font-mono">0x1234...abcd</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">총 발행량:</span>
              <span className="text-white font-semibold">1,000,000 토큰</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">현재 유통량:</span>
              <span className="text-teal-300 font-semibold">876,543 토큰</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">소각된 토큰:</span>
              <span className="text-red-400 font-semibold">12,345 토큰</span>
            </div>
          </div>
        </Card>

        <Card>
          <Title variant="card">대납자 지갑 정보</Title>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">지갑 주소:</span>
              <span className="text-white font-mono">{sponsorWallet.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">ETH 잔액:</span>
              <span className="text-teal-300 font-semibold">{sponsorWallet.ethBalance.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">마지막 업데이트:</span>
              <span className="text-white/70">{sponsorWallet.lastUpdated}</span>
            </div>
            <div className="pt-1">
              <button
                onClick={() => setSponsorWallet(prev => ({ ...prev, lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19) }))}
                className="w-full rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/80 transition"
              >
                잔액 새로고침
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <Title variant="card">금일 데이터 처리</Title>
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-white/70 leading-relaxed">
              금일 00:00 ~ 현재까지 수집된 유효재생/리워드 적립 내역을 즉시 집계하여 온체인에 기록하고 리워드 토큰을 발행/배포합니다.
            </p>
            <button
              onClick={handleProcessToday}
              disabled={isProcessingToday}
              className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm text-white font-medium hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 transition"
            >
              {isProcessingToday ? '처리중...' : '금일 트랜잭션 내역 즉시 처리'}
            </button>
            <div className="text-xs text-white/40">* 기본 스케줄은 자정 기준 자동 처리됩니다.</div>
          </div>
        </Card>
      </div>

      {/* 트랜잭션 모니터링 (일별 집계) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title variant="card">트랜잭션 모니터링 (일별 집계)</Title>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors duration-200">
              새로고침
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">날짜</th>
                <th className="py-3 pr-4">실행 시간</th>
                <th className="py-3 pr-4">리워드 발행 총량</th>
                <th className="py-3 pr-4">DB 유효재생</th>
                <th className="py-3 pr-4">온체인 기록</th>
                <th className="py-3 pr-4">불일치</th>
                <th className="py-3 pr-4">Tx Hash</th>
                <th className="py-3 pr-4">상태</th>
                <th className="py-3 pr-0 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {dailyBatches.map(batch => {
                const badge = getBatchStatusBadge(batch.status)
                const mismatch = batch.mismatch && batch.dbValidPlayCount !== batch.onchainRecordedPlayCount
                return (
                  <tr key={batch.id} className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedBatchId(batch.id)}>
                    <td className="py-3 pr-4 font-mono text-xs text-white/80">{batch.date}</td>
                    <td className="py-3 pr-4 text-white/70 text-xs">{batch.executedAt || '-'}</td>
                    <td className="py-3 pr-4 text-white font-medium">{batch.totalReward.toLocaleString()} <span className="text-white/50 text-xs">토큰</span></td>
                    <td className="py-3 pr-4 text-white/80">{batch.dbValidPlayCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-white/80">{batch.onchainRecordedPlayCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-xs">{mismatch ? <span className="text-red-400 font-semibold">불일치</span> : <span className="text-teal-300/70">OK</span>}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-white/60">{batch.txHash || '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${badge.className}`}>{badge.text}</span>
                    </td>
                    <td className="py-3 pr-0 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBatchId(batch.id) }}
                        className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15 transition-colors"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <DailyTxDetailModal
        open={!!selectedBatchId}
        onClose={() => setSelectedBatchId(null)}
        batch={selectedBatch}
      />
    </div>
  )
}