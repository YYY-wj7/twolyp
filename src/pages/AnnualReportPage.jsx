import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin, Heart, Utensils } from 'lucide-react'
import { cn } from '../lib/utils'

export default function AnnualReportPage() {
  const navigate = useNavigate()

  // Mock annual stats
  const stats = [
    { icon: Camera, label: '照片', value: 186, color: 'text-apricot-500' },
    { icon: MapPin, label: '城市', value: 5, color: 'text-tulip-500' },
    { icon: Heart, label: '记录', value: 42, color: 'text-apricot-600' },
    { icon: Utensils, label: '美食', value: 18, color: 'text-tulip-400' },
  ]

  return (
    <div className="min-h-dvh bg-gradient-to-b from-apricot-100 via-milk-50 to-tulip-50 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg transition-theme">
      <header className="sticky top-0 z-40 safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200/50 dark:hover:bg-dark-card/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            2025 年度报告
          </h1>
        </div>
      </header>

      {/* Hero section */}
      <div className="text-center px-8 py-12">
        <p className="text-sm text-milk-500 dark:text-milk-400 mb-2">在一起已经</p>
        <div className="text-6xl font-bold bg-gradient-to-r from-apricot-500 to-tulip-500 bg-clip-text text-transparent">
          458
        </div>
        <p className="text-lg text-milk-600 dark:text-milk-300 mt-1">天</p>
      </div>

      {/* Stats grid */}
      <div className="px-6 grid grid-cols-2 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border border-milk-200/50 dark:border-dark-border text-center"
            >
              <Icon className={cn('w-8 h-8 mx-auto mb-2', stat.color)} />
              <div className="text-3xl font-bold text-milk-900 dark:text-milk-100">
                {stat.value}
              </div>
              <div className="text-sm text-milk-500 dark:text-milk-400 mt-1">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Highlights section placeholder */}
      <div className="px-6 mt-8 pb-8">
        <h2 className="text-lg font-semibold text-milk-900 dark:text-milk-100 mb-4">
          年度高光时刻
        </h2>
        <div className="space-y-4">
          {['一起看过的最美日落', '第一次一起做饭', '去过最远的地方'].map((highlight, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white/60 dark:bg-dark-card/60 backdrop-blur-sm border border-milk-200/30 dark:border-dark-border"
            >
              <p className="text-sm text-milk-700 dark:text-milk-300">{highlight}</p>
              <div className="mt-3 h-32 rounded-xl bg-milk-200/50 dark:bg-dark-border/50 flex items-center justify-center">
                <span className="text-xs text-milk-400">精选照片</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
