'use client'

import React, { useState, useEffect } from 'react'
import MusicDetailModal from '@/components/modals/MusicDetailModal'
import RewardEditModal from '@/components/modals/RewardEditModal'
import BulkRewardEditModal from '@/components/modals/BulkRewardEditModal'

type Music = {
  id: string
  title: string
  category: string
  monthlyUsed: number
  monthlyLimit: number | null
  companies: number
  rewardPerPlay: number
  maxPlayCount: number | null
  status: 'active' | 'inactive'
  monthlyUsage: number[]
  monthlyRewards: number[]
  topCompanies: Array<{ name: string; usage: number; tier: string }>
  totalRewards: number
  totalPlays: number
  averageRating: number
  releaseDate: string
  duration: string
  artist: string
}

// 카테고리별 일관된 색상 생성 함수
const getCategoryColor = (category: string) => {
  const colors = [
    { bg: 'from-purple-400/15 to-purple-500/15', text: 'text-purple-300', border: 'border-purple-400/25' },
    { bg: 'from-blue-400/15 to-blue-500/15', text: 'text-blue-300', border: 'border-blue-400/25' },
    { bg: 'from-teal-400/15 to-teal-500/15', text: 'text-teal-300', border: 'border-teal-400/25' },
    { bg: 'from-green-400/15 to-green-500/15', text: 'text-green-300', border: 'border-green-400/25' },
    { bg: 'from-yellow-400/15 to-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-400/25' },
    { bg: 'from-orange-400/15 to-orange-500/15', text: 'text-orange-300', border: 'border-orange-400/25' },
    { bg: 'from-red-400/15 to-red-500/15', text: 'text-red-300', border: 'border-red-400/25' },
    { bg: 'from-pink-400/15 to-pink-500/15', text: 'text-pink-300', border: 'border-pink-400/25' },
    { bg: 'from-indigo-400/15 to-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-400/25' },
    { bg: 'from-cyan-400/15 to-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-400/25' }
  ]
  
  // 카테고리명을 해시값으로 변환하여 일관된 색상 선택
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32비트 정수로 변환
  }
  
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export default function RewardsMusicsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [limitFilter, setLimitFilter] = useState('')
  const [usageFilter, setUsageFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [rewardFilter, setRewardFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
  const [rewardEditModalOpen, setRewardEditModalOpen] = useState(false)
  const [selectedMusicForEdit, setSelectedMusicForEdit] = useState<Music | null>(null)
  const [selectedMusics, setSelectedMusics] = useState<string[]>([])
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const musics: Music[] = [
    { 
      id: '1', 
      title: 'Shape of You', 
      category: 'Pop', 
      monthlyUsed: 1250, 
      monthlyLimit: 2000, 
      companies: 8, 
      rewardPerPlay: 0.007, 
      maxPlayCount: 1000,
      status: 'active',
      monthlyUsage: [1200, 1350, 1100, 1400, 1600, 1800, 2000, 1900, 2100, 1950, 2200, 2400],
      monthlyRewards: [8400, 9450, 7700, 9800, 11200, 12600, 14000, 13300, 14700, 13650, 15400, 16800],
      topCompanies: [
        { name: 'TechCorp Solutions', usage: 450, tier: 'Business' },
        { name: 'Digital Media Inc', usage: 380, tier: 'Standard' },
        { name: 'Startup Ventures', usage: 320, tier: 'Free' }
      ],
      totalRewards: 140000,
      totalPlays: 20000,
      averageRating: 4.8,
      releaseDate: '2023-01-15',
      duration: '3:45',
      artist: 'Ed Sheeran'
    },
    { 
      id: '2', 
      title: 'Blinding Lights', 
      category: 'Pop', 
      monthlyUsed: 980, 
      monthlyLimit: 1500, 
      companies: 6, 
      rewardPerPlay: 0.008, 
      maxPlayCount: 1500,
      status: 'active',
      monthlyUsage: [800, 950, 1100, 1200, 1350, 1500, 1600, 1550, 1700, 1650, 1800, 2000],
      monthlyRewards: [6400, 7600, 8800, 9600, 10800, 12000, 12800, 12400, 13600, 13200, 14400, 16000],
      topCompanies: [
        { name: 'Global Media Inc', usage: 420, tier: 'Business' },
        { name: 'Creative Studio', usage: 350, tier: 'Standard' },
        { name: 'E-commerce Plus', usage: 280, tier: 'Business' }
      ],
      totalRewards: 120000,
      totalPlays: 15000,
      averageRating: 4.7,
      releaseDate: '2023-02-20',
      duration: '3:20',
      artist: 'The Weeknd'
    },
    { 
      id: '3', 
      title: 'Dance Monkey', 
      category: 'Pop', 
      monthlyUsed: 750, 
      monthlyLimit: null, 
      companies: 4, 
      rewardPerPlay: 0.006, 
      maxPlayCount: null,
      status: 'active',
      monthlyUsage: [600, 700, 800, 900, 1000, 1100, 1200, 1150, 1300, 1250, 1400, 1500],
      monthlyRewards: [3600, 4200, 4800, 5400, 6000, 6600, 7200, 6900, 7800, 7500, 8400, 9000],
      topCompanies: [
        { name: 'Local Restaurant', usage: 280, tier: 'Free' },
        { name: 'Small Cafe', usage: 220, tier: 'Free' },
        { name: 'Digital Agency', usage: 180, tier: 'Standard' }
      ],
      totalRewards: 75000,
      totalPlays: 12500,
      averageRating: 4.5,
      releaseDate: '2023-03-10',
      duration: '3:30',
      artist: 'Tones and I'
    }
  ]

  const filteredMusics = musics
    .filter(music => 
      music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      music.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(music => 
      statusFilter === '' || music.status === statusFilter
    )
    .filter(music => 
      categoryFilter === '' || music.category === categoryFilter
    )
    .filter(music => {
      if (limitFilter === '') return true
      if (limitFilter === 'unlimited') return music.monthlyLimit === null
      if (limitFilter === 'limited') return music.monthlyLimit !== null
      return true
    })
    .filter(music => {
      if (usageFilter === '') return true
      const usageRate = music.monthlyLimit ? Math.round((music.monthlyUsed / music.monthlyLimit) * 100) : null
      if (usageFilter === 'high' && usageRate !== null) return usageRate >= 80
      if (usageFilter === 'medium' && usageRate !== null) return usageRate >= 50 && usageRate < 80
      if (usageFilter === 'low' && usageRate !== null) return usageRate < 50
      if (usageFilter === 'unlimited') return usageRate === null
      return true
    })
    .filter(music => {
      if (companyFilter === '') return true
      if (companyFilter === 'many' && music.companies >= 5) return true
      if (companyFilter === 'medium' && music.companies >= 2 && music.companies < 5) return true
      if (companyFilter === 'few' && music.companies < 2) return true
      return true
    })
    .filter(music => {
      if (rewardFilter === '') return true
      if (rewardFilter === 'high' && music.rewardPerPlay >= 0.01) return true
      if (rewardFilter === 'medium' && music.rewardPerPlay >= 0.005 && music.rewardPerPlay < 0.01) return true
      if (rewardFilter === 'low' && music.rewardPerPlay < 0.005) return true
      return true
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Music]
      let bValue: any = b[sortBy as keyof Music]
      
      if (sortBy === 'monthlyUsed') {
        aValue = a.monthlyUsed
        bValue = b.monthlyUsed
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredMusics.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMusics = filteredMusics.slice(startIndex, endIndex)

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // 체크박스 관련 함수들
  const handleSelectAll = () => {
    if (selectedMusics.length === filteredMusics.length) {
      setSelectedMusics([])
    } else {
      setSelectedMusics(filteredMusics.map(music => music.id))
    }
  }

  const handleSelectMusic = (musicId: string) => {
    setSelectedMusics(prev => 
      prev.includes(musicId) 
        ? prev.filter(id => id !== musicId)
        : [...prev, musicId]
    )
  }

  const selectedMusicsData = musics.filter(music => selectedMusics.includes(music.id))

  // 드롭다운 관련 함수들
  const toggleDropdown = (dropdownName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = openDropdown === dropdownName ? null : dropdownName
    setTimeout(() => {
      setOpenDropdown(newState)
    }, 0)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  // 드롭다운 외부 클릭 시 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // 검색어나 필터 변경 시 페이지 리셋
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categoryFilter, limitFilter, usageFilter, companyFilter, rewardFilter])

  return (
    <div className="space-y-4">
      {/* 검색/필터 및 음원 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="min-w-[300px]">
            <input
              type="text"
              placeholder="음원명, 카테고리로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400/50 transition-colors text-sm"
            />
          </div>
          <button 
            onClick={() => {}}
            className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white/90 font-medium hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {selectedMusics.length > 0 && (
            <button
              onClick={() => setBulkEditModalOpen(true)}
              className="px-3 py-2 bg-teal-500/90 text-white text-xs font-medium rounded-lg hover:bg-teal-400 transition-colors"
            >
              일괄 수정 ({selectedMusics.length}개)
            </button>
          )}
        </div>
        
        <div className="text-sm text-white/60">
          총 <span className="text-teal-300 font-semibold">{filteredMusics.length}</span>개 음원
          {selectedMusics.length > 0 && (
            <span className="ml-2 text-teal-300">
              • 선택됨: <span className="text-teal-300 font-semibold">{selectedMusics.length}</span>개
            </span>
          )}
        </div>
      </div>

      {/* 음원 목록 */}
      <div className="overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-center">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedMusics.length === filteredMusics.length && filteredMusics.length > 0}
                    onChange={handleSelectAll}
                    className="accent-teal-400 rounded" 
                  />
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">음원명</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('category', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>카테고리</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 카테고리 드롭다운 메뉴 */}
                    {openDropdown === 'category' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setCategoryFilter(''); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              categoryFilter === '' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setCategoryFilter('Pop'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              categoryFilter === 'Pop' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Pop
                          </button>
                          <button 
                            onClick={() => { setCategoryFilter('Rock'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              categoryFilter === 'Rock' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Rock
                          </button>
                          <button 
                            onClick={() => { setCategoryFilter('Jazz'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              categoryFilter === 'Jazz' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Jazz
                          </button>
                          <button 
                            onClick={() => { setCategoryFilter('Classical'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              categoryFilter === 'Classical' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Classical
                          </button>
                          <button 
                            onClick={() => { setCategoryFilter('Electronic'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              categoryFilter === 'Electronic' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Electronic
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('limit', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>리워드 월 한도</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 리워드 월 한도 드롭다운 메뉴 */}
                    {openDropdown === 'limit' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setLimitFilter(''); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              limitFilter === '' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setLimitFilter('limited'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              limitFilter === 'limited' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            한도 있음
                          </button>
                          <button 
                            onClick={() => { setLimitFilter('unlimited'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              limitFilter === 'unlimited' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            무제한
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('usage', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>리워드 사용률</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 리워드 사용률 드롭다운 메뉴 */}
                    {openDropdown === 'usage' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setUsageFilter(''); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageFilter === '' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setUsageFilter('high'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageFilter === 'high' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            높음 (80%+)
                          </button>
                          <button 
                            onClick={() => { setUsageFilter('medium'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageFilter === 'medium' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            보통 (50-79%)
                          </button>
                          <button 
                            onClick={() => { setUsageFilter('low'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageFilter === 'low' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            낮음 (50% 미만)
                          </button>
                          <button 
                            onClick={() => { setUsageFilter('unlimited'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              usageFilter === 'unlimited' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            무제한
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('company', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>사용 기업</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 사용 기업 드롭다운 메뉴 */}
                    {openDropdown === 'company' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setCompanyFilter(''); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              companyFilter === '' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setCompanyFilter('many'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              companyFilter === 'many' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            많음 (5개+)
                          </button>
                          <button 
                            onClick={() => { setCompanyFilter('medium'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              companyFilter === 'medium' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            보통 (2-4개)
                          </button>
                          <button 
                            onClick={() => { setCompanyFilter('few'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              companyFilter === 'few' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            적음 (1개)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('reward', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>호출당 리워드</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {/* 호출당 리워드 드롭다운 메뉴 */}
                    {openDropdown === 'reward' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setRewardFilter(''); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === '' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setRewardFilter('high'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === 'high' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            높음 (0.01+)
                          </button>
                          <button 
                            onClick={() => { setRewardFilter('medium'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === 'medium' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            보통 (0.005-0.009)
                          </button>
                          <button 
                            onClick={() => { setRewardFilter('low'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardFilter === 'low' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            낮음 (0.005 미만)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {currentMusics.map((music, index) => {
                const usageRate = music.monthlyLimit ? Math.round((music.monthlyUsed / music.monthlyLimit) * 100) : null
                const categoryColor = getCategoryColor(music.category)
                
                // 유효재생률 계산 (예시 데이터)
                const totalPlays = Math.floor(music.monthlyUsed * (1 + Math.random() * 0.3 + 0.1)) // 10-40% 추가
                const validRate = Math.round((music.monthlyUsed / totalPlays) * 100)
                
                return (
                  <tr key={music.id} className={`border-b border-white/5 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                  } hover:bg-white/8`}>
                    <td className="px-8 py-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedMusics.includes(music.id)}
                        onChange={() => handleSelectMusic(music.id)}
                        className="accent-teal-400 rounded" 
                      />
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="font-semibold text-white">{music.title}</div>
                    </td>
                    <td className="px-8 py-5 text-white/80 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColor.bg} ${categoryColor.text} border ${categoryColor.border}`}>
                        {music.category}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-white/80 text-center">
                      {music.monthlyLimit ? music.monthlyLimit.toLocaleString() : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25">
                          무제한
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {usageRate !== null ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-20 bg-white/10 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-teal-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${usageRate}%` }}
                            />
                          </div>
                          <span className="text-white/70 text-xs font-medium">{usageRate}%</span>
                        </div>
                      ) : (
                        <span className="text-white/50 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-white/80 text-center">
                      {music.companies}개
                    </td>
                    <td className="px-8 py-5 text-white/80 text-center">
                      {music.rewardPerPlay.toFixed(3)} 토큰
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button 
                          className="rounded-md bg-teal-500/90 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-teal-400 transition-all duration-200"
                          onClick={() => {
                            setSelectedMusic(music)
                            setModalOpen(true)
                          }}
                        >
                          상세
                        </button>
                        <button 
                          className="rounded-md bg-white/10 px-2.5 py-1.5 text-xs text-white font-medium hover:bg-white/20 transition-all duration-200"
                          onClick={() => {
                            setSelectedMusicForEdit(music)
                            setRewardEditModalOpen(true)
                          }}
                        >
                          리워드 수정
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="sticky bottom-0 flex items-center justify-center text-sm text-white/70 mt-8 bg-neutral-950 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7" />
            </svg>
          </button>
          <span className="px-5 py-2.5 bg-gradient-to-r from-white/8 to-white/5 rounded-lg border border-white/10 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 음원 상세 모달 */}
      {selectedMusic && (
        <MusicDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedMusic(null)
          }}
          music={selectedMusic}
        />
      )}

      {/* 리워드 수정 모달 */}
      {selectedMusicForEdit && (
        <RewardEditModal
          open={rewardEditModalOpen}
          onClose={() => {
            setRewardEditModalOpen(false)
            setSelectedMusicForEdit(null)
          }}
          music={selectedMusicForEdit}
        />
      )}

      {/* 일괄 수정 모달 */}
      <BulkRewardEditModal
        open={bulkEditModalOpen}
        onClose={() => {
          setBulkEditModalOpen(false)
          setSelectedMusics([])
        }}
        selectedMusics={selectedMusicsData}
      />
    </div>
  )
} 