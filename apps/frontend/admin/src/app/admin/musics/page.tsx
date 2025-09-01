'use client'

import React, { useState, useEffect } from 'react'
import MusicStatsModal from '@/components/modals/MusicStatsModal'
import MusicEditModal from '@/components/modals/MusicEditModal'

export default function MusicsPage() {
  const [statsOpen, setStatsOpen] = useState(false)
  const [statsTitle, setStatsTitle] = useState<string>('음원 상세 통계')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editMusicData, setEditMusicData] = useState<any>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  
  // 필터링 상태
  const [genreFilter, setGenreFilter] = useState('전체')
  const [musicTypeFilter, setMusicTypeFilter] = useState('전체')
  
  // 드롭다운 필터 상태 (새로 추가)
  const [idSortFilter, setIdSortFilter] = useState('전체')
  const [releaseDateSortFilter, setReleaseDateSortFilter] = useState('전체')
  const [rewardLimitFilter, setRewardLimitFilter] = useState('전체')
  
  // 정렬 상태 추가
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // 드롭다운 열림/닫힘 상태
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // 페이지 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleDelete = (title: string) => {
    setDeleteTarget(title)
    setDeleteModalOpen(true)
  }
  
  // 드롭다운 토글 함수
  const toggleDropdown = (dropdownName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = openDropdown === dropdownName ? null : dropdownName
    
    setTimeout(() => {
      setOpenDropdown(newState)
    }, 0)
  }
  
  // 드롭다운 닫기 함수
  const closeDropdown = () => {
    setOpenDropdown(null)
  }
  
  // 정렬 함수
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const confirmDelete = () => {
    if (deleteTarget.includes('개 음원')) {
      console.log(`일괄 삭제됨: ${selectedItems.size}개 음원`)
      setSelectedItems(new Set())
      setSelectAll(false)
    } else {
      console.log(`삭제됨: ${deleteTarget}`)
    }
    setDeleteModalOpen(false)
    setDeleteTarget('')
  }

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

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return
    setDeleteTarget(`${selectedItems.size}개 음원`)
    setDeleteModalOpen(true)
  }

  const handleEdit = (index: number) => {
    const mockMusicData = {
      title: `Song Title ${index + 1}`,
      artist: `Artist ${index + 1}`,
      genre: 'Pop',
      tags: '차분한, 릴렉스',
      releaseYear: 2024,
      durationSec: 180 + index * 10,
      priceRef: 7,
      rewardPerPlay: 0.007,
      maxPlayCount: 1000,
      accessTier: 'all' as const
    }
    setIsCreateMode(false)
    setEditMusicData(mockMusicData)
    setEditModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 검색/필터 및 음원 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="min-w-[300px]">
            <input
              className="w-full px-3 py-2 text-white placeholder-white/50 outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm" 
              placeholder="음원명, 아티스트, 태그로 검색 .." 
            />
          </div>
          <button 
            onClick={() => {
              console.log('검색 실행')
            }}
            className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={() => {
              setIsCreateMode(true)
              setEditMusicData(null)
              setEditModalOpen(true)
            }}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm font-medium text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
          >
            음원 등록
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-white/60">
            총 음원: <span className="text-teal-300 font-semibold">1,234</span>개 | 
            선택됨: <span className="text-teal-300 font-semibold">{selectedItems.size}</span>개
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={selectedItems.size === 0}
            className={`rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
              selectedItems.size === 0 
                ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            일괄 삭제
          </button>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-center">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="accent-teal-400 rounded" 
                  />
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('idSort', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>음원번호</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {openDropdown === 'idSort' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setIdSortFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              idSortFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setIdSortFilter('오름차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              idSortFilter === '오름차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            오름차순
                          </button>
                          <button 
                            onClick={() => { setIdSortFilter('내림차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              idSortFilter === '내림차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            내림차순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">제목</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">아티스트</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('musicType', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>음원 유형</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {openDropdown === 'musicType' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setMusicTypeFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setMusicTypeFilter('일반'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === '일반' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            일반
                          </button>
                          <button 
                            onClick={() => { setMusicTypeFilter('Inst'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              musicTypeFilter === 'Inst' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            Inst
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('category', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>카테고리</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {openDropdown === 'category' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setGenreFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              genreFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          {['Pop', 'Rock', 'Jazz', 'Classical'].map((genre) => (
                            <button 
                              key={genre}
                              onClick={() => { setGenreFilter(genre); closeDropdown(); }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                                genreFilter === genre ? 'text-teal-300 bg-white/5' : 'text-white/80'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">태그</th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('releaseDate', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>발매일</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {openDropdown === 'releaseDate' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setReleaseDateSortFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              releaseDateSortFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setReleaseDateSortFilter('오름차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              releaseDateSortFilter === '오름차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            오름차순
                          </button>
                          <button 
                            onClick={() => { setReleaseDateSortFilter('내림차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              releaseDateSortFilter === '내림차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            내림차순
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-white/70 font-medium text-center">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown('rewardLimit', e)}
                      className="flex items-center justify-center gap-1 w-full text-center hover:text-white/90 transition-colors"
                    >
                      <span>월 최대 리워드 한도</span>
                      <span className="text-white/50">▼</span>
                    </button>
                    
                    {openDropdown === 'rewardLimit' && (
                      <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl z-[9999] min-w-[120px]">
                        <div className="py-1">
                          <button 
                            onClick={() => { setRewardLimitFilter('전체'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardLimitFilter === '전체' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            전체
                          </button>
                          <button 
                            onClick={() => { setRewardLimitFilter('오름차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardLimitFilter === '오름차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            오름차순
                          </button>
                          <button 
                            onClick={() => { setRewardLimitFilter('내림차순'); closeDropdown(); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                              rewardLimitFilter === '내림차순' ? 'text-teal-300 bg-white/5' : 'text-white/80'
                            }`}
                          >
                            내림차순
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
              {React.useMemo(() => {
                // 필터링 + 정렬된 데이터 생성
                let filteredData = [...Array(10)].map((_, i) => ({
                  index: i,
                  id: i + 1,                                    // 음원번호
                  title: `Song Title ${i+1}`,                  // 제목
                  artist: `Artist ${i+1}`,                     // 아티스트
                  musicType: i % 2 === 0 ? '일반' : 'Inst',     // 음원 유형
                  genre: ['Pop', 'Rock', 'Jazz', 'Classical'][i % 4], // 카테고리
                  tags: '차분한, 릴렉스',                        // 태그
                  releaseDate: '2024.01.15',                   // 발매일
                  maxRewardLimit: '1000토큰',                  // 월 최대 리워드 한도
                }))
                
                // 필터링
                filteredData = filteredData.filter(item => {
                  if (genreFilter !== '전체' && item.genre !== genreFilter) return false
                  if (musicTypeFilter !== '전체' && item.musicType !== musicTypeFilter) return false
                  return true
                })
                
                // 정렬
                if (sortBy && sortOrder) {
                  filteredData.sort((a, b) => {
                    let aVal = a[sortBy as keyof typeof a]
                    let bVal = b[sortBy as keyof typeof b]
                    
                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
                    }
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                    }
                    return 0
                  })
                }
                
                return filteredData
              }, [genreFilter, musicTypeFilter, sortBy, sortOrder, idSortFilter, releaseDateSortFilter, rewardLimitFilter]).map((item) => {
                return (
                  <tr 
                    key={item.index} 
                    className={`border-b border-white/5 transition-all duration-200 cursor-pointer ${
                      item.index % 2 === 0 ? 'bg-white/2' : 'bg-white/1'
                    } hover:bg-white/8`}
                    onClick={() => {
                      setStatsTitle(item.title)
                      setStatsOpen(true)
                    }}
                  >
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                        checked={selectedItems.has(item.index)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleItemSelect(item.index)
                        }}
                      className="accent-teal-400 rounded" 
                    />
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-white">{item.id}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-white">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-white/80">{item.artist}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-400/15 to-purple-400/15 text-purple-300 border border-purple-400/25">
                      {item.musicType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25">
                      {item.genre}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-center">{item.tags}</td>
                  <td className="px-6 py-4 text-white/60 text-center">{item.releaseDate}</td>
                  <td className="px-6 py-4 text-white/80 text-center">
                    {item.maxRewardLimit}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(item.index)
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatsTitle(item.title)
                          setStatsOpen(true)
                        }}
                      >
                        상세
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="sticky bottom-0 flex items-center justify-center text-sm text-white/70 mt-8 bg-neutral-950 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all duration-200 hover:border-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-5 py-2.5 bg-gradient-to-r from-white/8 to-white/5 rounded-lg border border-white/10 font-medium">1 / 25</span>
          <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 통계 모달 */}
      <MusicStatsModal open={statsOpen} onClose={()=>setStatsOpen(false)} title={statsTitle} />

      {/* 수정/등록 모달 */}
      <MusicEditModal
        open={editModalOpen} 
        onClose={() => {
          setEditModalOpen(false)
          setIsCreateMode(false)
        }} 
        musicData={editMusicData}
        isCreateMode={isCreateMode}
      />

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/90 p-6 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">음원 삭제 확인</h3>
              <p className="text-sm text-white/60">
                <span className="font-medium text-white">"{deleteTarget}"</span> 음원을 삭제하시겠습니까?
              </p>
              <p className="mt-2 text-xs text-red-400">이 작업은 되돌릴 수 없습니다.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-medium hover:bg-white/10 transition-all duration-200"
              >
                취소
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 