import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, X } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { withTimeout } from '../lib/utils'

function parseISO(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(date, n) {
  const r = new Date(date)
  r.setDate(r.getDate() + n)
  return r
}

function daysFromToday(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseISO(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

function parseContent(record) {
  try { return JSON.parse(record.content) } catch { return {} }
}

export default function PeriodReminderBanner() {
  const { gardenId } = useAuth()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    if (!gardenId) return
    let cancelled = false

    async function loadPrediction() {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('records')
            .select('content')
            .eq('garden_id', gardenId)
            .eq('is_deleted', false)
            .eq('category', 'custom')
            .contains('custom_tags', ['period'])
            .order('recorded_at', { ascending: false })
            .limit(10),
          10000,
          '加载经期提醒'
        )
        if (error || cancelled) return
        if (!data || data.length === 0) return

        const cycles = data
          .map(r => parseContent(r))
          .filter(c => c.startDate && c.status === 'ended' && c.endDate)
          .sort((a, b) => b.startDate.localeCompare(a.startDate))

        if (cycles.length < 2) return

        // Calculate average cycle length from last 3 completed cycles
        const starts = cycles.map(c => c.startDate)
        const lengths = []
        for (let i = 0; i < Math.min(starts.length - 1, 3); i++) {
          const diff = Math.round((parseISO(starts[i]) - parseISO(starts[i + 1])) / 86400000)
          if (diff > 15 && diff < 60) lengths.push(diff)
        }
        if (lengths.length === 0) return

        const avgCycle = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
        const lastStart = starts[0]
        const predictedStart = addDays(parseISO(lastStart), avgCycle)
        const countdown = daysFromToday(toISO(predictedStart))

        // Only show if within 7 days and not more than 2 days past
        if (countdown >= -2 && countdown <= 7) {
          if (!cancelled) {
            setPrediction({
              date: toISO(predictedStart),
              countdown,
              cycleLength: avgCycle,
            })
          }
        }
      } catch (e) {
        // Silently fail — this is a non-critical banner
        console.warn('Period reminder fetch failed:', e.message)
      }
    }

    loadPrediction()
    return () => { cancelled = true }
  }, [gardenId])

  if (dismissed || !prediction) return null

  const { countdown } = prediction

  let messageText = ''
  if (countdown > 1) {
    messageText = `预计经期还有 ${countdown} 天`
  } else if (countdown === 1) {
    messageText = '预计明天来经期'
  } else if (countdown === 0) {
    messageText = '预计今天来经期'
  } else {
    messageText = `经期可能已延迟 ${Math.abs(countdown)} 天`
  }

  return (
    <div className="px-4 py-1.5">
      <div
        onClick={() => navigate('/period-tracker')}
        className="relative group cursor-pointer rounded-2xl bg-gradient-to-r from-coral-50 to-apricot-50 dark:from-coral-900/15 dark:to-apricot-900/10 border border-coral-100/60 dark:border-coral-800/20 px-4 py-3 transition-all hover:shadow-sm active:scale-[0.99]"
      >
        {/* Dismiss button */}
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
        >
          <X className="w-3.5 h-3.5 text-milk-400 dark:text-milk-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-100 to-apricot-100 dark:from-coral-800/30 dark:to-apricot-800/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5 text-coral-500 dark:text-coral-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-milk-800 dark:text-milk-200">
              {messageText}
            </p>
            <p className="text-[11px] text-milk-500 dark:text-milk-400 mt-0.5">
              点击查看经期记录
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
