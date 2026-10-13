import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Plus, X, ChevronLeft, ChevronRight, Loader2, Trash2, Droplets, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, withTimeout } from '../lib/utils'

const PAIN_LEVELS = [
  { value: 0, emoji: '😊', label: '无痛' },
  { value: 1, emoji: '🙂', label: '轻微' },
  { value: 2, emoji: '😐', label: '中等' },
  { value: 3, emoji: '😣', label: '较重' },
  { value: 4, emoji: '😭', label: '严重' },
]

const FLOW_OPTIONS = [
  { value: 'light', label: '轻', icon: '💧' },
  { value: 'medium', label: '中', icon: '💧💧' },
  { value: 'heavy', label: '重', icon: '💧💧💧' },
]

const MOOD_OPTIONS = [
  { value: 'normal', emoji: '😌', label: '正常' },
  { value: 'sensitive', emoji: '🥺', label: '敏感' },
  { value: 'irritable', emoji: '😤', label: '烦躁' },
  { value: 'sad', emoji: '😢', label: '低落' },
  { value: 'anxious', emoji: '😰', label: '焦虑' },
]

const DEFAULT_FORM = {
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  pain: 0,
  flow: 'medium',
  mood: 'normal',
  notes: '',
}

export default function PeriodTrackerPage() {
  const navigate = useNavigate()
  const { user, gardenId } = useAuth()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({ ...DEFAULT_FORM })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Fetch period records
  useEffect(() => {
    if (!gardenId || !user) { setLoading(false); return }
    fetchRecords()
  }, [gardenId, user])

  async function fetchRecords() {
    try {
      setLoading(true)
      const { data, error: fetchError } = await withTimeout(
        supabase.from('records')
          .select('*')
          .eq('garden_id', gardenId)
          .eq('author_id', user.id)
          .eq('is_deleted', false)
          .contains('custom_tags', ['period'])
          .order('recorded_at', { ascending: false }),
        15000, '加载经期记录'
      )
      if (fetchError) throw fetchError
      setRecords((data || []).map(r => ({ ...r, parsed: safeParseJSON(r.content) })))
    } catch (e) {
      console.error('Failed to fetch period records:', e)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  function safeParseJSON(str) {
    try { return JSON.parse(str) } catch { return {} }
  }

  // Cycle prediction
  const cycleInfo = useMemo(() => {
    if (records.length === 0) return null

    const startDates = records
      .filter(r => r.parsed?.startDate)
      .map(r => new Date(r.parsed.startDate))
      .sort((a, b) => b - a)

    if (startDates.length < 2) {
      const last = startDates[0]
      return { lastStart: last, avgCycle: 28, nextPredicted: new Date(last.getTime() + 28 * 86400000), daysUntil: null }
    }

    const intervals = []
    for (let i = 0; i < startDates.length - 1; i++) {
      const diff = Math.round((startDates[i] - startDates[i + 1]) / 86400000)
      if (diff > 15 && diff < 60) intervals.push(diff)
    }

    const avgCycle = intervals.length > 0
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : 28

    const lastStart = startDates[0]
    const nextPredicted = new Date(lastStart.getTime() + avgCycle * 86400000)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const daysUntil = Math.ceil((nextPredicted - today) / 86400000)

    const lastEnd = records.find(r => r.parsed?.endDate)?.parsed.endDate
    const hasActive = records.some(r => r.parsed?.status === 'active')

    return { lastStart, avgCycle, nextPredicted, daysUntil, lastEnd, hasActive }
  }, [records])

  // Active period check
  const activeRecord = records.find(r => r.parsed?.status === 'active')

  // Quick actions
  async function handleQuickAction() {
    if (activeRecord) {
      // End current period
      try {
        const updated = { ...activeRecord.parsed, endDate: new Date().toISOString().slice(0, 10), status: 'ended' }
        await supabase.from('records').update({ content: JSON.stringify(updated) }).eq('id', activeRecord.id)
        fetchRecords()
      } catch (e) {
        setError('操作失败')
      }
    } else {
      // Start new period
      setFormData({ ...DEFAULT_FORM, startDate: new Date().toISOString().slice(0, 10), status: 'active' })
      setEditingRecord(null)
      setShowModal(true)
    }
  }

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay() // 0=Sun
    const days = []

    // Pad previous month days
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, isCurrentMonth: false })
    }
    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true })
    }
    // Pad next month
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    return days
  }, [currentMonth])

  function isPeriodDay(date) {
    const dateStr = date.toISOString().slice(0, 10)
    return records.some(r => {
      const s = r.parsed?.startDate
      const e = r.parsed?.endDate || s
      if (!s) return false
      return dateStr >= s && dateStr <= e
    })
  }

  function isPredictedDay(date) {
    if (!cycleInfo?.nextPredicted) return false
    const dateStr = date.toISOString().slice(0, 10)
    const predicted = cycleInfo.nextPredicted.toISOString().slice(0, 10)
    const predStart = new Date(cycleInfo.nextPredicted.getTime() - 2 * 86400000).toISOString().slice(0, 10)
    const predEnd = new Date(cycleInfo.nextPredicted.getTime() + 5 * 86400000).toISOString().slice(0, 10)
    return dateStr >= predStart && dateStr <= predEnd && dateStr >= new Date().toISOString().slice(0, 10)
  }

  function isToday(date) {
    return date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
  }

  // Save record
  async function handleSave() {
    if (!formData.startDate || !gardenId || !user) return
    setSaving(true); setError('')
    try {
      const content = JSON.stringify({
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        symptoms: { pain: formData.pain, flow: formData.flow, mood: formData.mood, notes: formData.notes },
        status: formData.endDate ? 'ended' : 'active',
      })

      if (editingRecord) {
        const { error: upErr } = await supabase.from('records').update({ content }).eq('id', editingRecord.id)
        if (upErr) throw upErr
      } else {
        const { error: insErr } = await supabase.from('records').insert({
          garden_id: gardenId,
          author_id: user.id,
          title: '经期记录',
          content,
          category: 'custom',
          custom_tags: ['period'],
          recorded_at: formData.startDate + 'T12:00:00',
        })
        if (insErr) throw insErr
      }

      setShowModal(false)
      setFormData({ ...DEFAULT_FORM })
      setEditingRecord(null)
      fetchRecords()
    } catch (e) {
      setError('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(record) {
    if (!confirm('确定删除这条记录吗？')) return
    try {
      await supabase.from('records').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', record.id)
      fetchRecords()
    } catch (e) {
      setError('删除失败')
    }
  }

  function openEdit(record) {
    const p = record.parsed || {}
    setFormData({
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      pain: p.symptoms?.pain || 0,
      flow: p.symptoms?.flow || 'medium',
      mood: p.symptoms?.mood || 'normal',
      notes: p.symptoms?.notes || '',
    })
    setEditingRecord(record)
    setShowModal(true)
  }

  function handleCloseModal() {
    if (saving) return
    setShowModal(false)
    setFormData({ ...DEFAULT_FORM })
    setEditingRecord(null)
    setError('')
  }

  const painLabel = (v) => PAIN_LEVELS.find(p => p.value === v) || PAIN_LEVELS[0]
  const moodLabel = (v) => MOOD_OPTIONS.find(m => m.value === v) || MOOD_OPTIONS[0]

  return (
    <div className="min-h-dvh bg-milk-50 dark:bg-dark-bg transition-theme animate-page-enter">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-dark-card/70 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <Calendar className="w-5 h-5 text-tulip-400" />
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">经期记录</h1>
        </div>
      </header>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Prediction banner */}
        {cycleInfo && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tulip-400 to-apricot-400 p-5 text-white shadow-lg shadow-tulip-400/20">
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute right-12 bottom-1 w-12 h-12 rounded-full bg-white/10" />
            <div className="relative">
              {cycleInfo.daysUntil !== null ? (
                <>
                  <p className="text-sm text-white/80">
                    {cycleInfo.daysUntil <= 0
                      ? '今天可能是经期'
                      : cycleInfo.daysUntil <= 7
                        ? `预计还有 ${cycleInfo.daysUntil} 天`
                        : `下次经期约 ${cycleInfo.daysUntil} 天后`
                    }
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    周期 {cycleInfo.avgCycle} <span className="text-base font-normal text-white/80">天</span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    上次经期：{cycleInfo.lastStart?.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-white/80">周期预测</p>
                  <p className="mt-1 text-base font-medium">记录更多周期后为你智能预测</p>
                  <p className="text-xs text-white/60 mt-1">至少需要 2 次记录</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick action */}
        <div className="flex gap-3">
          <button
            onClick={handleQuickAction}
            className={cn(
              'flex-1 py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98]',
              activeRecord
                ? 'bg-white dark:bg-dark-card border border-milk-200 dark:border-dark-border text-milk-700 dark:text-milk-300'
                : 'bg-gradient-to-r from-tulip-400 to-apricot-400 text-white shadow-md shadow-tulip-400/20'
            )}
          >
            {activeRecord ? '记录经期结束' : '记录经期开始'}
          </button>
          <button
            onClick={() => { setFormData({ ...DEFAULT_FORM }); setEditingRecord(null); setShowModal(true) }}
            className="w-12 h-12 rounded-xl bg-white dark:bg-dark-card border border-milk-200 dark:border-dark-border flex items-center justify-center text-milk-600 dark:text-milk-400 hover:border-tulip-300 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl bg-white dark:bg-dark-card border border-milk-100/80 dark:border-dark-border shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-milk-100/60 dark:border-dark-border/60">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
              <ChevronLeft className="w-4 h-4 text-milk-600 dark:text-milk-400" />
            </button>
            <span className="text-sm font-semibold text-milk-800 dark:text-milk-200">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
              <ChevronRight className="w-4 h-4 text-milk-600 dark:text-milk-400" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-2 pt-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center text-[10px] text-milk-400 dark:text-milk-500 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
            {calendarDays.map((day, i) => {
              const period = isPeriodDay(day.date)
              const predicted = isPredictedDay(day.date)
              const today = isToday(day.date)
              return (
                <div
                  key={i}
                  className={cn(
                    'relative flex items-center justify-center h-9 rounded-lg text-xs transition-all',
                    day.isCurrentMonth ? 'text-milk-700 dark:text-milk-300' : 'text-milk-300 dark:text-milk-600',
                    period && 'bg-tulip-100 dark:bg-tulip-900/30 text-tulip-600 dark:text-tulip-400 font-semibold',
                    predicted && !period && 'border border-dashed border-tulip-300/50 dark:border-tulip-600/30 text-tulip-400',
                    today && !period && 'ring-1 ring-apricot-300 dark:ring-apricot-600',
                  )}
                >
                  {day.date.getDate()}
                  {period && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-tulip-400" />}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 pb-3 text-[10px] text-milk-500 dark:text-milk-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-tulip-100 dark:bg-tulip-900/30" /> 经期</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border border-dashed border-tulip-300/50" /> 预计</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded ring-1 ring-apricot-300" /> 今天</span>
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-sm font-semibold text-milk-800 dark:text-milk-200 mb-2.5 px-1">历史记录</h2>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-tulip-400 animate-spin" /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-10">
              <Heart className="w-8 h-8 text-tulip-200 dark:text-tulip-800 mx-auto mb-2" />
              <p className="text-sm text-milk-400 dark:text-milk-500">还没有记录</p>
              <p className="text-xs text-milk-400 dark:text-milk-500 mt-0.5">点击上方按钮开始记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 10).map(record => {
                const p = record.parsed || {}
                const pl = painLabel(p.symptoms?.pain)
                const ml = moodLabel(p.symptoms?.mood)
                const duration = p.startDate && p.endDate
                  ? Math.ceil((new Date(p.endDate) - new Date(p.startDate)) / 86400000 + 1)
                  : null
                return (
                  <button
                    key={record.id}
                    onClick={() => openEdit(record)}
                    className="w-full text-left rounded-xl bg-white dark:bg-dark-card border border-milk-100/80 dark:border-dark-border p-3.5 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                          p.status === 'active'
                            ? 'bg-tulip-100 dark:bg-tulip-900/30 text-tulip-500'
                            : 'bg-milk-100 dark:bg-dark-surface text-milk-500'
                        )}>
                          {pl.emoji}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-milk-800 dark:text-milk-200">
                            {p.startDate?.slice(5)} {p.endDate ? `~ ${p.endDate.slice(5)}` : '(进行中)'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {duration && <span className="text-[10px] text-milk-500 dark:text-milk-400">{duration}天</span>}
                            {p.symptoms?.flow && (
                              <span className="text-[10px] text-milk-500 dark:text-milk-400 flex items-center gap-0.5">
                                <Droplets className="w-2.5 h-2.5" />
                                {FLOW_OPTIONS.find(f => f.value === p.symptoms.flow)?.label}
                              </span>
                            )}
                            <span className="text-[10px] text-milk-500 dark:text-milk-400">{ml.emoji} {ml.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(record) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-milk-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-milk-400" />
                      </div>
                    </div>
                    {p.symptoms?.notes && (
                      <p className="text-[11px] text-milk-500 dark:text-milk-400 mt-2 line-clamp-1">{p.symptoms.notes}</p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[85dvh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/20" />
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editingRecord ? '编辑记录' : '记录经期'}
              </h2>
              <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-1.5">开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-milk-800 dark:text-milk-200 focus:outline-none focus:ring-2 focus:ring-tulip-400/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-1.5">结束日期 <span className="text-milk-400 font-normal">(选填)</span></label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    min={formData.startDate}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-milk-800 dark:text-milk-200 focus:outline-none focus:ring-2 focus:ring-tulip-400/50"
                  />
                </div>
              </div>

              {/* Pain level */}
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-2">痛经程度</label>
                <div className="flex gap-2">
                  {PAIN_LEVELS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setFormData(prev => ({ ...prev, pain: p.value }))}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all',
                        formData.pain === p.value
                          ? 'bg-tulip-50 dark:bg-tulip-900/30 ring-2 ring-tulip-300 dark:ring-tulip-600 scale-105'
                          : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                      )}
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <span className="text-[9px] text-milk-600 dark:text-milk-400 font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flow */}
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-2">经量</label>
                <div className="flex gap-2">
                  {FLOW_OPTIONS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFormData(prev => ({ ...prev, flow: f.value }))}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm transition-all font-medium',
                        formData.flow === f.value
                          ? 'bg-tulip-50 dark:bg-tulip-900/30 text-tulip-600 dark:text-tulip-400 ring-2 ring-tulip-300 dark:ring-tulip-600'
                          : 'bg-gray-50 dark:bg-white/5 text-milk-600 dark:text-milk-400 hover:bg-gray-100 dark:hover:bg-white/10'
                      )}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-2">情绪状态</label>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setFormData(prev => ({ ...prev, mood: m.value }))}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all',
                        formData.mood === m.value
                          ? 'bg-apricot-50 dark:bg-apricot-900/30 ring-2 ring-apricot-300 dark:ring-apricot-600 scale-105'
                          : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                      )}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-[9px] text-milk-600 dark:text-milk-400 font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-1.5">备注 <span className="text-milk-400 font-normal">(选填)</span></label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="记录一下身体状况..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-milk-800 dark:text-milk-200 placeholder-milk-400 dark:placeholder-milk-600 focus:outline-none focus:ring-2 focus:ring-tulip-400/50 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="text-[11px] text-tulip-500 bg-tulip-50 dark:bg-tulip-900/20 px-3 py-2 rounded-xl">{error}</div>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!formData.startDate || saving}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold text-white text-sm transition-all',
                  'bg-gradient-to-r from-tulip-400 to-apricot-400 hover:shadow-lg hover:shadow-tulip-400/25 active:scale-[0.98]',
                  (!formData.startDate || saving) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {saving ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : editingRecord ? '保存修改' : '记录'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
