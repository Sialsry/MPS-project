"use client"
import React from 'react'

interface DailyTxDetailModalProps {
    open: boolean
    onClose: () => void
    batch: {
        id: string
        date: string
        executedAt: string | null
        totalReward: number
        dbValidPlayCount: number
        onchainRecordedPlayCount: number
        txHash: string | null
        status: 'success' | 'pending' | 'not-executed' | 'failed'
        mismatch?: boolean
        blockNumber?: number | null
        gasUsed?: number | null
    } | null
}

export default function DailyTxDetailModal({ open, onClose, batch }: DailyTxDetailModalProps) {
    if (!open || !batch) return null

    const companyDistributions = [
        { company: 'Company A', amount: 12100, percent: 26.8 },
        { company: 'Company B', amount: 9800, percent: 21.7 },
        { company: 'Company C', amount: 7500, percent: 16.6 },
        { company: 'Company D', amount: 6400, percent: 14.2 },
        { company: '기타', amount: 60410 - (12100 + 9800 + 7500 + 6400), percent: 20.7 }
    ]

    const validPlayHistory = Array.from({ length: 50 }, (_, i) => {
        const hour = Math.floor(Math.random() * 24)
        const minute = Math.floor(Math.random() * 60)
        const second = Math.floor(Math.random() * 60)
        const companies = ['Company A', 'Company B', 'Company C', 'Company D']
        const musics = [
            { title: 'Dream of Sky', id: 'M001' },
            { title: 'Ocean Whisper', id: 'M002' },
            { title: 'Neon Nights', id: 'M003' },
            { title: 'Silent Echo', id: 'M004' },
            { title: 'Pulse Runner', id: 'M005' }
        ]
        const music = musics[Math.floor(Math.random() * musics.length)]
        return {
            id: 'play-' + i,
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`,
            company: companies[Math.floor(Math.random() * companies.length)],
            musicTitle: music.title,
            musicId: music.id
        }
    }).sort((a, b) => a.time.localeCompare(b.time))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">일별 트랜잭션 상세 - {batch.date}</h2>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-8">
                    <section>
                        <h3 className="text-sm font-semibold text-white/80 mb-3">기본 메타</h3>
                        <div className="grid gap-4 md:grid-cols-3 text-sm">
                            <div className="space-y-1">
                                <div className="text-white/50">실행 시간</div>
                                <div className="text-white font-medium">{batch.executedAt || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-white/50">블록 번호</div>
                                <div className="text-white font-medium">{batch.blockNumber ? batch.blockNumber.toLocaleString() : '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-white/50">가스 사용량</div>
                                <div className="text-white font-medium">{batch.gasUsed ? batch.gasUsed.toLocaleString() + ' gas' : '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-white/50">리워드 발행 총량</div>
                                <div className="text-teal-300 font-semibold">{batch.totalReward.toLocaleString()} 토큰</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-white/50">DB 유효재생</div>
                                <div className="text-white/80">{batch.dbValidPlayCount.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-white/50">온체인 기록</div>
                                <div className="text-white/80">{batch.onchainRecordedPlayCount.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1 md:col-span-3">
                                <div className="text-white/50">Tx Hash</div>
                                <div className="font-mono text-xs text-white/70 break-all">{batch.txHash || '-'}</div>
                            </div>
                        </div>
                        {batch.mismatch && (
                            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                                DB 유효재생 수와 온체인 이벤트 기록에 불일치가 감지되었습니다. 재동기화 혹은 감사(audit)가 필요합니다.
                            </div>
                        )}
                    </section>

                    <section>
                        <h3 className="text-sm font-semibold text-white/80 mb-3">기업별 리워드 분배</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-white/50">
                                    <tr className="border-b border-white/10">
                                        <th className="py-2 pr-4">기업</th>
                                        <th className="py-2 pr-4">지급량</th>
                                        <th className="py-2 pr-0">비중</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyDistributions.map(d => (
                                        <tr key={d.company} className="border-b border-white/5">
                                            <td className="py-2 pr-4 text-white/80">{d.company}</td>
                                            <td className="py-2 pr-4 text-white">{d.amount.toLocaleString()} <span className="text-white/40 text-xs">토큰</span></td>
                                            <td className="py-2 pr-0 text-white/70">{d.percent.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-semibold text-white/80 mb-3">유효재생 히스토리</h3>
                        <div className="mb-3 flex items-center gap-3 text-xs text-white/50">
                            <span>해당 일자 집계에 포함된 유효재생 로그 (샘플 데이터)</span>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                            <div className="max-h-64 overflow-y-auto custom-scroll">
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0 bg-neutral-900/80 backdrop-blur text-white/50">
                                        <tr className="border-b border-white/10">
                                            <th className="py-2 px-3 text-left">시간</th>
                                            <th className="py-2 px-3 text-left">기업</th>
                                            <th className="py-2 px-3 text-left">음원</th>
                                            <th className="py-2 px-3 text-left">음원 ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validPlayHistory.map(row => (
                                            <tr key={row.id} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                                                <td className="py-2 px-3 font-mono text-white/70">{row.time}</td>
                                                <td className="py-2 px-3 text-white/80">{row.company}</td>
                                                <td className="py-2 px-3 text-white">{row.musicTitle}</td>
                                                <td className="py-2 px-3 font-mono text-white/60">{row.musicId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/80 transition"
                    >
                        닫기
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition">
                        재처리 요청
                    </button>
                </div>
            </div>
        </div>
    )
}

