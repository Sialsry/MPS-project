import type { ReactNode } from 'react'

export default function CompaniesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white">기업 관리</h1>
        <p className="mt-1 text-sm text-teal-400">기업 목록 · 상세 정보</p>
      </div>
      {children}
    </div>
  )
} 