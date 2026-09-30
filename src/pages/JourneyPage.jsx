import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar } from 'lucide-react'
import { cn, formatDate } from '../lib/utils'

// Mock journey data
const MOCK_JOURNEY = {
  id: 'j1',
  title: '三亚之旅',
  startDate: '2025-12-18',
  endDate: '2025-12-22',
  location: '三亚',
  coverImage: 'https://picsum.photos/800/400?random=20',
  days: [
    {
      date: '2025-12-18',
      records: [
        { id: 'r1', title: '出发！', cover: 'https://picsum.photos/400/300?random=21', summary: '终于出发了，好期待' },
      ],
    },
    {
      date: '2025-12-19',
      records: [
        { id: 'r2', title: '亚龙湾半日游', cover: 'https://picsum.photos/400/500?random=22', summary: '海水好蓝' },
        { id: 'r3', title: '海鲜大排档', cover: 'https://picsum.photos/400/300?random=23', summary: '吃了超新鲜的海鲜' },
      ],
    },
    {
      date: '2025-12-20',
      records: [
        { id: 'r4', title: '第一次去三亚', cover: 'https://picsum.photos/400/400?random=24', summary: '阳光沙滩还有你' },
      ],
    },
  ],
}

export default function JourneyPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-milk-50 dark:bg-dark-bg transition-theme">
      {/* Hero */}
      <div className="relative">
        <div className="aspect-[2/1] overflow-hidden">
          <img src={MOCK_JOURNEY.coverImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <header className="absolute top-0 left-0 right-0 safe-top">
          <div className="flex items-center justify-between h-12 px-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h1 className="text-2xl font-bold">{MOCK_JOURNEY.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {MOCK_JOURNEY.startDate} ~ {MOCK_JOURNEY.endDate}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {MOCK_JOURNEY.location}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-6">
        {MOCK_JOURNEY.days.map((day, dayIndex) => (
          <div key={day.date} className="relative pl-8 pb-8">
            {/* Timeline line */}
            {dayIndex < MOCK_JOURNEY.days.length - 1 && (
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
                {formatDate(day.date)}
              </p>
            </div>

            {/* Day records */}
            <div className="space-y-3">
              {day.records.map(record => (
                <div
                  key={record.id}
                  onClick={() => navigate(`/record/${record.id}`)}
                  className="flex gap-3 p-3 rounded-xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <img src={record.cover} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-milk-900 dark:text-milk-100">
                      {record.title}
                    </h3>
                    <p className="text-xs text-milk-500 dark:text-milk-400 mt-0.5 line-clamp-2">
                      {record.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
