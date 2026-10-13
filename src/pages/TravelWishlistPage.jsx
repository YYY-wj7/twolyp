import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, MapPin, Check, Plane, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, withTimeout } from '../lib/utils'

const TRAVEL_EMOJIS = [
  '🏖️', '🗼', '🏔️', '🌸', '🎡', '🏯', '🌊', '🏝️',
  '🗿', '🎢', '⛩️', '🌋', '🏰', '🎪', '🚂', '🛳️',
  '🌅', '🎆', '🏕️', '🌿', '🦌', '🐚', '🧳', '📸',
]

const SEASONS = ['春季', '夏季', '秋季', '冬季', '四季皆宜']

const DEFAULT_FORM = { title: '', subtitle: '', emoji: '🏖️', bestSeason: '四季皆宜' }

export default function TravelWishlistPage() {
  const navigate = useNavigate()
  const { user, gardenId } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({ ...DEFAULT_FORM })
  const [saving, setSaving] = useState(false)

  // Fetch wishlist items
  useEffect(() => {
    if (!gardenId) { setLoading(false); return }
    fetchItems()
  }, [gardenId])

  async function fetchItems() {
    try {
      setLoading(true)
      const { data, error } = await withTimeout(
        supabase
          .from('records')
          .select('*')
          .eq('garden_id', gardenId)
          .eq('is_deleted', false)
          .eq('category', 'custom')
          .contains('custom_tags', ['wishlist'])
          .order('created_at', { ascending: false }),
        15000,
        '加载心愿单'
      )
      if (error) throw error
      setItems(data || [])
    } catch (e) {
      console.error('Failed to fetch wishlist:', e)
    } finally {
      setLoading(false)
    }
  }

  // Toggle visited status
  async function toggleStatus(item) {
    const newPinned = !item.is_pinned
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_pinned: newPinned } : i))
    try {
      await supabase.from('records').update({ is_pinned: newPinned }).eq('id', item.id)
    } catch (e) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_pinned: !newPinned } : i))
    }
  }

  // Add new destination
  async function handleSave() {
    if (!formData.title.trim() || !gardenId || !user) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('records')
        .insert({
          garden_id: gardenId,
          author_id: user.id,
          category: 'custom',
          custom_tags: ['wishlist'],
          title: formData.title.trim(),
          content: JSON.stringify({
            subtitle: formData.subtitle.trim(),
            emoji: formData.emoji,
            bestSeason: formData.bestSeason,
          }),
          is_pinned: false,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      setItems(prev => [data, ...prev])
      setFormData({ ...DEFAULT_FORM })
      setShowAddModal(false)
    } catch (e) {
      console.error('Failed to add wishlist item:', e)
    } finally {
      setSaving(false)
    }
  }

  const visitedCount = items.filter(i => i.is_pinned).length

  function parseContent(item) {
    try { return JSON.parse(item.content) } catch { return {} }
  }

  return (
    <div className="min-h-dvh bg-milk-50 dark:bg-dark-bg transition-theme animate-page-enter">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-dark-card/70 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <Plane className="w-5 h-5 text-coral-400" />
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">旅行心愿单</h1>
        </div>
      </header>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Summary card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coral-400 to-coral-500 p-4 text-white shadow-card">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute right-8 bottom-2 w-12 h-12 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">我们的旅行计划</p>
              <p className="mt-1 text-2xl font-bold">{items.length} <span className="text-base font-normal text-white/80">个目的地</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">已打卡</p>
              <p className="mt-1 text-2xl font-bold">{visitedCount} <span className="text-base font-normal text-white/80">个</span></p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-coral-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
                <circle cx="60" cy="60" r="50" fill="#FFE4E6" opacity="0.3" />
                <path d="M30 85C45 55 65 35 95 45" stroke="#F4728B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                <g transform="translate(90, 43) rotate(20)">
                  <path d="M0 0L-6 3L-2 0L-6-3Z" fill="#F4728B" opacity="0.7" />
                </g>
                <circle cx="45" cy="72" r="6" fill="#FECDD3" opacity="0.5" />
                <circle cx="65" cy="55" r="5" fill="#FDA4AF" opacity="0.4" />
                <path d="M60 68C60 68 52 62 52 58C52 55 55 54 57 55C58 56 60 58 60 58C60 58 62 56 63 55C65 54 68 55 68 58C68 62 60 68 60 68Z" fill="#FB7185" opacity="0.6" />
              </svg>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">写下你们想去的地方吧</p>
          </div>
        ) : (
          /* Grid of destination cards */
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => {
              const meta = parseContent(item)
              const visited = item.is_pinned
              return (
                <button
                  key={item.id}
                  onClick={() => toggleStatus(item)}
                  className={cn(
                    'shadow-card rounded-2xl bg-white dark:bg-dark-card p-4 text-left transition-all active:scale-[0.97]',
                    visited && 'ring-2 ring-green-300/50'
                  )}
                >
                  <div className="text-3xl mb-2">{meta.emoji || '📍'}</div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{item.title}</h3>
                  {meta.subtitle && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{meta.subtitle}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    {meta.bestSeason && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                        {meta.bestSeason}
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium',
                      visited
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-pink-50 dark:bg-pink-900/30 text-coral-500 dark:text-coral-400'
                    )}>
                      {visited && <Check className="w-3 h-3" />}
                      {visited ? '已去' : '想去'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 text-white shadow-lg shadow-coral-400/30 flex items-center justify-center active:scale-95 transition-transform z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom sheet modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl p-6 pb-8 animate-slide-up">
            {/* Close handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/20" />
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">添加目的地</h2>
              <button onClick={() => !saving && setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Destination name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">目的地名称</label>
                <input
                  type="text"
                  placeholder="例如：京都"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-coral-400/50 text-sm"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">描述 <span className="text-gray-400 font-normal">(选填)</span></label>
                <input
                  type="text"
                  placeholder="例如：看樱花、吃抹茶"
                  value={formData.subtitle}
                  onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-coral-400/50 text-sm"
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">选择图标</label>
                <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  {TRAVEL_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setFormData(p => ({ ...p, emoji: e }))}
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center text-lg transition',
                        formData.emoji === e
                          ? 'bg-coral-100 dark:bg-coral-900/40 ring-2 ring-coral-400 scale-110'
                          : 'hover:bg-gray-100 dark:hover:bg-white/10'
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Season selector */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">最佳季节</label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setFormData(p => ({ ...p, bestSeason: s }))}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition',
                        formData.bestSeason === s
                          ? 'bg-coral-400 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || saving}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold text-white text-sm transition-all',
                  'bg-gradient-to-r from-coral-400 to-coral-500 hover:shadow-lg hover:shadow-coral-400/25 active:scale-[0.98]',
                  (!formData.title.trim() || saving) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {saving ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
