import { MapPin } from 'lucide-react'

// Mock visited cities
const MOCK_CITIES = [
  { name: '三亚', country: '中国', recordCount: 12, lastVisit: '2025-12-20' },
  { name: '东京', country: '日本', recordCount: 20, lastVisit: '2025-11-15' },
  { name: '巴黎', country: '法国', recordCount: 8, lastVisit: '2025-09-03' },
  { name: '杭州', country: '中国', recordCount: 5, lastVisit: '2026-01-10' },
  { name: '上海', country: '中国', recordCount: 15, lastVisit: '2026-03-01' },
]

export default function MapPage() {
  return (
    <div className="relative z-10 min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-milk-50/80 dark:bg-dark-bg/80 backdrop-blur-xl safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            足迹
          </h1>
          <span className="text-sm text-milk-500 dark:text-milk-400">
            {MOCK_CITIES.length} 个城市
          </span>
        </div>
      </header>

      {/* Map placeholder — will be replaced with Mapbox */}
      <div className="mx-4 mt-2 rounded-2xl overflow-hidden bg-milk-200 dark:bg-dark-card aspect-[4/3] flex items-center justify-center border border-milk-200 dark:border-dark-border">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-apricot-400 mx-auto mb-3" />
          <p className="text-sm text-milk-500 dark:text-milk-400">
            地图加载中...
          </p>
          <p className="text-xs text-milk-400 dark:text-milk-500 mt-1">
            接入 Mapbox 后将显示交互式地图
          </p>
        </div>
      </div>

      {/* City list */}
      <div className="px-4 mt-4 pb-4">
        <h2 className="text-sm font-medium text-milk-700 dark:text-milk-300 mb-3">
          去过的城市
        </h2>
        <div className="space-y-2">
          {MOCK_CITIES.map(city => (
            <div
              key={city.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border"
            >
              <div className="w-10 h-10 rounded-xl bg-apricot-100 dark:bg-dark-border flex items-center justify-center">
                <MapPin className="w-5 h-5 text-apricot-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-milk-900 dark:text-milk-100">
                    {city.name}
                  </span>
                  <span className="text-xs text-milk-400">{city.country}</span>
                </div>
                <span className="text-xs text-milk-500 dark:text-milk-400">
                  {city.recordCount} 条记录
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
