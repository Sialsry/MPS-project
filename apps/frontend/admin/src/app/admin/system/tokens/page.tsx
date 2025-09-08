'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

type Transaction = {
  id: string
  time: string
  type: 'mint' | 'transfer' | 'burn'
  amount: number
  recipient: string
  hash: string
  status: 'success' | 'pending' | 'failed'
  gasUsed: number
  gasPrice: number
  blockNumber: number
}

export default function RewardsTokensPage() {
  const [mintingInterval, setMintingInterval] = useState(10)
  const [autoMinting, setAutoMinting] = useState(true)
  const [gasLimit, setGasLimit] = useState(21000)

  const transactions: Transaction[] = [
    { id: '1', time: '14:41:23', type: 'mint', amount: 1234, recipient: 'Company A', hash: '0xabcd1234...', status: 'success', gasUsed: 21000, gasPrice: 20, blockNumber: 18456789 },
    { id: '2', time: '14:31:15', type: 'mint', amount: 567, recipient: 'Company B', hash: '0xefgh5678...', status: 'pending', gasUsed: 0, gasPrice: 0, blockNumber: 0 },
    { id: '3', time: '14:25:42', type: 'transfer', amount: 890, recipient: 'Company C', hash: '0xijkl9012...', status: 'success', gasUsed: 65000, gasPrice: 18, blockNumber: 18456788 },
    { id: '4', time: '14:20:11', type: 'burn', amount: 123, recipient: 'Burn Address', hash: '0xmnop3456...', status: 'success', gasUsed: 46000, gasPrice: 22, blockNumber: 18456787 },
    { id: '5', time: '14:15:33', type: 'mint', amount: 2345, recipient: 'Company D', hash: '0xqrst7890...', status: 'failed', gasUsed: 0, gasPrice: 0, blockNumber: 0 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'pending': return '⏳'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mint': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'transfer': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'burn': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-white/10 text-white/80 border-white/20'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'mint': return '민팅'
      case 'transfer': return '전송'
      case 'burn': return '소각'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Title variant="section">토큰/온체인 관리</Title>
        <div className="text-sm text-white/60">
          블록체인 연동 상태: <span className="text-green-400 font-semibold">연결됨</span>
        </div>
      </div>

      {/* 토큰 정보 및 설정 */}
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
            <div className="flex justify-between">
              <span className="text-white/60">가스 사용량:</span>
              <span className="text-white">평균 21,000 gas</span>
            </div>
          </div>
        </Card>

        <Card>
          <Title variant="card">자동 민팅 설정</Title>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">자동 민팅</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoMinting}
                  onChange={(e) => setAutoMinting(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
            
            <div>
              <label className="text-sm text-white/60">민팅 주기 (초)</label>
              <input
                type="number"
                value={mintingInterval}
                onChange={(e) => setMintingInterval(Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                min="1"
                max="3600"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">가스 한도</label>
              <input
                type="number"
                value={gasLimit}
                onChange={(e) => setGasLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-black/30 px-3 py-2 text-white outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200"
                min="21000"
                max="1000000"
              />
            </div>

            <button className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
              설정 저장
            </button>
          </div>
        </Card>

        <Card>
          <Title variant="card">실시간 상태</Title>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">네트워크:</span>
              <span className="text-white">Ethereum Mainnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">최신 블록:</span>
              <span className="text-white font-mono">18,456,789</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">가스 가격:</span>
              <span className="text-white">20 Gwei</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">대기 트랜잭션:</span>
              <span className="text-yellow-400 font-semibold">3건</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">마지막 업데이트:</span>
              <span className="text-white">14:42:15</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 트랜잭션 모니터링 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title variant="card">트랜잭션 모니터링</Title>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-all duration-200">
              새로고침
            </button>
            <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
              수동 민팅
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">시간</th>
                <th className="py-3 pr-4">타입</th>
                <th className="py-3 pr-4">토큰량</th>
                <th className="py-3 pr-4">수신자</th>
                <th className="py-3 pr-4">트랜잭션 해시</th>
                <th className="py-3 pr-4">블록</th>
                <th className="py-3 pr-4">상태</th>
                <th className="py-3 pr-4">가스비</th>
                <th className="py-3 pr-0 text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="py-3 pr-4 text-white/80 font-mono text-xs">
                    {tx.time}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(tx.type)}`}>
                      {getTypeText(tx.type)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-white/80">
                    {tx.amount.toLocaleString()} 토큰
                  </td>
                  <td className="py-3 pr-4 text-white/80">
                    {tx.recipient}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-white/60 font-mono text-xs">
                      {tx.hash}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-white/60 text-xs">
                    {tx.blockNumber > 0 ? tx.blockNumber.toLocaleString() : '-'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {getStatusIcon(tx.status)} {tx.status === 'success' ? '성공' : tx.status === 'pending' ? '대기' : '실패'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-white/60 text-xs">
                    {tx.gasUsed > 0 ? `${tx.gasUsed.toLocaleString()} gas` : '-'}
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <div className="flex gap-2">
                      <button className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15 transition-all duration-200">
                        상세
                      </button>
                      {tx.status === 'pending' && (
                        <button className="rounded bg-red-600/90 px-2 py-1 text-xs text-white hover:bg-red-500 transition-all duration-200">
                          취소
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 