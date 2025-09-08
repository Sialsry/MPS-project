'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Title from '@/components/ui/Title'

type Category = {
  id: string
  name: string
  count: number
  color: string
  songs: Song[]
  isExpanded: boolean
}

type Song = {
  id: string
  title: string
  artist: string
  duration: string
  isApiActive: boolean
}

export default function MusicCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 'pop', name: 'Pop', count: 234, color: '', isExpanded: false, songs: [
      { id: '1', title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', isApiActive: true },
      { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', isApiActive: true },
      { id: '3', title: 'Dance Monkey', artist: 'Tones and I', duration: '3:29', isApiActive: false }
    ] },
    { id: 'rock', name: 'Rock', count: 156, color: '', isExpanded: false, songs: [
      { id: '4', title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55', isApiActive: true },
      { id: '5', title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02', isApiActive: true },
      { id: '6', title: 'Hotel California', artist: 'Eagles', duration: '6:30', isApiActive: false }
    ] },
    { id: 'jazz', name: 'Jazz', count: 89, color: '', isExpanded: false, songs: [
      { id: '7', title: 'Take Five', artist: 'Dave Brubeck', duration: '5:24', isApiActive: true },
      { id: '8', title: 'So What', artist: 'Miles Davis', duration: '9:22', isApiActive: false }
    ] },
    { id: 'classical', name: 'Classical', count: 67, color: '', isExpanded: false, songs: [
      { id: '9', title: 'Moonlight Sonata', artist: 'Beethoven', duration: '14:33', isApiActive: true },
      { id: '10', title: 'Symphony No. 5', artist: 'Beethoven', duration: '33:45', isApiActive: false }
    ] },
    { id: 'electronic', name: 'Electronic', count: 145, color: '', isExpanded: false, songs: [
      { id: '11', title: 'Sandstorm', artist: 'Darude', duration: '3:45', isApiActive: true },
      { id: '12', title: 'Levels', artist: 'Avicii', duration: '5:27', isApiActive: true }
    ] },
    { id: 'hiphop', name: 'Hip-Hop', count: 98, color: '', isExpanded: false, songs: [
      { id: '13', title: 'Lose Yourself', artist: 'Eminem', duration: '5:26', isApiActive: true },
      { id: '14', title: 'In Da Club', artist: '50 Cent', duration: '3:13', isApiActive: false }
    ] }
  ])
  
  const [newCategory, setNewCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [draggedSong, setDraggedSong] = useState<{ song: Song; fromCategory: string } | null>(null)

  const addCategory = () => {
    if (newCategory.trim()) {
      const newCat: Category = {
        id: newCategory.toLowerCase().replace(/\s+/g, '-'),
        name: newCategory.trim(),
        count: 0,
        color: '',
        isExpanded: false,
        songs: []
      }
      setCategories([...categories, newCat])
      setNewCategory('')
    }
  }

  const handleDragStart = (e: React.DragEvent, song: Song, categoryId: string) => {
    setDraggedSong({ song, fromCategory: categoryId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    if (!draggedSong || draggedSong.fromCategory === targetCategoryId) return

    setCategories(prev => prev.map(cat => {
      if (cat.id === draggedSong.fromCategory) {
        return { ...cat, songs: cat.songs.filter(s => s.id !== draggedSong.song.id), count: cat.count - 1 }
      }
      if (cat.id === targetCategoryId) {
        return { ...cat, songs: [...cat.songs, draggedSong.song], count: cat.count + 1 }
      }
      return cat
    }))
    setDraggedSong(null)
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  const toggleCategoryExpansion = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ))
  }

  return (
    <div className="space-y-6">
      {/* 새 카테고리 추가 */}
      <Card>
        <Title variant="section">새 카테고리 추가</Title>
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="새로운 카테고리명을 입력하세요"
            className="flex-1 rounded-lg bg-black/30 px-3 py-2.5 text-white placeholder-white/50 outline-none ring-1 ring-white/8 focus:ring-2 focus:ring-teal-400/40 transition-all duration-200 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          />
          <button
            onClick={addCategory}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-1.5 text-xs text-white font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
          >
            추가
          </button>
        </div>
      </Card>

      {/* 카테고리 목록 */}
      <Card>
        <Title variant="section">카테고리 목록</Title>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
                         <div
               key={category.id}
               className={`relative p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                 selectedCategory === category.id
                   ? 'border-teal-400 bg-teal-500/10'
                   : 'border-white/10 bg-black/20 hover:bg-black/30'
               }`}
               onClick={() => setSelectedCategory(category.id)}
               onDragOver={handleDragOver}
               onDrop={(e) => handleDrop(e, category.id)}
             >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{category.name}</h3>
                <span className="text-sm text-white/70">{category.count} 음원</span>
              </div>
              
                             {/* 드래그 가능한 음원 목록 */}
               <div className="space-y-1">
                 {(category.isExpanded ? category.songs : category.songs.slice(0, 3)).map((song) => (
                   <div
                     key={song.id}
                     draggable
                     onDragStart={(e) => handleDragStart(e, song, category.id)}
                     className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-move"
                   >
                     <div className={`w-2 h-2 rounded-full ${song.isApiActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                     <div className="flex-1 min-w-0">
                       <div className="text-sm text-white truncate">{song.title}</div>
                       <div className="text-xs text-white/60">{song.artist} • {song.duration}</div>
                     </div>
                   </div>
                 ))}
                 {category.songs.length > 3 && !category.isExpanded && (
                   <button
                     onClick={(e) => {
                       e.stopPropagation()
                       toggleCategoryExpansion(category.id)
                     }}
                     className="w-full text-xs text-teal-400 hover:text-teal-300 text-center py-2 rounded bg-white/5 hover:bg-white/10 transition-all duration-200"
                   >
                     전체보기 ({category.songs.length}개)
                   </button>
                 )}
                 {category.songs.length > 3 && category.isExpanded && (
                   <button
                     onClick={(e) => {
                       e.stopPropagation()
                       toggleCategoryExpansion(category.id)
                     }}
                     className="w-full text-xs text-white/60 hover:text-white/80 text-center py-2 rounded bg-white/5 hover:bg-white/10 transition-all duration-200"
                   >
                     접기
                   </button>
                 )}
               </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 선택된 카테고리 음원 목록 */}
      {selectedCategoryData && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title variant="section">{selectedCategoryData.name} 음원 목록</Title>
            <button
              onClick={() => setSelectedCategory(null)}
              className="rounded bg-white/10 p-1 text-white hover:bg-white/15 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            {selectedCategoryData.songs.map((song) => (
              <div
                key={song.id}
                draggable
                onDragStart={(e) => handleDragStart(e, song, selectedCategoryData.id)}
                className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-move"
              >
                <div className={`w-2 h-2 rounded-full ${song.isApiActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{song.title}</div>
                  <div className="text-xs text-white/60">{song.artist} • {song.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
} 