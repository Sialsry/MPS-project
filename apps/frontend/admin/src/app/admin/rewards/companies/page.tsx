'use client'

import { useState } from 'react'
import CompanyDetailModal from '@/components/modals/CompanyDetailModal'
import { Company } from '@/lib/types'

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const companies: Company[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      tier: 'Business',
      totalTokens: 125000,
      monthlyEarned: 15000,
      monthlyUsed: 8500,
      usageRate: 68,
      activeTracks: 45,
      status: 'active',
      lastActivity: '2024-01-15',
      joinedDate: '2023-01-15',
      contactEmail: 'admin@techcorp.com',
      contactPhone: '02-1234-5678',
      businessNumber: '123-45-67890',
      subscriptionStart: '2023-01-15',
      subscriptionEnd: '2024-12-31',
      monthlyUsage: [1200, 1350, 1100, 1400, 1600, 1800, 2000, 1900, 2100, 1950, 2200, 2400],
      monthlyRewards: [15000, 16800, 13750, 17500, 20000, 22500, 25000, 23750, 26250, 24375, 27500, 30000],
      topTracks: [
        { title: 'Shape of You', usage: 1250, category: 'Pop' },
        { title: 'Blinding Lights', usage: 980, category: 'Pop' },
        { title: 'Bohemian Rhapsody', usage: 850, category: 'Rock' },
        { title: 'Take Five', usage: 720, category: 'Jazz' },
        { title: 'Moonlight Sonata', usage: 680, category: 'Classical' }
      ]
    },
    {
      id: '2',
      name: 'Digital Media Inc',
      tier: 'Standard',
      totalTokens: 85000,
      monthlyEarned: 12000,
      monthlyUsed: 7200,
      usageRate: 85,
      activeTracks: 32,
      status: 'active',
      lastActivity: '2024-01-14',
      joinedDate: '2023-03-20',
      contactEmail: 'info@digitalmedia.com',
      contactPhone: '02-2345-6789',
      businessNumber: '234-56-78901',
      subscriptionStart: '2023-03-20',
      subscriptionEnd: '2024-12-31',
      monthlyUsage: [800, 950, 1100, 1200, 1350, 1500, 1600, 1550, 1700, 1650, 1800, 2000],
      monthlyRewards: [10000, 11875, 13750, 15000, 16875, 18750, 20000, 19375, 21250, 20625, 22500, 25000],
      topTracks: [
        { title: 'Dance Monkey', usage: 1100, category: 'Pop' },
        { title: 'Hotel California', usage: 850, category: 'Rock' },
        { title: 'Sandstorm', usage: 720, category: 'Electronic' },
        { title: 'Lose Yourself', usage: 680, category: 'Hip-Hop' },
        { title: 'So What', usage: 550, category: 'Jazz' }
      ]
    },
    {
      id: '3',
      name: 'Startup Ventures',
      tier: 'Free',
      totalTokens: 25000,
      monthlyEarned: 5000,
      monthlyUsed: 4800,
      usageRate: 96,
      activeTracks: 18,
      status: 'active',
      lastActivity: '2024-01-13',
      joinedDate: '2023-06-10',
      contactEmail: 'hello@startup.com',
      contactPhone: '02-3456-7890',
      businessNumber: '345-67-89012',
      subscriptionStart: '2023-06-10',
      subscriptionEnd: '2024-06-09',
      monthlyUsage: [400, 500, 600, 700, 800, 900, 1000, 950, 1100, 1050, 1200, 1300],
      monthlyRewards: [5000, 6250, 7500, 8750, 10000, 11250, 12500, 11875, 13750, 13125, 15000, 16250],
      topTracks: [
        { title: 'In Da Club', usage: 650, category: 'Hip-Hop' },
        { title: 'Levels', usage: 580, category: 'Electronic' },
        { title: 'Symphony No. 5', usage: 420, category: 'Classical' },
        { title: 'Stairway to Heaven', usage: 380, category: 'Rock' },
        { title: 'Blinding Lights', usage: 320, category: 'Pop' }
      ]
    }
  ]

  const filteredCompanies = companies
    .filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTier === 'all' || company.tier === selectedTier) &&
      (selectedStatus === 'all' || company.status === selectedStatus)
    )
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'tokens':
          aValue = a.totalTokens
          bValue = b.totalTokens
          break
        case 'usage':
          aValue = a.usageRate
          bValue = b.usageRate
          break
        case 'activity':
          aValue = new Date(a.lastActivity)
          bValue = new Date(b.lastActivity)
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'inactive': return 'text-yellow-400'
      case 'suspended': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Business': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'Standard': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'Free': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-white/10 text-white/80 border-white/20'
    }
  }

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
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            >
              <option value="all">전체 등급</option>
              <option value="Business">Business</option>
              <option value="Standard">Standard</option>
              <option value="Free">Free</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="suspended">정지</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as any)
                setSortOrder(order as any)
              }}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            >
              <option value="name-asc">이름순 (오름차순)</option>
              <option value="name-desc">이름순 (내림차순)</option>
              <option value="tokens-desc">토큰 많은순</option>
              <option value="usage-desc">사용률 높은순</option>
              <option value="activity-desc">최근 활동순</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-white/60">
          총 <span className="text-teal-300 font-semibold">{companies.length}</span>개 기업
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
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">보유 토큰</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">이번 달 적립</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">이번 달 사용</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">사용률</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">활성 음원</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">상태</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">최근 활동</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company, index) => (
                <tr key={company.id} className={`border-b border-white/5 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                  } hover:bg-white/8`}>
                  <td className="px-8 py-5">
                    <div className="font-semibold text-white">{company.name}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${company.tier === 'Business' ? 'bg-gradient-to-r from-purple-400/15 to-purple-500/15 text-purple-300 border border-purple-400/25' :
                        company.tier === 'Standard' ? 'bg-gradient-to-r from-blue-400/15 to-blue-500/15 text-blue-300 border border-blue-400/25' :
                          'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                      }`}>
                      {company.tier}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-white/90 font-medium">
                    {company.totalTokens.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-teal-400 font-medium">
                    +{company.monthlyEarned.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-white/80">
                    {company.monthlyUsed.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${company.usageRate}%` }}
                        />
                      </div>
                      <span className="text-white/70 text-xs font-medium">{company.usageRate}%</span>
                    </div>
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
                  <td className="px-8 py-5 text-white/60 text-xs">
                    {new Date(company.lastActivity).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-8 py-5">
                    <button
                      className="rounded-md bg-teal-500/90 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-teal-400 transition-all duration-200"
                      onClick={() => {
                        setSelectedCompany(company)
                        setModalOpen(true)
                      }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 기업 상세 모달 */}
      {selectedCompany && (
        <CompanyDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          company={selectedCompany}
        />
      )}
    </div>
  )
} 