import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, RefreshCw, AlertCircle, Plus, Heart } from 'lucide-react'
import { cn, formatRelativeTime, withTimeout } from '../lib/utils'
import { CATEGORIES } from '../lib/constants'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

const STAGGER_CAP = 15

/* SVG illustration for garden empty state */
function GardenEmptyIllustration() {
  return (
    <svg viewBox="0 0 180 180" className="w-40 h-40" fill="none">
      {/* Soft glow background */}
      <circle cx="90" cy="90" r="80" fill="url(#emptyGlow)" opacity="0.2" />
      {/* Ground / garden bed */}
      <ellipse cx="90" cy="140" rx="55" ry="12" fill="#FECDD3" opacity="0.4" />
      {/* Left flower stem */}
      <path d="M65 140V100" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" />
      <path d="M65 115C55 108 48 112 50 118" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Left flower (tulip) */}
      <path d="M65 100C58 92 55 82 60 78C65 74 68 80 65 100Z" fill="#FDA4AF" />
      <path d="M65 100C72 92 75 82 70 78C65 74 62 80 65 100Z" fill="#F4728B" />
      {/* Right flower stem */}
      <path d="M115 140V95" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" />
      <path d="M115 110C125 103 132 107 130 113" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Right flower (tulip) */}
      <path d="M115 95C108 87 105 77 110 73C115 69 118 75 115 95Z" fill="#FB7185" />
      <path d="M115 95C122 87 125 77 120 73C115 69 112 75 115 95Z" fill="#F43F5E" />
      {/* Center heart */}
      <g transform="translate(90, 60)">
        <path
          d="M0 12C0 12-20-2-20-14C-20-22-12-24-8-22C-4-20 0-14 0-14C0-14 4-20 8-22C12-24 20-22 20-14C20-2 0 12 0 12Z"
          fill="#F4728B"
          opacity="0.8"
        />
        <path
          d="M0 8C0 8-14 0-14-8C-14-13-9-14-6-13C-3-11 0-8 0-8C0-8 3-11 6-13C9-14 14-13 14-8C14 0 0 8 0 8Z"
          fill="#FDA4AF"
          opacity="0.6"
        />
      </g>
      {/* Small sparkles */}
      <circle cx="42" cy="68" r="2" fill="#FECDD3" opacity="0.7" />
      <circle cx="140" cy="58" r="1.5" fill="#FECDD3" opacity="0.6" />
      <circle cx="55" cy="52" r="1.2" fill="#FB7185" opacity="0.5" />
      <circle cx="128" cy="80" r="1.8" fill="#FDA4AF" opacity="0.5" />
      <circle cx="78" cy="38" r="1" fill="#F4728B" opacity="0.4" />
      {/* Butterfly */}
      <g transform="translate(130, 45) rotate(-15)">
        <ellipse cx="-4" cy="0" rx="4" ry="3" fill="#FECDD3" opacity="0.6" />
        <ellipse cx="4" cy="0" rx="4" ry="3" fill="#FECDD3" opacity="0.6" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#F4728B" strokeWidth="0.8" />
      </g>
      <defs>
        <radialGradient id="emptyGlow">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="100%" stopColor="#FFFAFA" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="card-item">
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-dark-card shadow-card border border-milk-100 dark:border-dark-border">
        <div className="aspect-[3/4] bg-gradient-to-r from-milk-200 via-milk-100 to-milk-200 bg-[length:200%_100%] animate-shimmer" />
        <div className="p-3 space-y-2">
          <div className="h-3.5 w-4/5 rounded-full bg-gradient-to-r from-milk-200 via-milk-100 to-milk-200 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-3 w-3/5 rounded-full bg-gradient-to-r from-milk-200 via-milk-100 to-milk-200 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

