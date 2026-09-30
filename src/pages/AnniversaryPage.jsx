import { useState } from 'react'
import { Heart, Plus, Calendar, Gift } from 'lucide-react'
import { cn, daysTogether } from '../lib/utils'

const MOCK_ANNIVERSARIES = [
  { id: '1', title: '在一起', date: '2024-06-15', isMain: true },
  { id: '2', title: '第一次旅行', date: '2024-08-20', isMain: false },
  { id: '3', title: '第一次做饭', date: '2024-10-01', isMain: false },
  { id: '4', title: '领养小郁', date: '2025-03-12', isMain: false },
]

export default function AnniversaryPage() {
  const [showAddModal, setShowAddModal] = useState(false)

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

      {/* Main anniversary card */}
      <div className="mx-4 mt-2 p-6 rounded-2xl bg-gradient-to-br from-apricot-300 via-tulip-300 to-apricot-400 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 fill-white" />
          <span className="text-sm font-medium opacity-90">在一起</span>
        </div>
        <div className="text-5xl font-bold mb-2">
          {daysTogether('2024-06-15')}
        </div>
        <p className="text-sm opacity-80">天</p>
        <p className="text-xs opacity-70 mt-2">
          2024年6月15日 至今
        </p>
      </div>

      {/* Anniversary list */}
      <div className="px-4 mt-6 pb-4">
        <h2 className="text-sm font-medium text-milk-700 dark:text-milk-300 mb-3">
          我们的纪念日
        </h2>
        <div className="space-y-2">
          {MOCK_ANNIVERSARIES.map(ann => {
            const days = daysTogether(ann.date)
            return (
              <div
                key={ann.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border"
              >
                <div className="w-10 h-10 rounded-xl bg-tulip-50 dark:bg-dark-border flex items-center justify-center">
                  {ann.isMain ? (
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
      </div>
    </div>
  )
}
