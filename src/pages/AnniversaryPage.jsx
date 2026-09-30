import { useState, useEffect } from 'react'
import { Heart, Plus, Calendar, Gift } from 'lucide-react'
import { cn, daysTogether } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

export default function AnniversaryPage() {
  const { gardenId } = useAuth()
  const [anniversaries, setAnniversaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!gardenId) {
      setLoading(false)
      return
    }
    fetchAnniversaries()
  }, [gardenId])

  async function fetchAnniversaries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('anniversaries')
      .select('*')
      .eq('garden_id', gardenId)
      .order('date')

    if (!error && data) {
      setAnniversaries(data)
    }
    setLoading(false)
  }

  async function handleAddAnniversary() {
    if (!newTitle.trim() || !newDate || !gardenId) return
    setSaving(true)
    const { error } = await supabase
      .from('anniversaries')
      .insert({
        garden_id: gardenId,
        title: newTitle.trim(),
        date: newDate,
        is_lunar: false,
      })

    if (!error) {
      setNewTitle('')
      setNewDate('')
      setShowAddModal(false)
      fetchAnniversaries()
    }
    setSaving(false)
  }

  // The first (earliest) anniversary for the main card
  const mainAnniversary = anniversaries.length > 0 ? anniversaries[0] : null

  function formatDateCN(dateStr) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 至今`
  }

  return (
    <div className="relative z-10">
      <header className="sticky top-0 z-40 bg-milk-50/80 dark:bg-dark-bg/80 backdrop-blur-xl safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            纪念日
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
          >
            <Plus className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-apricot-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Main anniversary card */}
          {mainAnniversary && (
            <div className="mx-4 mt-2 p-6 rounded-2xl bg-gradient-to-br from-apricot-300 via-tulip-300 to-apricot-400 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 fill-white" />
                <span className="text-sm font-medium opacity-90">{mainAnniversary.title}</span>
              </div>
              <div className="text-5xl font-bold mb-2">
                {daysTogether(mainAnniversary.date)}
              </div>
              <p className="text-sm opacity-80">天</p>
              <p className="text-xs opacity-70 mt-2">
                {formatDateCN(mainAnniversary.date)}
              </p>
            </div>
          )}

          {/* Anniversary list */}
          <div className="px-4 mt-6 pb-4">
            <h2 className="text-sm font-medium text-milk-700 dark:text-milk-300 mb-3">
              我们的纪念日
            </h2>
            <div className="space-y-2">
              {anniversaries.map((ann, index) => {
                const days = daysTogether(ann.date)
                const isMain = index === 0
                return (
                  <div
                    key={ann.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border"
                  >
                    <div className="w-10 h-10 rounded-xl bg-tulip-50 dark:bg-dark-border flex items-center justify-center">
                      {isMain ? (
                        <Heart className="w-5 h-5 text-tulip-500" />
                      ) : (
                        <Gift className="w-5 h-5 text-apricot-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-milk-900 dark:text-milk-100">
                        {ann.title}
                      </span>
                      <p className="text-xs text-milk-500 dark:text-milk-400 mt-0.5">
                        {ann.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-apricot-500">{days}</span>
                      <p className="text-xs text-milk-400">天</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {anniversaries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="w-12 h-12 text-milk-300 dark:text-milk-600 mb-3" />
                <p className="text-sm text-milk-500 dark:text-milk-400">还没有纪念日</p>
                <p className="text-xs text-milk-400 mt-1">点击右上角 + 添加你们的第一个纪念日吧</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add anniversary modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-2xl p-6 pb-8 animate-slide-up">
            <h3 className="text-lg font-semibold text-milk-900 dark:text-milk-100 mb-5">
              添加纪念日
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-milk-600 dark:text-milk-400 mb-1.5">
                  标题
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：在一起、第一次旅行..."
                  className="w-full px-3 py-2.5 rounded-xl bg-milk-50 dark:bg-dark-bg border border-milk-200 dark:border-dark-border text-sm text-milk-900 dark:text-milk-100 placeholder:text-milk-400 outline-none focus:border-apricot-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-milk-600 dark:text-milk-400 mb-1.5">
                  日期
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-milk-50 dark:bg-dark-bg border border-milk-200 dark:border-dark-border text-sm text-milk-900 dark:text-milk-100 outline-none focus:border-apricot-400 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => !saving && setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-milk-200 dark:border-dark-border text-sm text-milk-600 dark:text-milk-400 active:scale-95 transition-transform"
              >
                取消
              </button>
              <button
                onClick={handleAddAnniversary}
                disabled={!newTitle.trim() || !newDate || saving}
                className="flex-1 py-2.5 rounded-xl bg-apricot-400 text-white text-sm font-medium active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
