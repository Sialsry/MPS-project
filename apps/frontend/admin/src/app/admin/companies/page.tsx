'use client'

import Link from 'next/link'
import { useState } from 'react'
import CompanyDetailModal from '@/components/modals/CompanyDetailModal'
import { Company } from '@/lib/types'

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Company | null>(null)

  const companies: Company[] = Array.from({ length: 12 }).map((_, i) => {
    const name = `Company ${String.fromCharCode(65 + i)}`
    const tier = i % 3 === 0 ? 'Business' : i % 3 === 1 ? 'Standard' : 'Free'
    const totalTokens = 1200 - i * 37
    const monthlyEarned = 500 - i * 25
    const monthlyUsed = 800 - i * 45
    const usageRate = Math.round((monthlyUsed / 1000) * 100)
    const activeTracks = 20 + (i % 6)
    const status = i % 5 !== 2 ? 'active' : 'inactive'
    const lastActivity = `2024.${String(((i * 3) % 12) + 1).padStart(2, '0')}.${String(((i * 7) % 28) + 1).padStart(2, '0')}`
    const joinedDate = `2024.${String(((i * 3) % 12) + 1).padStart(2, '0')}.${String(((i * 7) % 28) + 1).padStart(2, '0')}`
    const contactEmail = `contact@company${String.fromCharCode(65 + i).toLowerCase()}.com`
    const contactPhone = `010-${String(1000 + i).padStart(4, '0')}-${String(1000 + i).padStart(4, '0')}`
    const businessNumber = `${String(100 + i).padStart(3, '0')}-${String(10 + i).padStart(2, '0')}-${String(10000 + i).padStart(5, '0')}`
    const subscriptionStart = `2024.${String(((i * 3) % 12) + 1).padStart(2, '0')}.01`
    const subscriptionEnd = `2025.${String(((i * 3) % 12) + 1).padStart(2, '0')}.31`
    const monthlyUsage = Array.from({ length: 12 }, (_, month) => 800 - i * 45 + Math.floor(Math.random() * 200))
    const monthlyRewards = Array.from({ length: 12 }, (_, month) => 500 - i * 25 + Math.floor(Math.random() * 100))
    const topTracks = [
      { title: `Track ${i + 1}`, usage: 150 - i * 5, category: 'Pop' },
      { title: `Track ${i + 2}`, usage: 120 - i * 4, category: 'Rock' },
      { title: `Track ${i + 3}`, usage: 100 - i * 3, category: 'Jazz' }
    ]

    return {
      id: String(i + 1),
      name,
      tier,
      totalTokens,
      monthlyEarned,
      monthlyUsed,
      usageRate,
      activeTracks,
      status,
      lastActivity,
      joinedDate,
      contactEmail,
      contactPhone,
      businessNumber,
      subscriptionStart,
      subscriptionEnd,
      monthlyUsage,
      monthlyRewards,
      topTracks
    }
  })

  const filteredCompanies = companies
    .filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(company =>
      tierFilter === '' || company.tier === tierFilter
    )
    .filter(company =>
      statusFilter === '' ||
      (statusFilter === 'active' && company.status === 'active') ||
      (statusFilter === 'inactive' && company.status === 'inactive')
    )
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Company]
      let bValue: any = b[sortBy as keyof Company]

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const total = companies.length
  const activeCount = companies.filter(c => c.status === 'active').length
  const inactiveCount = companies.filter(c => c.status === 'inactive').length

  return (
    <div className="space-y-4">
      {/* 검색/필터 및 기업 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="min-w-[300px]">
            <input
              type="text"
              placeholder="기업명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            />
          </div>
          <div className="min-w-[120px]">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            >
              <option value="">전체 등급</option>
              <option value="Business">Business</option>
              <option value="Standard">Standard</option>
              <option value="Free">Free</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            >
              <option value="">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            >
              <option value="name-asc">이름순 (오름차순)</option>
              <option value="name-desc">이름순 (내림차순)</option>
              <option value="joined-desc">가입일 최신순</option>
              <option value="joined-asc">가입일 오래된순</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-white/60">
          총 <span className="text-teal-300 font-semibold">{total}</span>개 기업
        </div>
      </div>

      {/* 기업 목록 */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-white/10">
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">기업명</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">등급</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">가입일</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">월 사용량</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">누적 구독 요금</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">보유 토큰</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">사용 음원</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">상태</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company, index) => (
                <tr key={company.id} className={`border-b border-white/5 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                  } hover:bg-white/8`}>
                  <td className="px-8 py-5">
                    <Link href={`/admin/companies/${company.id}`} className="font-semibold text-white hover:underline">
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${company.tier === 'Business' ? 'bg-gradient-to-r from-purple-400/15 to-purple-500/15 text-purple-300 border border-purple-400/25' :
                      company.tier === 'Standard' ? 'bg-gradient-to-r from-blue-400/15 to-blue-500/15 text-blue-300 border border-blue-400/25' :
                        'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                      }`}>
                      {company.tier}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-white/80">
                    {company.joinedDate}
                  </td>
                  <td className="px-8 py-5 text-teal-400 font-medium">
                    {company.monthlyUsed.toLocaleString()}회
                  </td>
                  <td className="px-8 py-5 text-white/80">
                    {company.monthlyEarned.toLocaleString()} 토큰
                  </td>
                  <td className="px-8 py-5 text-white/80">
                    {company.totalTokens.toLocaleString()} 토큰
                  </td>
                  <td className="px-8 py-5 text-white/80">
                    {company.activeTracks}개
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${company.status === 'active'
                      ? 'bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25'
                      : 'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                      }`}>
                      {company.status === 'active' ? '●' : '○'} {company.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1.5">
                      <button
                        className="rounded-md bg-teal-500/90 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-teal-400 transition-all duration-200"
                        onClick={() => { setSelected(company); setOpen(true) }}
                      >
                        상세
                      </button>
                      <button className="rounded-md bg-white/10 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-white/20 transition-all duration-200">
                        수정
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CompanyDetailModal open={open} onClose={() => setOpen(false)} company={selected} />
    </div>
  )
} 