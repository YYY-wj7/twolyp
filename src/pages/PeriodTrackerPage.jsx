import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, X, Loader2, Droplets, Edit3, Trash2, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, withTimeout } from '../lib/utils'

/* helpers */

function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISO(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(date, n) {
  const r = new Date(date)
  r.setDate(r.getDate() + n)
  return r
}

function daysBetweenInclusive(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / 86400000) + 1
}

function daysFromToday(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = parseISO(dateStr); target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

function fmtDateCN(dateStr) {
  if (!dateStr) return '\u2014'
  const d = parseISO(dateStr)
  return `${d.getMonth() + 1}\u6708${d.getDate()}\u65e5`
}

function fmtMonthCN(year, month) {
  return `${year}\u5e74${month + 1}\u6708`
}

function parseContent(record) {
  try { return JSON.parse(record.content) } catch { return {} }
}

/* constants */

const PAIN_LABELS = [
  { value: 0, emoji: '\ud83d\ude0a', text: '\u65e0\u75db' },
  { value: 1, emoji: '\ud83d\ude42', text: '\u8f7b\u5fae' },
  { value: 2, emoji: '\ud83d\ude10', text: '\u4e2d\u7b49' },
  { value: 3, emoji: '\ud83d\ude23', text: '\u8f83\u91cd' },
  { value: 4, emoji: '\ud83d\ude2d', text: '\u4e25\u91cd' },
]

const FLOW_OPTIONS = [
  { value: 'light', label: '\u8f7b', drops: 1 },
  { value: 'medium', label: '\u4e2d', drops: 2 },
  { value: 'heavy', label: '\u91cd', drops: 3 },
]

const MOOD_OPTIONS = [
  { value: 'normal', emoji: '\ud83d\ude0c', text: '\u6b63\u5e38' },
  { value: 'sensitive', emoji: '\ud83e\udd7a', text: '\u654f\u611f' },
  { value: 'irritable', emoji: '\ud83d\ude24', text: '\u70e6\u8e81' },
  { value: 'sad', emoji: '\ud83d\ude22', text: '\u4f4e\u843d' },
  { value: 'anxious', emoji: '\ud83d\ude30', text: '\u7126\u8651' },
]

const WEEKDAYS = ['\u65e5', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d']

const DEFAULT_FORM = {
  startDate: toISO(new Date()),
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
  const [error, setError] = useState('')
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ ...DEFAULT_FORM })
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  /* fetch */

  const fetchRecords = useCallback(async () => {
    if (!gardenId) { setLoading(false); return }
    try {
      setLoading(true)
      setError('')
      const { data, error: fetchErr } = await withTimeout(
        supabase
          .from('records')
          .select('*')
          .eq('garden_id', gardenId)
          .eq('is_deleted', false)
          .eq('category', 'custom')
          .contains('custom_tags', ['period'])
          .order('recorded_at', { ascending: false }),
        15000,
        '\u52a0\u8f7d\u7ecf\u671f\u8bb0\u5f55'
      )
      if (fetchErr) throw fetchErr
      setRecords(data || [])
    } catch (e) {
      console.error('Failed to fetch period records:', e)
      setError(e.message || '\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u4e0b\u62c9\u91cd\u8bd5')
    } finally {
      setLoading(false)
    }
  }, [gardenId])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  /* derived data */

  const sortedCycles = useMemo(() => {
    return records
      .map(r => ({ ...r, parsed: parseContent(r) }))
      .filter(r => r.parsed.startDate)
      .sort((a, b) => b.parsed.startDate.localeCompare(a.parsed.startDate))
  }, [records])

  const activePeriod = useMemo(() => {
    return sortedCycles.find(c => c.parsed.status === 'active') || null
  }, [sortedCycles])

  const endedCycles = useMemo(() => {
    return sortedCycles.filter(c => c.parsed.status === 'ended' && c.parsed.startDate && c.parsed.endDate)
  }, [sortedCycles])

  const avgCycleLength = useMemo(() => {
    const starts = endedCycles.map(c => c.parsed.startDate).sort((a, b) => b.localeCompare(a))
    if (starts.length < 2) return null
    const lengths = []
    for (let i = 0; i < Math.min(starts.length - 1, 3); i++) {
      const diff = Math.round((parseISO(starts[i]) - parseISO(starts[i + 1])) / 86400000)
      if (diff > 15 && diff < 60) lengths.push(diff)
    }
    if (lengths.length === 0) return null
    return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
  }, [endedCycles])

  const avgPeriodDuration = useMemo(() => {
    const durations = endedCycles
      .filter(c => c.parsed.startDate && c.parsed.endDate)
      .map(c => Math.round((parseISO(c.parsed.endDate) - parseISO(c.parsed.startDate)) / 86400000) + 1)
      .filter(d => d > 0 && d < 15)
    if (durations.length === 0) return 5
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
  }, [endedCycles])

  const prediction = useMemo(() => {
    if (!avgCycleLength || endedCycles.length === 0) return null
    const lastStart = endedCycles[0].parsed.startDate
    const predictedStart = addDays(parseISO(lastStart), avgCycleLength)
    const predictedEnd = addDays(predictedStart, avgPeriodDuration - 1)
    const countdown = daysFromToday(toISO(predictedStart))
    return { nextStart: toISO(predictedStart), nextEnd: toISO(predictedEnd), countdown, cycleLength: avgCycleLength }
  }, [avgCycleLength, avgPeriodDuration, endedCycles])

  const periodDays = useMemo(() => {
    const set = new Set()
    for (const c of sortedCycles) {
      const { startDate, endDate } = c.parsed
      if (!startDate) continue
      const end = endDate ? parseISO(endDate) : addDays(parseISO(startDate), 4)
      let cur = parseISO(startDate)
      while (cur <= end) { set.add(toISO(cur)); cur = addDays(cur, 1) }
    }
    return set
  }, [sortedCycles])

  const predictedDays = useMemo(() => {
    const set = new Set()
    if (!prediction) return set
    let cur = parseISO(prediction.nextStart)
    const end = parseISO(prediction.nextEnd)
    while (cur <= end) {
      const iso = toISO(cur)
      if (!periodDays.has(iso)) set.add(iso)
      cur = addDays(cur, 1)
    }
    return set
  }, [prediction, periodDays])

  /* calendar */

  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({ day: d, dateStr })
    }
    return cells
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  /* quick log */

  async function handleQuickLog() {
    if (!gardenId || !user) return
    if (activePeriod) {
      const today = toISO(new Date())
      setSaving(true)
      try {
        const updatedContent = { ...activePeriod.parsed, endDate: today, status: 'ended' }
        const { error: updateErr } = await withTimeout(
          supabase.from('records').update({ content: JSON.stringify(updatedContent) }).eq('id', activePeriod.id),
          12000, '\u66f4\u65b0\u7ecf\u671f'
        )
        if (updateErr) throw updateErr
        setRecords(prev => prev.map(r => r.id === activePeriod.id ? { ...r, content: JSON.stringify(updatedContent) } : r))
      } catch (e) { setError('\u66f4\u65b0\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5') }
      finally { setSaving(false) }
    } else { openModal() }
  }

  /* modal */

  function openModal(recordToEdit = null) {
    if (recordToEdit) {
      const p = parseContent(recordToEdit)
      setEditingId(recordToEdit.id)
      setFormData({
        startDate: p.startDate || toISO(new Date()), endDate: p.endDate || '',
        pain: p.symptoms?.pain ?? 0, flow: p.symptoms?.flow || 'medium',
        mood: p.symptoms?.mood || 'normal', notes: p.symptoms?.notes || '',
      })
    } else {
      setEditingId(null)
      setFormData({ ...DEFAULT_FORM, startDate: toISO(new Date()) })
    }
    setShowModal(true)
  }

  function closeModal() {
    if (saving) return
    setShowModal(false); setEditingId(null); setFormData({ ...DEFAULT_FORM })
  }

  async function handleSave() {
    if (!formData.startDate || !gardenId || !user) return
    setSaving(true); setError('')
    const contentObj = {
      startDate: formData.startDate, endDate: formData.endDate || null,
      symptoms: { pain: formData.pain, flow: formData.flow, mood: formData.mood, notes: formData.notes },
      status: formData.endDate ? 'ended' : 'active',
    }
    try {
      if (editingId) {
        const { error: updateErr } = await withTimeout(
          supabase.from('records').update({ content: JSON.stringify(contentObj) }).eq('id', editingId),
          12000, '\u4fdd\u5b58\u7ecf\u671f\u8bb0\u5f55'
        )
        if (updateErr) throw updateErr
        setRecords(prev => prev.map(r => r.id === editingId ? { ...r, content: JSON.stringify(contentObj) } : r))
      } else {
        const { data: inserted, error: insertErr } = await withTimeout(
          supabase.from('records').insert({
            garden_id: gardenId, author_id: user.id, category: 'custom',
            custom_tags: ['period'], title: `\u7ecf\u671f ${fmtDateCN(formData.startDate)}`,
            content: JSON.stringify(contentObj), is_pinned: false,
            recorded_at: new Date(formData.startDate).toISOString(),
          }).select().single(),
          12000, '\u6dfb\u52a0\u7ecf\u671f\u8bb0\u5f55'
        )
        if (insertErr) throw insertErr
        if (inserted) setRecords(prev => [inserted, ...prev])
      }
      closeModal()
    } catch (e) {
      console.error('Save failed:', e)
      setError(e.message || '\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5')
    } finally { setSaving(false) }
  }

  /* delete */

  async function handleDelete(record) {
    if (!confirm('\u786e\u5b9a\u5220\u9664\u8fd9\u6761\u7ecf\u671f\u8bb0\u5f55\u5417\uff1f')) return
    try {
      await withTimeout(
        supabase.from('records').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', record.id),
        12000, '\u5220\u9664\u7ecf\u671f\u8bb0\u5f55'
      )
      setRecords(prev => prev.filter(r => r.id !== record.id))
      setExpandedId(null)
    } catch (e) { setError('\u5220\u9664\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5') }
  }

  /* render */

  return (
    <div className="min-h-dvh bg-milk-50 dark:bg-dark-bg transition-theme animate-page-enter">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-dark-card/70 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold text-milk-900 dark:text-milk-100">{'\u7ecf\u671f\u8bb0\u5f55'}</h1>
          <div className="ml-auto"><Calendar className="w-5 h-5 text-coral-400" /></div>
        </div>
      </header>

      <div className="px-4 pt-4 pb-28 space-y-5">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 animate-fade-in">
            <span className="text-xs text-red-500 dark:text-red-400 flex-1">{error}</span>
            <button onClick={() => setError('')} className="p-0.5"><X className="w-3.5 h-3.5 text-red-400" /></button>
          </div>
        )}

        {/* Prediction banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-apricot-400 to-coral-500 p-5 text-white shadow-card">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute right-10 bottom-0 w-14 h-14 rounded-full bg-white/10" />
          <div className="relative">
            {prediction ? (
              <>
                <p className="text-sm text-white/80 font-medium">{'\u4e0b\u6b21\u7ecf\u671f\u9884\u6d4b'}</p>
                <p className="mt-1.5 text-2xl font-bold">{fmtDateCN(prediction.nextStart)}</p>
                <div className="mt-2 flex items-center gap-3">
                  {prediction.countdown > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-sm font-medium">{'\u8fd8\u6709'} {prediction.countdown} {'\u5929'}</span>
                  ) : prediction.countdown === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/25 text-sm font-semibold">{'\u9884\u8ba1\u4eca\u5929'}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-sm font-medium">{'\u5df2\u8fc7'} {Math.abs(prediction.countdown)} {'\u5929'}</span>
                  )}
                  <span className="text-xs text-white/70">{'\u5e73\u5747\u5468\u671f'} {prediction.cycleLength} {'\u5929'}</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-white/80 font-medium">{'\u7ecf\u671f\u9884\u6d4b'}</p>
                <p className="mt-1.5 text-lg font-semibold">{'\u8bb0\u5f55\u66f4\u591a\u5468\u671f\u540e\u4e3a\u4f60\u9884\u6d4b'}</p>
                <p className="mt-1 text-xs text-white/60">{'\u81f3\u5c11\u9700\u8981 2 \u6b21\u5b8c\u6574\u7ecf\u671f\u8bb0\u5f55'}</p>
              </>
            )}
          </div>
        </div>

        {/* Quick log button */}
        <button
          onClick={handleQuickLog}
          disabled={saving}
          className={cn(
            'w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] shadow-card',
            activePeriod
              ? 'bg-white dark:bg-dark-card text-coral-500 dark:text-coral-400 border border-coral-200 dark:border-coral-800/40'
              : 'bg-gradient-to-r from-apricot-400 to-coral-500 text-white hover:shadow-lg hover:shadow-coral-400/25',
            saving && 'opacity-60 cursor-not-allowed'
          )}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mx-auto animate-spin" />
          ) : activePeriod ? (
            '\u8bb0\u5f55\u7ecf\u671f\u7ed3\u675f'
          ) : (
            <span className="inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> {'\u8bb0\u5f55\u7ecf\u671f\u5f00\u59cb'}</span>
          )}
        </button>

        {/* Calendar */}
        <div className="rounded-2xl bg-white dark:bg-dark-card shadow-card border border-milk-100 dark:border-dark-border p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
              <ChevronLeft className="w-5 h-5 text-milk-500 dark:text-milk-400" />
            </button>
            <h3 className="text-sm font-semibold text-milk-900 dark:text-milk-100">{fmtMonthCN(viewYear, viewMonth)}</h3>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
              <ChevronRight className="w-5 h-5 text-milk-500 dark:text-milk-400" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-center text-[11px] font-medium text-milk-400 dark:text-milk-500 py-1">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {calendarGrid.map((cell, i) => {
              if (!cell) return <div key={`e-${i}`} />
              const isPeriod = periodDays.has(cell.dateStr)
              const isPredicted = predictedDays.has(cell.dateStr)
              const isToday = cell.dateStr === toISO(new Date())
              return (
                <div key={cell.dateStr} className="flex items-center justify-center py-1">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all',
                    isPeriod && 'bg-gradient-to-br from-coral-400 to-coral-500 text-white font-semibold shadow-sm shadow-coral-300/30 dark:shadow-coral-800/30',
                    isPredicted && !isPeriod && 'border-2 border-dashed border-coral-300 dark:border-coral-600 text-coral-400 dark:text-coral-500 font-medium',
                    !isPeriod && !isPredicted && 'text-milk-700 dark:text-milk-300',
                    isToday && !isPeriod && 'ring-2 ring-apricot-300 dark:ring-apricot-600 font-semibold',
                  )}>{cell.day}</div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-milk-100 dark:border-dark-border">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-coral-400 to-coral-500" />
              <span className="text-[11px] text-milk-500 dark:text-milk-400">{'\u7ecf\u671f'}</span>
            </div>
            {prediction && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-coral-300 dark:border-coral-600" />
                <span className="text-[11px] text-milk-500 dark:text-milk-400">{'\u9884\u6d4b'}</span>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-sm font-semibold text-milk-900 dark:text-milk-100 mb-3 px-1">{'\u5386\u53f2\u8bb0\u5f55'}</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-coral-400 animate-spin" /></div>
          ) : sortedCycles.length === 0 ? (
            <div className="flex flex-col items-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-coral-50 dark:bg-coral-900/20 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-coral-300 dark:text-coral-600" />
              </div>
              <p className="text-sm text-milk-400 dark:text-milk-500">{'\u8fd8\u6ca1\u6709\u7ecf\u671f\u8bb0\u5f55'}</p>
              <p className="text-xs text-milk-400/70 dark:text-milk-500/70">{'\u70b9\u51fb\u4e0a\u65b9\u6309\u94ae\u5f00\u59cb\u8bb0\u5f55'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCycles.map(cycle => {
                const p = cycle.parsed
                const duration = p.startDate && p.endDate ? daysBetweenInclusive(p.startDate, p.endDate) : p.startDate ? '\u8fdb\u884c\u4e2d' : '\u2014'
                const isExpanded = expandedId === cycle.id
                const painInfo = PAIN_LABELS.find(l => l.value === (p.symptoms?.pain ?? 0))
                const flowInfo = FLOW_OPTIONS.find(f => f.value === p.symptoms?.flow)
                const moodInfo = MOOD_OPTIONS.find(m => m.value === p.symptoms?.mood)

                return (
                  <div key={cycle.id} className="rounded-2xl bg-white dark:bg-dark-card shadow-card border border-milk-100 dark:border-dark-border overflow-hidden transition-all">
                    <button onClick={() => setExpandedId(isExpanded ? null : cycle.id)} className="w-full p-4 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            p.status === 'active' ? 'bg-gradient-to-br from-coral-400 to-coral-500 text-white' : 'bg-coral-50 dark:bg-coral-900/20 text-coral-400'
                          )}><Droplets className="w-5 h-5" /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-milk-900 dark:text-milk-100 truncate">
                              {fmtDateCN(p.startDate)}{p.endDate ? ` \u2014 ${fmtDateCN(p.endDate)}` : ' \u2014 \u8fdb\u884c\u4e2d'}
                            </p>
                            <p className="text-xs text-milk-500 dark:text-milk-400 mt-0.5">
                              {typeof duration === 'number' ? `${duration} \u5929` : duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {painInfo && (p.symptoms?.pain ?? 0) > 0 && <span className="text-sm" title={painInfo.text}>{painInfo.emoji}</span>}
                          {flowInfo && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-coral-50 dark:bg-coral-900/20 text-coral-500 dark:text-coral-400 font-medium">{flowInfo.label}</span>
                          )}
                          <ChevronRight className={cn('w-4 h-4 text-milk-400 transition-transform', isExpanded && 'rotate-90')} />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-milk-100 dark:border-dark-border pt-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-milk-50 dark:bg-white/5 p-2.5 text-center">
                            <p className="text-lg">{painInfo?.emoji || '\ud83d\ude0a'}</p>
                            <p className="text-[11px] text-milk-500 dark:text-milk-400 mt-0.5">{painInfo?.text || '\u65e0\u75db'}</p>
                          </div>
                          <div className="rounded-xl bg-milk-50 dark:bg-white/5 p-2.5 text-center">
                            <p className="text-sm font-medium text-coral-500 dark:text-coral-400">{'\ud83d\udca7'.repeat(flowInfo?.drops || 1)}</p>
                            <p className="text-[11px] text-milk-500 dark:text-milk-400 mt-0.5">{flowInfo?.label || '\u4e2d'}</p>
                          </div>
                          <div className="rounded-xl bg-milk-50 dark:bg-white/5 p-2.5 text-center">
                            <p className="text-lg">{moodInfo?.emoji || '\ud83d\ude0c'}</p>
                            <p className="text-[11px] text-milk-500 dark:text-milk-400 mt-0.5">{moodInfo?.text || '\u6b63\u5e38'}</p>
                          </div>
                        </div>
                        {p.symptoms?.notes && (
                          <div className="rounded-xl bg-milk-50 dark:bg-white/5 px-3 py-2.5">
                            <p className="text-xs text-milk-500 dark:text-milk-400">{'\u5907\u6ce8'}</p>
                            <p className="text-sm text-milk-800 dark:text-milk-200 mt-0.5">{p.symptoms.notes}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={() => openModal(cycle)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-milk-50 dark:bg-white/5 text-sm text-milk-700 dark:text-milk-300 hover:bg-milk-100 dark:hover:bg-white/10 transition">
                            <Edit3 className="w-3.5 h-3.5" /> {'\u7f16\u8f91'}
                          </button>
                          <button onClick={() => handleDelete(cycle)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-sm text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition">
                            <Trash2 className="w-3.5 h-3.5" /> {'\u5220\u9664'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating add button */}
      <button
        onClick={() => openModal()}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-apricot-400 to-coral-500 text-white shadow-lg shadow-coral-400/30 flex items-center justify-center active:scale-95 transition-transform z-20"
      ><Plus className="w-6 h-6" /></button>

      {/* Bottom sheet modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[90dvh] overflow-y-auto">
            <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/20" /></div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-milk-900 dark:text-milk-100">
                {editingId ? '\u7f16\u8f91\u7ecf\u671f\u8bb0\u5f55' : '\u6dfb\u52a0\u7ecf\u671f\u8bb0\u5f55'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5 text-milk-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-milk-700 dark:text-milk-300 mb-1.5">{'\u5f00\u59cb\u65e5\u671f'}</label>
                  <input type="date" value={formData.startDate}
                    onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-milk-200 dark:border-white/10 bg-milk-50 dark:bg-white/5 text-milk-900 dark:text-milk-100 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-milk-700 dark:text-milk-300 mb-1.5">
                    {'\u7ed3\u675f\u65e5\u671f'} <span className="text-milk-400 font-normal">{'(\u9009\u586b)'}</span>
                  </label>
                  <input type="date" value={formData.endDate}
                    onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} min={formData.startDate}
                    className="w-full px-3 py-2.5 rounded-xl border border-milk-200 dark:border-white/10 bg-milk-50 dark:bg-white/5 text-milk-900 dark:text-milk-100 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-milk-700 dark:text-milk-300 mb-2">{'\u75bc\u75db\u7a0b\u5ea6'}</label>
                <div className="flex gap-2">
                  {PAIN_LABELS.map(opt => (
                    <button key={opt.value} onClick={() => setFormData(p => ({ ...p, pain: opt.value }))}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-sm transition-all',
                        formData.pain === opt.value
                          ? 'bg-coral-50 dark:bg-coral-900/30 ring-2 ring-coral-400 shadow-sm'
                          : 'bg-milk-50 dark:bg-white/5 hover:bg-milk-100 dark:hover:bg-white/10'
                      )}>
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-[11px] text-milk-600 dark:text-milk-400">{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-milk-700 dark:text-milk-300 mb-2">{'\u6d41\u91cf'}</label>
                <div className="flex gap-2">
                  {FLOW_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setFormData(p => ({ ...p, flow: opt.value }))}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-sm transition-all',
                        formData.flow === opt.value
                          ? 'bg-coral-50 dark:bg-coral-900/30 ring-2 ring-coral-400 shadow-sm'
                          : 'bg-milk-50 dark:bg-white/5 hover:bg-milk-100 dark:hover:bg-white/10'
                      )}>
                      <span className="text-sm text-coral-500 dark:text-coral-400">{'\ud83d\udca7'.repeat(opt.drops)}</span>
                      <span className="text-xs font-medium text-milk-600 dark:text-milk-400">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-milk-700 dark:text-milk-300 mb-2">{'\u5fc3\u60c5'}</label>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setFormData(p => ({ ...p, mood: opt.value }))}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-sm transition-all',
                        formData.mood === opt.value
                          ? 'bg-coral-50 dark:bg-coral-900/30 ring-2 ring-coral-400 shadow-sm'
                          : 'bg-milk-50 dark:bg-white/5 hover:bg-milk-100 dark:hover:bg-white/10'
                      )}>
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-[11px] text-milk-600 dark:text-milk-400">{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-milk-700 dark:text-milk-300 mb-1.5">
                  {'\u5907\u6ce8'} <span className="text-milk-400 font-normal">{'(\u9009\u586b)'}</span>
                </label>
                <textarea value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder={'\u8bb0\u5f55\u8eab\u4f53\u611f\u53d7...'} rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-milk-200 dark:border-white/10 bg-milk-50 dark:bg-white/5 text-milk-900 dark:text-milk-100 placeholder-milk-400 dark:placeholder-milk-600 text-sm focus:outline-none focus:ring-2 focus:ring-coral-400/50 resize-none" />
              </div>

              {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">{error}</div>}

              <button onClick={handleSave} disabled={!formData.startDate || saving}
                className={cn(
                  'w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all',
                  'bg-gradient-to-r from-apricot-400 to-coral-500 hover:shadow-lg hover:shadow-coral-400/25 active:scale-[0.98]',
                  (!formData.startDate || saving) && 'opacity-50 cursor-not-allowed'
                )}>
                {saving ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : '\u4fdd\u5b58'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
