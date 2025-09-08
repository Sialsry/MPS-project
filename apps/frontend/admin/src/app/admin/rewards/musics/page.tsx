'use client'

import { useState } from 'react'
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
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
  const [rewardEditModalOpen, setRewardEditModalOpen] = useState(false)
  const [selectedMusicForEdit, setSelectedMusicForEdit] = useState<Music | null>(null)
  const [selectedMusics, setSelectedMusics] = useState<string[]>([])
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false)

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
              <option value="title-asc">제목순 (오름차순)</option>
              <option value="title-desc">제목순 (내림차순)</option>
              <option value="monthlyUsed-desc">유효재생 높은순</option>
              <option value="companies-desc">사용 기업 많은순</option>
            </select>
          </div>
          {selectedMusics.length > 0 && (
            <button
              onClick={() => setBulkEditModalOpen(true)}
              className="px-3 py-2 bg-orange-500/90 text-white text-xs font-medium rounded-lg hover:bg-orange-400 transition-colors"
            >
              일괄 수정 ({selectedMusics.length}개)
            </button>
          )}
        </div>
        
        <div className="text-sm text-white/60">
          총 <span className="text-teal-300 font-semibold">{filteredMusics.length}</span>개 음원
          {selectedMusics.length > 0 && (
            <span className="ml-2 text-orange-300">
              • 선택됨: <span className="text-orange-300 font-semibold">{selectedMusics.length}</span>개
            </span>
          )}
        </div>
      </div>

      {/* 음원 목록 */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-white/10">
                <th className="px-8 py-5">
                  <input 
                    type="checkbox" 
                    checked={selectedMusics.length === filteredMusics.length && filteredMusics.length > 0}
                    onChange={handleSelectAll}
                    className="accent-teal-400 rounded" 
                  />
                </th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">음원명</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">카테고리</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">이번 달 유효재생</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">유효재생률</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">월 한도</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">사용률</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">사용 기업</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">호출당 리워드</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">상태</th>
                <th className="px-8 py-5 text-white/80 font-semibold text-xs uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredMusics.map((music, index) => {
                const usageRate = music.monthlyLimit ? Math.round((music.monthlyUsed / music.monthlyLimit) * 100) : null
                const categoryColor = getCategoryColor(music.category)
                
                // 유효재생률 계산 (예시 데이터)
                const totalPlays = Math.floor(music.monthlyUsed * (1 + Math.random() * 0.3 + 0.1)) // 10-40% 추가
                const validRate = Math.round((music.monthlyUsed / totalPlays) * 100)
                
                return (
                  <tr key={music.id} className={`border-b border-white/5 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                  } hover:bg-white/8`}>
                    <td className="px-8 py-5">
                      <input 
                        type="checkbox" 
                        checked={selectedMusics.includes(music.id)}
                        onChange={() => handleSelectMusic(music.id)}
                        className="accent-teal-400 rounded" 
                      />
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-semibold text-white">{music.title}</div>
                    </td>
                    <td className="px-8 py-5 text-white/80">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColor.bg} ${categoryColor.text} border ${categoryColor.border}`}>
                        {music.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-teal-400 font-medium">
                      <div className="flex flex-col">
                        <span>{music.monthlyUsed.toLocaleString()}회</span>
                        <span className="text-xs text-white/50">총 {totalPlays.toLocaleString()}회</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-teal-300 font-medium">{validRate}%</span>
                    </td>
                    <td className="px-8 py-5 text-white/80">
                      {music.monthlyLimit ? music.monthlyLimit.toLocaleString() : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25">
                          무제한
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {usageRate !== null ? (
                        <div className="flex items-center gap-3">
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
                    <td className="px-8 py-5 text-white/80">
                      {music.companies}개
                    </td>
                    <td className="px-8 py-5 text-white/80">
                      {music.rewardPerPlay.toFixed(3)} 토큰
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        music.status === 'active' 
                          ? 'bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25'
                          : 'bg-gradient-to-r from-gray-400/15 to-gray-500/15 text-gray-300 border border-gray-400/25'
                      }`}>
                        {music.status === 'active' ? '●' : '○'} {music.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-1.5">
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