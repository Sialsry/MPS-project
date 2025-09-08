'use client'

import { useState, useEffect } from 'react'
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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
  
  // 토큰 정보
  const [tokenInfo, setTokenInfo] = useState({
    contractAddress: '',
    totalSupply: 0,
    totalIssued: 0,
    totalBurned: 0,
    circulatingSupply: 0,
    tokenName: '',
    tokenSymbol: '',
    decimals: 18
  })

  // 대납자 지갑 정보
  const [sponsorWallet, setSponsorWallet] = useState({
    address: '',
    ethBalance: 0,
    lastUpdated: ''
  })

  // 일별 집계 데이터
  const [dailyBatches, setDailyBatches] = useState<DailyRewardBatch[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const selectedBatch = dailyBatches.find(b => b.id === selectedBatchId) || null

  const [isProcessingToday, setIsProcessingToday] = useState(false)

  // API 호출 함수들
  const fetchTokenInfo = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/tokens/info`)
      if (response.ok) {
        const data = await response.json()
        setTokenInfo(data)
      }
    } catch (error) {
      console.error('토큰 정보 조회 실패:', error)
    }
  }

  const fetchWalletInfo = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/tokens/wallet`)
      if (response.ok) {
        const data = await response.json()
        setSponsorWallet(data)
      }
    } catch (error) {
      console.error('지갑 정보 조회 실패:', error)
    }
  }

  const fetchDailyBatches = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/tokens/batches?limit=10`)
      if (response.ok) {
        const data = await response.json()
        setDailyBatches(data)
      }
    } catch (error) {
      console.error('일별 배치 조회 실패:', error)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchTokenInfo(),
        fetchWalletInfo(),
        fetchDailyBatches()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

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

  const handleRefreshWallet = async () => {
    await fetchWalletInfo()
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title variant="section">토큰/온체인 관리</Title>
          <div className="text-sm text-white/60">
            블록체인 연동 상태: <span className="text-yellow-400 font-semibold">연결 중...</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">데이터를 불러오는 중...</div>
        </div>
      </div>
    )
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
              <span className="text-white font-mono">{tokenInfo.contractAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">총 발행량:</span>
              <span className="text-white font-semibold">{tokenInfo.totalIssued.toLocaleString()} 토큰</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">현재 유통량:</span>
              <span className="text-teal-300 font-semibold">{tokenInfo.circulatingSupply.toLocaleString()} 토큰</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">소각된 토큰:</span>
              <span className="text-red-400 font-semibold">{tokenInfo.totalBurned.toLocaleString()} 토큰</span>
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
              <span className="text-white/70">{sponsorWallet.lastUpdated ? new Date(sponsorWallet.lastUpdated).toLocaleString() : '-'}</span>
            </div>
            <div className="pt-1">
              <button
                onClick={handleRefreshWallet}
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
            <button 
              onClick={() => {
                fetchDailyBatches()
                fetchTokenInfo()
                fetchWalletInfo()
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors duration-200"
            >
              새로고침
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">날짜</th>
                <th className="py-3 pr-4">트랜잭션 완료 시간</th>
                <th className="py-3 pr-4">분배된 리워드 총량</th>
                <th className="py-3 pr-4">DB 유효재생</th>
                <th className="py-3 pr-4">온체인 기록</th>
                <th className="py-3 pr-4">발생한 이벤트</th>
                <th className="py-3 pr-4">Tx Hash</th>
                <th className="py-3 pr-4">상태</th>
                <th className="py-3 pr-0 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {dailyBatches.map(batch => {
                const badge = getBatchStatusBadge(batch.status)
                return (
                  <tr key={batch.id} className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedBatchId(batch.id)}>
                    <td className="py-3 pr-4 font-mono text-xs text-white/80">{batch.date}</td>
                    <td className="py-3 pr-4 text-white/70 text-xs">{batch.executedAt || '-'}</td>
                    <td className="py-3 pr-4 text-white font-medium">{batch.totalReward.toLocaleString()} <span className="text-white/50 text-xs">토큰</span></td>
                    <td className="py-3 pr-4 text-white/80">{batch.dbValidPlayCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-white/80">{batch.onchainRecordedPlayCount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-xs">
                      <span className="text-teal-300/70">
                        {batch.onchainRecordedPlayCount > 0 ? `${batch.onchainRecordedPlayCount}개 Transfer 이벤트` : '이벤트 없음'}
                      </span>
                    </td>
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
