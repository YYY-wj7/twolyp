import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, FileText, Heart, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, withTimeout } from '../lib/utils'
import { CATEGORIES } from '../lib/constants'

export default function AnnualReportPage() {
  const navigate = useNavigate()
  const { gardenId, garden } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalPhotos: 0,
    daysSinceCreation: 0,
    topCategory: null,
  })

  useEffect(() => {
    async function fetchReport() {
      if (!gardenId) return
      setLoading(true)
      try {
        // 1. Get garden creation date
        let gardenCreatedAt = null
        if (garden?.created_at) {
          gardenCreatedAt = new Date(garden.created_at)
        } else {
          const { data: gardenData } = await withTimeout(
            supabase.from('gardens').select('created_at').eq('id', gardenId).maybeSingle(),
            15000, '加载花园信息'
          )
          if (gardenData?.created_at) {
            gardenCreatedAt = new Date(gardenData.created_at)
          }
        }

        const daysSinceCreation = gardenCreatedAt
          ? Math.max(1, Math.floor((Date.now() - gardenCreatedAt.getTime()) / (1000 * 60 * 60 * 24)))
          : 0

        // 2. Get total records count
        const { count: recordCount } = await withTimeout(
          supabase.from('records').select('*', { count: 'exact', head: true })
            .eq('garden_id', gardenId).eq('is_deleted', false),
          15000, '加载记录统计'
        )

        // 3. Get total photos
        let photoCount = 0
        const { data: recordIds } = await withTimeout(
          supabase.from('records').select('id').eq('garden_id', gardenId).eq('is_deleted', false),
          15000, '加载记录列表'
        )
        if (recordIds && recordIds.length > 0) {
          const ids = recordIds.map(r => r.id)
          const { count: mediaCount } = await withTimeout(
            supabase.from('media').select('id', { count: 'exact', head: true }).in('record_id', ids),
            15000, '加载照片统计'
          )
          photoCount = mediaCount || 0
        }

        // 4. Get most active category
        const { data: categoryData } = await withTimeout(
          supabase.from('records').select('category').eq('garden_id', gardenId).eq('is_deleted', false),
          15000, '加载分类统计'
        )
        let topCategory = null
        if (categoryData && categoryData.length > 0) {
          const counts = {}
          categoryData.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1 })
          const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
          if (sorted.length > 0) {
            const catInfo = CATEGORIES.find(c => c.id === sorted[0][0])
            topCategory = {
              id: sorted[0][0],
              label: catInfo?.label || sorted[0][0],
              emoji: catInfo?.emoji || '📝',
              count: sorted[0][1],
            }
          }
        }

        setStats({ totalRecords: recordCount || 0, totalPhotos: photoCount, daysSinceCreation, topCategory })
      } catch (e) {
        console.warn('Failed to fetch annual report:', e)
        setError(e.message || '加载年度报告失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [gardenId, garden])

  const currentYear = new Date().getFullYear()

  const statCards = [
    { icon: FileText, label: '记录', value: stats.totalRecords, gradient: 'from-apricot-400 to-peach-300' },
    { icon: Camera, label: '照片', value: stats.totalPhotos, gradient: 'from-tulip-400 to-apricot-300' },
    { icon: Heart, label: '天数', value: stats.daysSinceCreation, gradient: 'from-apricot-500 to-tulip-400' },
    { icon: Sparkles, label: '最爱分类', value: stats.topCategory?.label || '-', gradient: 'from-peach-300 to-tulip-300' },
  ]

  if (loading) {
    return (
      <div className="min-h-dvh gradient-warm dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-apricot-400 animate-spin" />
          <span className="text-sm text-milk-500 dark:text-milk-400">正在生成报告...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh gradient-warm dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg flex flex-col items-center justify-center px-8">
        <Heart className="w-10 h-10 text-milk-300 dark:text-milk-600 mx-auto mb-4" />
        <p className="text-sm text-tulip-500 dark:text-tulip-400">{error}</p>
      </div>
    )
  }

  const isEmpty = stats.totalRecords === 0

  return (
    <div className="min-h-dvh gradient-warm dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg">
      <header className="sticky top-0 z-40 safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 dark:bg-dark-card/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            {currentYear} 年度报告
          </h1>
        </div>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white/50 dark:bg-dark-card/50 flex items-center justify-center mb-6 shadow-card">
            <Heart className="w-10 h-10 text-apricot-400" />
          </div>
          <h2 className="text-xl font-bold text-milk-900 dark:text-milk-100 mb-2">
            还没有记录呢
          </h2>
          <p className="text-sm text-milk-500 dark:text-milk-400 max-w-xs">
            开始记录你们的故事吧，每一条记录都是珍贵的回忆
          </p>
        </div>
      ) : (
        <>
          {/* Hero: Days together */}
          <div className="text-center px-8 py-12">
            <p className="text-sm text-milk-500 dark:text-milk-400 mb-2 font-medium">在一起已经</p>
            <div className="text-7xl font-bold bg-gradient-to-r from-apricot-500 via-tulip-400 to-apricot-400 bg-clip-text text-transparent">
              {stats.daysSinceCreation}
            </div>
            <p className="text-lg text-milk-600 dark:text-milk-300 mt-1 font-medium">天</p>
          </div>

          {/* Stats grid */}
          <div className="px-6 grid grid-cols-2 gap-3">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="p-5 rounded-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border border-white/50 dark:border-dark-border shadow-card text-center animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br mx-auto mb-3 flex items-center justify-center', stat.gradient)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-milk-900 dark:text-milk-100">
                    {stat.value}
                  </div>
                  <div className="text-xs text-milk-500 dark:text-milk-400 mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Highlights */}
          <div className="px-6 mt-8 pb-8">
            <h2 className="text-lg font-bold text-milk-900 dark:text-milk-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-apricot-400" />
              年度高光时刻
            </h2>
            <div className="space-y-3">
              {stats.topCategory && (
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm border border-white/40 dark:border-dark-border shadow-card">
                  <p className="text-sm text-milk-700 dark:text-milk-300">
                    今年你们在「{stats.topCategory.emoji} {stats.topCategory.label}」分类下留下了 {stats.topCategory.count} 条记录
                  </p>
                </div>
              )}
              {stats.totalPhotos > 0 && (
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm border border-white/40 dark:border-dark-border shadow-card">
                  <p className="text-sm text-milk-700 dark:text-milk-300">
                    一起保存了 {stats.totalPhotos} 张珍贵照片
                  </p>
                </div>
              )}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm border border-white/40 dark:border-dark-border shadow-card">
                <p className="text-sm text-milk-700 dark:text-milk-300">
                  {stats.daysSinceCreation} 天的陪伴，每一天都是最好的礼物
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
