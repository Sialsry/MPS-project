'use client'

import { useState } from 'react'
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

  const handleDelete = (title: string) => {
    setDeleteTarget(title)
    setDeleteModalOpen(true)
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
          <div className="min-w-[120px]">
            <select className="w-full px-3 py-2 text-white outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm">
              <option>전체 카테고리</option>
              <option>Pop</option>
              <option>Rock</option>
              <option>Jazz</option>
              <option>Classical</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <select className="w-full px-3 py-2 text-white outline-none border border-white/10 rounded-lg focus:border-teal-400/50 transition-colors text-sm">
              <option>최신순</option>
              <option>유효재생순</option>
              <option>이름순</option>
              <option>인기순</option>
            </select>
          </div>
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
                <th className="px-6 py-4 text-white/70 font-medium">썸네일</th>
                <th className="px-6 py-4 text-white/70 font-medium">음원명</th>
                <th className="px-6 py-4 text-white/70 font-medium">아티스트</th>
                <th className="px-6 py-4 text-white/70 font-medium">장르</th>
                <th className="px-6 py-4 text-white/70 font-medium">태그</th>
                <th className="px-6 py-4 text-white/70 font-medium">참고가격</th>
                <th className="px-6 py-4 text-white/70 font-medium">유효재생(1달 누적)</th>
                <th className="px-6 py-4 text-white/70 font-medium">유효재생률</th>
                <th className="px-6 py-4 text-white/70 font-medium">월 최대 리워드 한도</th>
                <th className="px-6 py-4 text-white/70 font-medium">호출당 리워드</th>
                <th className="px-6 py-4 text-white/70 font-medium">등록일</th>
                <th className="px-6 py-4 text-white/70 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => {
                const rowTitle = `Song Title ${i+1}`
                const validPlays = 1000 + i * 3
                const totalPlays = Math.floor(validPlays * (1 + Math.random() * 0.3 + 0.1)) // 10-40% 추가
                const validRate = Math.round((validPlays / totalPlays) * 100)
                
                return (
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400/20 via-blue-400/15 to-purple-400/20 border border-white/10 flex items-center justify-center shadow-inner">
                      <span className="text-teal-300 text-xl">🎵</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{rowTitle}</div>
                  </td>
                  <td className="px-6 py-4 text-white/80">Artist {i+1}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-400/15 to-blue-400/15 text-teal-300 border border-teal-400/25">
                      Pop
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60">차분한, 릴렉스</td>
                  <td className="px-6 py-4 text-white/80 font-medium">7원</td>
                  <td className="px-6 py-4 text-white/80">
                    <div className="flex flex-col">
                      <span className="font-medium">{validPlays.toLocaleString()}회</span>
                      <span className="text-xs text-white/50">총 {totalPlays.toLocaleString()}회</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-teal-300 font-medium">{validRate}%</span>
                  </td>
                  <td className="px-6 py-4 text-white/80">1000토큰</td>
                  <td className="px-6 py-4 text-white/80">0.007토큰</td>
                  <td className="px-6 py-4 text-white/60">2024.01.15</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                        onClick={() => handleEdit(i)}
                      >
                        수정
                      </button>
                      <button 
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white font-medium hover:bg-white/10 transition-all duration-200"
                        onClick={() => handleDelete(rowTitle)}
                      >
                        삭제
                      </button>
                      <button 
                        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200" 
                        onClick={()=>{ setStatsTitle(rowTitle); setStatsOpen(true) }}
                      >
                        통계
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
      <div className="flex items-center justify-center text-sm text-white/70">
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

      {/* 수정 모달 */}
      <MusicEditModal 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        musicData={editMusicData}
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