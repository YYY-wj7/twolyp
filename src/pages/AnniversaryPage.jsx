import { useState, useEffect } from 'react'
import { Heart, Plus, Calendar, Gift, Sparkles } from 'lucide-react'
import { cn, daysTogether, formatDateShort, withTimeout } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

/* SVG illustration for empty anniversary state */
function EmptyAnniversaryIllustration() {
  return (
    <svg viewBox="0 0 140 140" className="w-32 h-32" fill="none">
      <circle cx="70" cy="70" r="60" fill="url(#annBg)" opacity="0.15" />
      {/* Calendar */}
      <rect x="38" y="45" width="64" height="55" rx="10" fill="white" stroke="#FECDD3" strokeWidth="1.5" />
      <rect x="38" y="45" width="64" height="16" rx="10" fill="#F4728B" opacity="0.8" />
      <line x1="52" y1="40" x2="52" y2="52" stroke="#F4728B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="88" y1="40" x2="88" y2="52" stroke="#F4728B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Heart on calendar */}
      <path d="M70 82C70 82 58 74 58 68C58 64 62 62 65 64C67 65 70 68 70 68C70 68 73 65 75 64C78 62 82 64 82 68C82 74 70 82 70 82Z" fill="#FB7185" opacity="0.7" />
      {/* Sparkles */}
      <circle cx="32" cy="38" r="2" fill="#FECDD3" opacity="0.6" />
      <circle cx="110" cy="42" r="1.5" fill="#FDA4AF" opacity="0.5" />
      <circle cx="28" cy="85" r="1.2" fill="#FB7185" opacity="0.4" />
      <circle cx="115" cy="78" r="1.8" fill="#FECDD3" opacity="0.5" />
      <defs>
        <radialGradient id="annBg">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="100%" stopColor="#FFFAFA" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export default function AnniversaryPage() {
  const { gardenId } = useAuth()
  const [anniversaries, setAnniversaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!gardenId) {
      setLoading(false)
      return
    }
    fetchAnniversaries()
  }, [gardenId])

  async function fetchAnniversaries() {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await withTimeout(
        supabase
          .from('anniversaries')
          .select('*')
          .eq('garden_id', gardenId)
          .order('date'),
        15000,
        '加载纪念日'
      )
      if (fetchError) throw fetchError
      if (data) setAnniversaries(data)
    } catch (e) {
      setError(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAnniversary() {
    if (!newTitle.trim() || !newDate || !gardenId) return
    setSaving(true)
    setError('')
    try {
      const { error: insertError } = await withTimeout(
        supabase
          .from('anniversaries')
          .insert({
            garden_id: gardenId,
            title: newTitle.trim(),
            date: newDate,
          }),
        15000,
        '保存纪念日'
      )
      if (insertError) throw insertError
      setNewTitle('')
      setNewDate('')
      setShowAddModal(false)
      await fetchAnniversaries()
    } catch (e) {
      setError(e.message || '保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const mainAnniversary = anniversaries.length > 0 ? anniversaries[0] : null

  function formatDateCN(dateStr) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 至今`
  }

  return (
    <div className="relative z-10 animate-page-enter">
      <header className="sticky top-0 z-40 glass dark:glass-dark safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-apricot-400 fill-apricot-400" />
            <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
              纪念日
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
          >
            <Plus className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-tulip-50 dark:bg-tulip-900/20 text-sm text-tulip-600 dark:text-tulip-400 border border-tulip-100 dark:border-tulip-800/30">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-apricot-300 border-t-apricot-500 rounded-full animate-spin" />
            <span className="text-sm text-milk-500 dark:text-milk-400">加载中...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main anniversary hero card */}
          {mainAnniversary && (
            <div className="mx-4 mt-2 rounded-2xl overflow-hidden shadow-lg">
              <div className="gradient-hero p-6 text-white relative">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute bottom-2 left-6 w-10 h-10 rounded-full bg-white/8" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                    <span className="text-sm font-medium opacity-90">{mainAnniversary.title}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{daysTogether(mainAnniversary.date)}</span>
                    <span className="text-lg opacity-80 font-medium">天</span>
                  </div>
                  <p className="text-xs opacity-70 mt-2 font-medium">
                    {formatDateCN(mainAnniversary.date)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Anniversary list */}
          <div className="px-4 mt-5 pb-4">
            {anniversaries.length > 0 ? (
              <>
                <h2 className="text-sm font-semibold text-milk-700 dark:text-milk-300 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-apricot-400" />
                  我们的纪念日
                </h2>
                <div className="space-y-2">
                  {anniversaries.map((ann, index) => {
                    const days = daysTogether(ann.date)
                    const isMain = index === 0
                    return (
                      <div
                        key={ann.id}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card animate-fade-in"
                        style={{ animationDelay: `${index * 0.06}s` }}
                      >
                        <div className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                          isMain ? 'gradient-coral shadow-sm' : 'bg-apricot-50 dark:bg-dark-border'
                        )}>
                          {isMain ? (
                            <Heart className="w-5 h-5 text-white fill-white" />
                          ) : (
                            <Gift className="w-5 h-5 text-apricot-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-milk-900 dark:text-milk-100">
                            {ann.title}
                          </span>
                          <p className="text-xs text-milk-500 dark:text-milk-400 mt-0.5">
                            {formatDateShort(ann.date)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn(
                            'text-xl font-bold',
                            isMain ? 'text-apricot-500' : 'text-milk-700 dark:text-milk-300'
                          )}>
                            {days}
                          </span>
                          <p className="text-[10px] text-milk-400 font-medium">天</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-float">
                  <EmptyAnniversaryIllustration />
                </div>
                <h3 className="text-lg font-semibold text-milk-900 dark:text-milk-100 mt-2">
                  还没有纪念日
                </h3>
                <p className="text-sm text-milk-500 dark:text-milk-400 mt-1.5 max-w-[220px] leading-relaxed">
                  添加你们的第一个纪念日，让每一天都变得有意义
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-coral text-white text-sm font-medium glow-coral active:scale-[0.97] transition-transform"
                >
                  <Plus className="w-4 h-4" />
                  添加纪念日
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add anniversary modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !saving && setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl p-6 pb-8 animate-slide-up shadow-2xl">
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full bg-milk-300 dark:bg-dark-border mx-auto mb-4" />

            <h3 className="text-lg font-bold text-milk-900 dark:text-milk-100 mb-5">
              添加纪念日
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-1.5 uppercase tracking-wider">
                  标题
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：在一起、第一次旅行..."
                  className="w-full px-4 py-3 rounded-xl bg-milk-50 dark:bg-dark-bg border border-milk-200 dark:border-dark-border text-sm text-milk-900 dark:text-milk-100 placeholder:text-milk-400 outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-200/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-1.5 uppercase tracking-wider">
                  日期
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-milk-50 dark:bg-dark-bg border border-milk-200 dark:border-dark-border text-sm text-milk-900 dark:text-milk-100 outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-200/30 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => !saving && setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-milk-200 dark:border-dark-border text-sm font-medium text-milk-600 dark:text-milk-400 active:scale-95 transition-transform"
              >
                取消
              </button>
              <button
                onClick={handleAddAnniversary}
                disabled={!newTitle.trim() || !newDate || saving}
                className="flex-1 py-3 rounded-xl gradient-coral text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
