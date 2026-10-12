import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plane, Globe, Plus, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, withTimeout } from '../lib/utils'

/* SVG illustration for empty state — heart with flight trail */
function EmptyMapIllustration() {
  return (
    <svg viewBox="0 0 160 160" className="w-36 h-36" fill="none">
      {/* Soft background circle */}
      <circle cx="80" cy="80" r="72" fill="url(#mapBg)" opacity="0.15" />
      {/* Dashed flight path */}
      <path
        d="M40 110 C30 70, 60 30, 90 45 S140 70, 120 100 S70 130, 50 110"
        stroke="#F4728B"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.5"
      />
      {/* Small plane on path */}
      <g transform="translate(115, 68) rotate(25)">
        <path d="M0 0L-8 4L-3 0L-8-4Z" fill="#F4728B" opacity="0.8" />
      </g>
      {/* Heart in center */}
      <g transform="translate(80, 78)">
        <path
          d="M0 8C0 8-16-4-16-12C-16-18-10-20-6-18C-3-16 0-12 0-12C0-12 3-16 6-18C10-20 16-18 16-12C16-4 0 8 0 8Z"
          fill="#FDA4AF"
          stroke="#F4728B"
          strokeWidth="1.5"
        />
      </g>
      {/* Location pins scattered */}
      <g transform="translate(45, 52)" opacity="0.6">
        <circle r="4" fill="#FECDD3" />
        <circle r="2" fill="#F4728B" />
      </g>
      <g transform="translate(110, 95)" opacity="0.5">
        <circle r="3.5" fill="#FECDD3" />
        <circle r="1.8" fill="#F4728B" />
      </g>
      <g transform="translate(65, 105)" opacity="0.4">
        <circle r="3" fill="#FECDD3" />
        <circle r="1.5" fill="#F4728B" />
      </g>
      {/* Sparkles */}
      <circle cx="38" cy="42" r="1.5" fill="#FDA4AF" opacity="0.7" />
      <circle cx="125" cy="55" r="1.2" fill="#FB7185" opacity="0.6" />
      <circle cx="55" cy="118" r="1" fill="#FECDD3" opacity="0.5" />
      <defs>
        <radialGradient id="mapBg">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="100%" stopColor="#FFF5F5" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export default function MapPage() {
  const navigate = useNavigate()
  const { gardenId } = useAuth()
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalTrips, setTotalTrips] = useState(0)

  useEffect(() => {
    async function fetchTravelData() {
      if (!gardenId) {
        setCities([])
        setLoading(false)
        return
      }
      try {
        const { data: travelRecords, error } = await withTimeout(
          supabase
            .from('records')
            .select('id, location_name, created_at')
            .eq('garden_id', gardenId)
            .eq('is_deleted', false)
            .eq('category', 'travel')
            .not('location_name', 'is', null)
            .order('created_at', { ascending: false }),
          15000,
          '加载旅行记录'
        )

        if (error) throw error

        // Group by city name
        const cityMap = {}
        const allRecords = travelRecords || []
        setTotalTrips(allRecords.length)

        allRecords.forEach(r => {
          const name = r.location_name?.trim()
          if (!name) return
          if (!cityMap[name]) {
            cityMap[name] = { name, count: 0, lastVisit: r.created_at }
          }
          cityMap[name].count++
        })

        // Sort by count descending, take top 20
        const sorted = Object.values(cityMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)

        setCities(sorted)
      } catch (e) {
        console.warn('Failed to fetch travel data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchTravelData()
  }, [gardenId])

  return (
    <div className="relative z-10 min-h-dvh animate-page-enter">
      {/* Header */}
      <header className="sticky top-0 z-40 glass dark:glass-dark safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-apricot-400" />
            <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
              足迹
            </h1>
          </div>
          {totalTrips > 0 && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-apricot-50 dark:bg-dark-card text-apricot-500 dark:text-apricot-400">
              {totalTrips} 条旅行记录
            </span>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-apricot-300 border-t-apricot-500 rounded-full animate-spin" />
            <span className="text-sm text-milk-500 dark:text-milk-400">加载旅行记录...</span>
          </div>
        </div>
      ) : cities.length === 0 ? (
        /* Empty state — beautiful illustration */
        <div className="flex flex-col items-center justify-center px-8 pt-16 pb-8 text-center">
          <div className="animate-float">
            <EmptyMapIllustration />
          </div>
          <h3 className="text-xl font-semibold text-milk-900 dark:text-milk-100 mt-4">
            还没有旅行足迹
          </h3>
          <p className="text-sm text-milk-500 dark:text-milk-400 mt-2 max-w-[260px] leading-relaxed">
            记录你们的每一次旅行，这里会慢慢填满属于你们的地图
          </p>
          <button
            onClick={() => navigate('/create')}
            className={cn(
              'mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full',
              'gradient-coral text-white text-sm font-medium',
              'glow-coral active:scale-[0.97] transition-transform'
            )}
          >
            <Plus className="w-4 h-4" />
            记录一次旅行
          </button>
        </div>
      ) : (
        /* City list with real data */
        <div className="px-4 mt-3 pb-4 space-y-3">
          {/* Summary card */}
          <div className="gradient-coral rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Plane className="w-5 h-5 opacity-90" />
              <span className="text-sm font-medium opacity-90">旅行足迹</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{cities.length}</span>
              <span className="text-sm opacity-80">个城市</span>
            </div>
            <p className="text-xs opacity-70 mt-1">
              共 {totalTrips} 条旅行记录
            </p>
          </div>

          {/* Map placeholder — premium "coming soon" card */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-apricot-50 to-peach-50 dark:from-dark-card dark:to-dark-card aspect-[16/9] flex items-center justify-center border border-apricot-100/50 dark:border-dark-border shadow-card">
            <div className="text-center px-4">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-dark-card shadow-card flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-apricot-400" />
              </div>
              <p className="text-sm font-medium text-milk-700 dark:text-milk-300">
                交互式地图即将上线
              </p>
              <p className="text-xs text-milk-400 dark:text-milk-500 mt-1">
                到时候可以在地图上看到你们的旅行足迹
              </p>
            </div>
          </div>

          {/* City list */}
          <h2 className="text-sm font-medium text-milk-700 dark:text-milk-300 flex items-center gap-1.5 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-apricot-400" />
            去过的地方
          </h2>
          <div className="space-y-2">
            {cities.map((city, index) => (
              <div
                key={city.name}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-apricot-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-milk-900 dark:text-milk-100">
                    {city.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-apricot-500">
                    {city.count}
                  </span>
                  <p className="text-[10px] text-milk-400">条记录</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
