import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'

// Mock deleted records
const MOCK_DELETED = [
  { id: 'd1', title: '删掉的测试记录', deletedAt: '2026-09-10T08:00:00Z', cover: 'https://picsum.photos/100/100?random=30' },
  { id: 'd2', title: '不满意的照片集', deletedAt: '2026-09-08T15:00:00Z', cover: 'https://picsum.photos/100/100?random=31' },
]

export default function RecycleBinPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(MOCK_DELETED)

  const daysRemaining = (deletedAt) => {
    const deleted = new Date(deletedAt)
    const expires = new Date(deleted.getTime() + 31 * 86400000)
    const remaining = Math.ceil((expires - new Date()) / 86400000)
    return Math.max(0, remaining)
  }

  return (
    <div className="relative z-10">
      <header className="sticky top-0 z-40 bg-milk-50/80 dark:bg-dark-bg/80 backdrop-blur-xl safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            回收站
          </h1>
        </div>
      </header>

      <div className="px-4 mt-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trash2 className="w-12 h-12 text-milk-300 dark:text-milk-600 mb-3" />
            <p className="text-sm text-milk-500 dark:text-milk-400">回收站是空的</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-milk-500 dark:text-milk-400 mb-3">
              删除的记录将在31天后永久清除
            </p>
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border"
              >
                <img src={item.cover} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-milk-900 dark:text-milk-100 line-clamp-1">
                    {item.title}
                  </span>
                  <p className="text-xs text-milk-400 mt-0.5">
                    还剩 {daysRemaining(item.deletedAt)} 天
                  </p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-apricot-100 dark:bg-dark-border text-xs text-apricot-600 dark:text-apricot-400 active:scale-95 transition-transform">
                  <RotateCcw className="w-3.5 h-3.5" />
                  恢复
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
