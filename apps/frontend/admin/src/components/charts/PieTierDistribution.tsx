'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Chart, DoughnutController, ArcElement, Legend, Tooltip } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Legend, Tooltip)

export default function PieTierDistribution() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!

    const labels = ['Free', 'Standard', 'Business']
    const counts = [100, 120, 120]

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          { data: counts, backgroundColor: ['#9ca3af', '#14b8a6', '#3b82f6'], borderColor: 'rgba(0,0,0,0.8)', borderWidth: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, color: '#9ca3af' } } },
        onClick: (_, elements) => {
          if (!elements.length) return
          const idx = elements[0].index
          const tiers = ['free', 'standard', 'business']
          const tier = tiers[idx]
          router.push(`/admin/companies?tier=${tier}`)
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [router])

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
} 