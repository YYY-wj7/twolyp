import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Loader2, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, formatDate, withTimeout } from '../lib/utils'

/* Empty state illustration for journey */
function EmptyJourneyIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none">
      <circle cx="60" cy="60" r="50" fill="#FFE4E6" opacity="0.2" />
      <path d="M30 80C40 50 60 30 90 40" stroke="#F4728B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      <g transform="translate(85, 38) rotate(20)">
        <path d="M0 0L-6 3L-2 0L-6-3Z" fill="#F4728B" opacity="0.7" />
      </g>
      <circle cx="40" cy="70" r="5" fill="#FECDD3" opacity="0.5" />
      <circle cx="60" cy="50" r="4" fill="#FDA4AF" opacity="0.4" />
      <circle cx="75" cy="60" r="3.5" fill="#FECDD3" opacity="0.3" />
      <path d="M60 65C60 65 52 59 52 55C52 52 55 51 57 52C58 53 60 55 60 55C60 55 62 53 63 52C65 51 68 52 68 55C68 59 60 65 60 65Z" fill="#FB7185" opacity="0.6" />
    </svg>
  )
}

export default function JourneyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { gardenId } = useAuth()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!gardenId) {
      setLoading(false)
      return
    }

    async function fetchRecords() {
      try {
        setError('')
        const { data, error } = await withTimeout(
          supabase
            .from('records')
            .select('id, title, content, location_name, recorded_at, created_at')
            .eq('garden_id', gardenId)
            .eq('is_deleted', false)
            .eq('category', 'travel')
            .order('recorded_at'),
          15000,
          '加载旅途记录'
        )
        if (error) throw error
        setRecords(data || [])
      } catch (e) {
        console.error('Failed to fetch journey records:', e)
        setError(e.message || '加载旅途记录失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [gardenId, id])

  // Group records by date
  const grouped = records.reduce((acc, record) => {
    const date = record.recorded_at
      ? new Date(record.recorded_at).toISOString().split('T')[0]
      : new Date(record.created_at).toISOString().split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(record)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="min-h-dvh bg-milk-50 dark:bg-dark-bg transition-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 safe-top glass dark:glass-dark border-b border-milk-100/50 dark:border-dark-border/50">
        <div className="flex items-center justify-between h-12 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-dark-card shadow-card active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-milk-700 dark:text-milk-300" />
          </button>
          <h1 className="text-base font-semibold text-milk-900 dark:text-milk-100">
            旅途回忆
          </h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Content */}
      <div className="px-5 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-apricot-400 animate-spin" />
              <span className="text-sm text-milk-500 dark:text-milk-400">加载中...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-tulip-500 dark:text-tulip-400">{error}</p>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-float">
              <EmptyJourneyIllustration />
            </div>
            <h3 className="text-base font-semibold text-milk-800 dark:text-milk-200 mt-3">
              还没有旅途记录
            </h3>
            <p className="text-sm text-milk-500 dark:text-milk-400 mt-1">
              记录你们的每一次旅行吧
            </p>
          </div>
        )}

        {!loading && !error && sortedDates.length > 0 && (
          <div>
            {sortedDates.map((date, dayIndex) => (
              <div key={date} className="relative pl-8 pb-8 last:pb-0">
                {/* Timeline line */}
                {dayIndex < sortedDates.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-apricot-300 to-apricot-100 dark:from-dark-border dark:to-dark-border" />
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full gradient-coral flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Day header */}
                <div className="mb-3">
                  <span className="text-sm font-semibold text-apricot-500 dark:text-apricot-400">
                    Day {dayIndex + 1}
                  </span>
                  <p className="text-xs text-milk-500 dark:text-milk-400 mt-0.5">
                    {formatDate(date)}
                  </p>
                </div>

                {/* Day records */}
                <div className="space-y-3">
                  {grouped[date].map(record => (
                    <div
                      key={record.id}
                      onClick={() => navigate(`/record/${record.id}`)}
                      className="p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-all bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card hover:shadow-card-hover"
                    >
                      <h3 className="text-sm font-semibold text-milk-900 dark:text-milk-100">
                        {record.title || '无标题'}
                      </h3>
                      {record.content && (
                        <p className="text-xs text-milk-500 dark:text-milk-400 mt-1 line-clamp-3 leading-relaxed">
                          {record.content}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {record.location_name && (
                          <span className="text-[10px] text-apricot-400 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {record.location_name}
                          </span>
                        )}
                        <span className="text-[10px] text-milk-400 dark:text-milk-500">
                          {record.recorded_at
                            ? new Date(record.recorded_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