/* Garden status banner — shows couple avatars + garden name + days */
function GardenBanner({ garden, user, partnerName, daysCount }) {
  const userInitial = (user?.nickname?.[0] || user?.email?.[0] || 'U').toUpperCase()
  const partnerInitial = (partnerName?.[0] || '?').toUpperCase()

  return (
    <div className="px-4 pt-2 pb-1">
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card">
        {/* Overlapping avatars */}
        <div className="flex -space-x-2 shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-apricot-300 to-apricot-400 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-dark-card z-10">
            {userInitial}
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tulip-300 to-tulip-400 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-dark-card">
            {partnerInitial}
          </div>
        </div>
        {/* Garden info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-apricot-400 fill-apricot-400 shrink-0" />
            <span className="text-sm font-medium text-milk-900 dark:text-milk-100 truncate">
              {garden?.name || '我们的花园'}
            </span>
          </div>
          <span className="text-[11px] text-milk-500 dark:text-milk-400">
            {partnerName ? `和 ${partnerName} 一起` : '等待 TA 加入'}
            {daysCount > 0 && ` · ${daysCount} 天`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { gardenId, user, garden } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [partnerName, setPartnerName] = useState(null)
  const [daysCount, setDaysCount] = useState(0)
  const prevPathnameRef = useRef(location.pathname)

  /* Fetch partner info and days count */
  useEffect(() => {
    async function fetchGardenMeta() {
      if (!gardenId || !user) return
      try {
        // Fetch partner
        const { data: members } = await withTimeout(
          supabase
            .from('garden_members')
            .select('user_id, profiles(nickname, email)')
            .eq('garden_id', gardenId)
            .neq('user_id', user.id),
          10000,
          '成员信息'
        )
        if (members?.[0]?.profiles) {
          setPartnerName(members[0].profiles.nickname || members[0].profiles.email?.split('@')[0] || null)
        }

        // Fetch earliest anniversary for days count
        const { data: anns } = await withTimeout(
          supabase
            .from('anniversaries')
            .select('date')
            .eq('garden_id', gardenId)
            .order('date', { ascending: true })
            .limit(1),
          10000,
          '纪念日'
        )
        if (anns?.[0]?.date) {
          const d = new Date(anns[0].date)
          const now = new Date()
          const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
          setDaysCount(Math.max(0, diff))
        }
      } catch (e) { /* silent */ }
    }
    fetchGardenMeta()
  }, [gardenId, user])

  const fetchRecords = useCallback(async () => {
    if (!gardenId) {
      setRecords([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await withTimeout(
        supabase
          .from('records')
          .select(`
            id,
            title,
            content,
            category,
            custom_tags,
            location_name,
            recorded_at,
            created_at,
            author_id,
            media (id, type, thumbnail_url, compressed_url, original_url, sort_order)
          `)
          .eq('garden_id', gardenId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false }),
        15000,
        '加载记录'
      )

      if (fetchError) throw fetchError

      // Fetch comment counts
      const recordIds = (data || []).map(r => r.id)
      let commentCounts = {}
      if (recordIds.length > 0) {
        const { data: comments } = await withTimeout(
          supabase
            .from('comments')
            .select('record_id')
            .in('record_id', recordIds),
          15000,
          '评论统计'
        )
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
        const { data: profiles } = await withTimeout(
          supabase
            .from('profiles')
            .select('id, nickname, email')
            .in('id', authorIds),
          15000,
          '作者信息'
        )
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
      }))

      setRecords(enriched)
    } catch (err) {
      console.error('Failed to fetch records:', err)
      setError(err.message || '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [gardenId])

  // Initial fetch on mount
  useEffect(() => {
    if (gardenId) fetchRecords()
  }, [gardenId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when navigating back to /feed from another page
  useEffect(() => {
    const prevPathname = prevPathnameRef.current
    const currentPathname = location.pathname

    if (currentPathname === '/feed' && prevPathname !== '/feed') {
      fetchRecords()
    }

    prevPathnameRef.current = currentPathname
  }, [location.pathname, fetchRecords])

  const filteredRecords = records.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false
    if (searchQuery && !r.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !r.content?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const isInitialLoad = loading && records.length === 0

  return (
    <div className="relative z-10 animate-page-enter">
      {/* Header */}
      <header className="sticky top-0 z-40 glass dark:glass-dark safe-top">
        <div className="flex items-center justify-between px-4 h-13">
          <h1 className="text-xl font-bold bg-gradient-to-r from-apricot-500 to-tulip-500 bg-clip-text text-transparent">
            TwoLyp
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-full transition-colors',
                isSearchOpen ? 'bg-apricot-100 dark:bg-dark-card text-apricot-500' : 'hover:bg-milk-200 dark:hover:bg-dark-card text-milk-600 dark:text-milk-400'
              )}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={fetchRecords}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
            >
              <RefreshCw className={cn("w-[18px] h-[18px] text-milk-600 dark:text-milk-400", loading && "animate-spin")} />
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
              className="w-full h-10 px-4 rounded-2xl bg-white dark:bg-dark-card text-sm text-milk-800 dark:text-milk-200 placeholder:text-milk-400 border border-milk-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-apricot-300 shadow-card transition-shadow"
            />
          </div>
        )}

        {/* Category tabs */}
        <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-all font-medium',
              activeCategory === 'all'
                ? 'gradient-coral text-white shadow-sm'
                : 'bg-white dark:bg-dark-card text-milk-600 dark:text-milk-400 border border-milk-200 dark:border-dark-border hover:border-apricot-200'
            )}
          >
            全部
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-all font-medium flex items-center gap-1',
                activeCategory === cat.id
                  ? 'gradient-coral text-white shadow-sm'
                  : 'bg-white dark:bg-dark-card text-milk-600 dark:text-milk-400 border border-milk-200 dark:border-dark-border hover:border-apricot-200'
              )}
            >
              <span className="text-xs">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Garden banner */}
      {garden && (
        <GardenBanner
          garden={garden}
          user={user}
          partnerName={partnerName}
          daysCount={daysCount}
        />
      )}

      {/* Skeleton loading state */}
      {isInitialLoad && !error && (
        <div className="card-grid pt-3 pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-tulip-50 dark:bg-dark-card flex items-center justify-center mb-4 shadow-card">
            <AlertCircle className="w-8 h-8 text-tulip-500" />
          </div>
          <h3 className="text-lg font-semibold text-milk-800 dark:text-milk-200">
            加载失败
          </h3>
          <p className="text-sm text-milk-500 dark:text-milk-400 mt-1.5 max-w-xs">
            {error}
          </p>
          <button
            onClick={fetchRecords}
            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-coral text-white text-sm font-medium glow-coral active:scale-[0.97] transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
        </div>
      )}

      {/* Masonry card grid */}
      {!isInitialLoad && !error && filteredRecords.length > 0 && (
        <div className="card-grid pt-3 pb-4">
          {filteredRecords.map((record, index) => (
            <div
              key={record.id}
              className="card-item animate-fade-in"
              style={{ animationDelay: `${Math.min(index, STAGGER_CAP - 1) * 0.04}s` }}
              onClick={() => navigate(`/record/${record.id}`)}
            >
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-dark-card shadow-card border border-milk-100/80 dark:border-dark-border cursor-pointer active:scale-[0.98] hover:shadow-card-hover transition-all duration-200">
                {/* Cover image */}
                {record.coverImage && (
                  <div className="relative overflow-hidden min-h-[120px] bg-milk-100 dark:bg-dark-surface">
                    <img
                      src={record.coverImage}
                      alt={record.title}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {/* Gradient overlay at bottom of image */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
                    {record.imageCount > 1 && (
                      <div className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                        {record.imageCount}张
                      </div>
                    )}
                  </div>
                )}

                {/* Card body */}
                <div className="p-3">
                  <h3 className="text-[13px] font-semibold text-milk-900 dark:text-milk-100 line-clamp-2 leading-snug">
                    {record.title || '无标题'}
                  </h3>
                  {record.content && (
                    <p className="text-xs text-milk-500 dark:text-milk-400 mt-1 line-clamp-2 leading-relaxed">
                      {record.content}
                    </p>
                  )}

                  {/* Tags */}
                  {record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {record.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-apricot-50 dark:bg-dark-border text-apricot-500 dark:text-apricot-400 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-milk-100 dark:border-dark-border/50">
                    <span className="text-[10px] text-milk-500 dark:text-milk-500 font-medium">
                      {record.author}
                    </span>
                    <div className="flex items-center gap-2">
                      {record.commentCount > 0 && (
                        <span className="text-[10px] text-apricot-400 font-medium">
                          {record.commentCount}评论
                        </span>
                      )}
                      <span className="text-[10px] text-milk-400 dark:text-milk-500">
                        {formatRelativeTime(record.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state — beautiful illustration */}
      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="animate-float">
            <GardenEmptyIllustration />
          </div>
          <h3 className="text-xl font-semibold text-milk-900 dark:text-milk-100 mt-2">
            花园还是空的
          </h3>
          <p className="text-sm text-milk-500 dark:text-milk-400 mt-2 max-w-[240px] leading-relaxed">
            记录你们的第一段回忆，让这座花园慢慢绽放
          </p>
          <button
            onClick={() => navigate('/create')}
            className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full gradient-coral text-white text-sm font-semibold glow-coral active:scale-[0.97] transition-transform"
          >
            <Plus className="w-5 h-5" />
            写下第一篇记录
          </button>
        </div>
      )}

      {/* Empty state — filtered results are empty */}
      {!loading && !error && records.length > 0 && filteredRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-apricot-50 dark:bg-dark-card flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-apricot-300" />
          </div>
          <h3 className="text-lg font-semibold text-milk-800 dark:text-milk-200">
            没有找到匹配的记录
          </h3>
          <p className="text-sm text-milk-500 dark:text-milk-400 mt-1.5">
            试试其他分类或关键词
          </p>
        </div>
      )}
    </div>
  )
}
