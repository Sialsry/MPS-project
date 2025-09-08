'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

export default function TierManagementPage() {
  // Standard 등급 설정
  const [standardPrice, setStandardPrice] = useState(150000)
  const [standardApiLimit, setStandardApiLimit] = useState(50000)

  // Business 등급 설정
  const [businessPrice, setBusinessPrice] = useState(450000)
  const [businessApiLimit, setBusinessApiLimit] = useState(500000)

  // 리워드 할인 적용 비율 설정
  const [rewardDiscountRate, setRewardDiscountRate] = useState(30)

  return (
    <div className="space-y-6">
      {/* 등급별 정책 설정 */}
      <Card>
        <Title variant="card" className="mb-4">등급별 정책 설정</Title>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Standard 등급 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-400"></div>
              <h3 className="text-lg font-semibold text-white">Standard 등급</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">월 구독료</label>
                <div className="mt-1 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={standardPrice} 
                    onChange={(e)=>setStandardPrice(Number(e.target.value))} 
                    className="w-32 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" 
                  />
                  <span className="text-sm text-white/60">원</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70">월 API 호출 한도</label>
                <div className="mt-1 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={standardApiLimit} 
                    onChange={(e)=>setStandardApiLimit(Number(e.target.value))} 
                    className="w-32 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" 
                  />
                  <span className="text-sm text-white/60">회</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business 등급 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-teal-400"></div>
              <h3 className="text-lg font-semibold text-white">Business 등급</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">월 구독료</label>
                <div className="mt-1 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={businessPrice} 
                    onChange={(e)=>setBusinessPrice(Number(e.target.value))} 
                    className="w-32 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" 
                  />
                  <span className="text-sm text-white/60">원</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70">월 API 호출 한도</label>
                <div className="mt-1 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={businessApiLimit} 
                    onChange={(e)=>setBusinessApiLimit(Number(e.target.value))} 
                    className="w-32 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" 
                  />
                  <span className="text-sm text-white/60">회</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button className="rounded bg-teal-600/90 px-6 py-2 text-sm text-white hover:bg-teal-500">수정</button>
        </div>
      </Card>

      {/* 리워드 할인 적용 비율 설정 */}
      <Card>
        <Title variant="card" className="mb-4">리워드 할인 적용 비율</Title>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70">리워드 할인 적용 비율</label>
            <div className="mt-1 flex items-center gap-2">
              <input 
                type="number" 
                min="0"
                max="100"
                value={rewardDiscountRate} 
                onChange={(e)=>setRewardDiscountRate(Number(e.target.value))} 
                className="w-32 rounded bg-black/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-teal-400/60" 
              />
              <span className="text-sm text-white/60">%</span>
            </div>
            <p className="mt-2 text-xs text-white/50">
              적립된 리워드의 {rewardDiscountRate}%를 구독료 할인에 적용합니다.
            </p>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button className="rounded bg-teal-600/90 px-6 py-2 text-sm text-white hover:bg-teal-500">수정</button>
        </div>
      </Card>
    </div>
  )
} 