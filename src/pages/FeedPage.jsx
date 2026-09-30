import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Pin, RefreshCw } from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'
import { CATEGORIES } from '../lib/constants'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

export default function FeedPage() {
  const navigate = useNavigate()
  const { gardenId, user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchRecords = useCallback(async () => {
    if (!gardenId) {
      setRecords([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('records')
        .select(`
          id,
          title,
          content,
          category,
          custom_tags,
          is_pinned,
          is_featured,
          location_name,
          recorded_at,
          created_at,
          author_id,
          media (id, type, thumbnail_url, compressed_url, original_url, sort_order)
        `)
        .eq('garden_id', gardenId)
        .eq('is_deleted', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Also fetch comment counts
      const recordIds = (data || []).map(r => r.id)
      let commentCounts = {}
      if (recordIds.length > 0) {
        const { data: comments } = await supabase
          .from('comments')
          .select('record_id')
          .in('record_id', recordIds)
        if (comments) {
          comments.forEach(c => {
            commentCounts[c.record_id] = (commentCounts[c.record_id] || 0) + 1
          })
        }
      }

      // Fetch author nicknames
      const authorIds = [...new Set((data || []).map(r => r.author_id))]
      let authorNames = {}
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nickname, email')
          .in('id', authorIds)
        if (profiles) {
          profiles.forEach(p => {
            authorNames[p.id] = p.nickname || p.email?.split('@')[0] || 'Unknown'
          })
        }
      }

      const enriched = (data || []).map(r => ({
        ...r,
        coverImage: r.media?.find(m => m.sort_order === 0)?.thumbnail_url
          || r.media?.[0]?.thumbnail_url
          || r.media?.[0]?.compressed_url
          || null,
        imageCount: r.media?.length || 0,
        author: authorNames[r.author_id] || 'Unknown',
        commentCount: commentCounts[r.id] || 0,
        tags: r.custom_tags || [],
        isPinned: r.is_pinned,
      }))

      setRecords(enriched)
    } catch (err) {
      console.error('Failed to fetch records:', err)
    } finally {
      setLoading(false)
    }
  }, [gardenId])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Filter by category and search
  const filteredRecords = records.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false
    if (searchQuery && !r.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !r.content?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const pinnedRecords = filteredRecords.filter(r => r.isPinned || r.is_featured)
  const normalRecords = filteredRecords.filter(r => !r.isPinned && !r.is_featured)

  return (
    <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-milk-50/80 dark:bg-dark-bg/80 backdrop-blur-xl safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            TwoLyp
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
            >
              <Search className="w-5 h-5 text-milk-600 dark:text-milk-400" />
            </button>
            <button
              onClick={fetchRecords}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
            >
              <RefreshCw className={cn("w-5 h-5 text-milk-600 dark:text-milk-400", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="px-4 pb-2">
            <input
              type="text"
              placeholder="搜索记录..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full h-9 px-4 rounded-full bg-milk-200 dark:bg-dark-card text-sm text-milk-800 dark:text-milk-200 placeholder:text-milk-400 focus:outline-none focus:ring-2 focus:ring-apricot-300"
            />
          </div>
        )}

        {/* Category tabs */}
        <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all',
              activeCategory === 'all'
                ? 'bg-apricot-400 text-white shadow-sm'
                : 'bg-milk-200 dark:bg-dark-card text-milk-600 dark:text-milk-400 hover:bg-milk-300'
            )}
          >
            全部
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1.5',
                activeCategory === cat.id
                  ? 'bg-apricot-400 text-white shadow-sm'
                  : 'bg-milk-200 dark:bg-dark-card text-milk-600 dark:text-milk-400 hover:bg-milk-300'
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Loading state */}
      {loading && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-apricot-400 animate-spin mb-3" />
          <p className="text-sm text-milk-500 dark:text-milk-400">加载中...</p>
        </div>
      )}

      {/* Pinned records */}
      {!loading && pinnedRecords.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Pin className="w-3.5 h-3.5 text-apricot-500" />
            <span className="text-xs font-medium text-apricot-600 dark:text-apricot-400">精选</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {pinnedRecords.map(record => (
              <div
                key={record.id}
                onClick={() => navigate(`/record/${record.id}`)}
                className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-white dark:bg-dark-card shadow-sm border border-milk-200 dark:border-dark-border cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="aspect-[4/3] overflow-hidden bg-milk-100 dark:bg-dark-border">
                  {record.coverImage ? (
                    <img
                      src={record.coverImage}
                      alt={record.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-milk-300 dark:text-milk-600 text-2xl">
                      {CATEGORIES.find(c => c.id === record.category)?.emoji || '📝'}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="text-sm font-medium text-milk-900 dark:text-milk-100 line-clamp-1">
                    {record.title}
                  </h3>
                  <p className="text-xs text-milk-500 dark:text-milk-400 mt-0.5">
                    {formatRelativeTime(record.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masonry card grid */}
      {!loading && normalRecords.length > 0 && (
        <div className="card-grid pt-3 pb-4">
          {normalRecords.map((record, index) => (
            <div
              key={record.id}
              className="card-item animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigate(`/record/${record.id}`)}
            >
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-dark-card shadow-sm border border-milk-100 dark:border-dark-border cursor-pointer active:scale-[0.98] transition-transform">
                {/* Cover image */}
                {record.coverImage && (
                  <div className="relative overflow-hidden">
                    <img
                      src={record.coverImage}
                      alt={record.title}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {record.imageCount > 1 && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {record.imageCount}张
                      </div>
                    )}
                  </div>
                )}

                {/* Card body */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-milk-900 dark:text-milk-100 line-clamp-2 leading-snug">
                    {record.title || '无标题'}
                  </h3>
                  {record.content && (
                    <p className="text-xs text-milk-500 dark:text-milk-400 mt-1 line-clamp-2">
                      {record.content}
                    </p>
                  )}

                  {/* Tags */}
                  {record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {record.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-apricot-50 dark:bg-dark-border text-apricot-600 dark:text-apricot-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: author + time */}
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-milk-400 dark:text-milk-500">
                      {record.author}
                    </span>
                    <span className="text-[10px] text-milk-400 dark:text-milk-500">
                      {formatRelativeTime(record.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <span className="text-5xl mb-4">🌷</span>
          <h3 className="text-lg font-medium text-milk-700 dark:text-milk-300">
            {records.length === 0 ? '花园还是空的' : '没有找到匹配的记录'}
          </h3>
          <p className="text-sm text-milk-500 dark:text-milk-400 mt-1">
            {records.length === 0
              ? '点击 + 按钮，种下第一朵郁金香吧'
              : '试试其他分类或关键词'
            }
          </p>
        </div>
      )}
    </div>
  )
}
