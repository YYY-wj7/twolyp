import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, formatDate } from '../lib/utils'

export default function JourneyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { gardenId } = useAuth()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gardenId) {
      setLoading(false)
      return
    }

    let query = supabase
      .from('records')
      .select('id, title, content, recorded_at, created_at')
      .eq('garden_id', gardenId)
      .eq('is_deleted', false)
      .order('recorded_at')

    // If a specific journey id is in the route, filter by it; otherwise show all journey records
    if (id) {
      query = query.eq('journey_id', id)
    } else {
      query = query.eq('is_journey', true)
    }

    query.then(({ data, error }) => {
      if (error) {
        console.error('Failed to fetch journey records:', error)
      }
      setRecords(data || [])
      setLoading(false)
    })
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
      <header className="sticky top-0 z-10 safe-top bg-milk-50/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-milk-100 dark:border-dark-border">
        <div className="flex items-center justify-between h-12 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-milk-100 dark:bg-dark-card active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-milk-700 dark:text-milk-300" />
          </button>
          <h1 className="text-base font-semibold text-milk-900 dark:text-milk-100">
            旅途回忆
          </h1>
          <div className="w-9" /> {/* spacer for centering */}
        </div>
      </header>

      {/* Content */}
      <div className="px-5 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-apricot-400 animate-spin" />
          </div>
        )}

        {!loading && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={cn(
              'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4',
              'from-apricot-200 to-tulip-200 dark:from-apricot-400/20 dark:to-tulip-400/20'
            )}>
              <Calendar className="w-10 h-10 text-apricot-400 dark:text-apricot-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-milk-500 dark:text-milk-400">
              还没有旅途记录
            </p>
            <p className="text-xs text-milk-400 dark:text-milk-500 mt-1">
              记录你们的每一次旅行吧
            </p>
          </div>
        )}

        {!loading && sortedDates.length > 0 && (
          <div>
            {sortedDates.map((date, dayIndex) => (
              <div key={date} className="relative pl-8 pb-8 last:pb-0">
                {/* Timeline line */}
                {dayIndex < sortedDates.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-apricot-200 dark:bg-dark-border" />
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-apricot-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Day header */}
                <div className="mb-3">
                  <span className="text-sm font-medium text-apricot-600 dark:text-apricot-400">
                    Day {dayIndex + 1}
                  </span>
                  <p className="text-xs text-milk-500 dark:text-milk-400">
                    {formatDate(date)}
                  </p>
                </div>

                {/* Day records */}
                <div className="space-y-3">
                  {grouped[date].map(record => (
                    <div
                      key={record.id}
                      onClick={() => navigate(`/record/${record.id}`)}
                      className={cn(
                        'p-4 rounded-xl cursor-pointer active:scale-[0.98] transition-transform',
                        'bg-white dark:bg-dark-card',
                        'border border-milk-100 dark:border-dark-border'
                      )}
                    >
                      <h3 className="text-sm font-medium text-milk-900 dark:text-milk-100">
                        {record.title || '无标题'}
                      </h3>
                      {record.content && (
                        <p className="text-xs text-milk-500 dark:text-milk-400 mt-1 line-clamp-3">
                          {record.content}
                        </p>
                      )}
                      <p className="text-[10px] text-milk-400 dark:text-milk-500 mt-2">
                        {record.recorded_at
                          ? new Date(record.recorded_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </p>
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
