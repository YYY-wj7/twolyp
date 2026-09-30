import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Pin } from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'
import { CATEGORIES } from '../lib/constants'

// Mock data for development
const MOCK_RECORDS = [
  {
    id: '1',
    title: '第一次去三亚',
    content: '阳光、沙滩、还有你',
    category: 'travel',
    tags: ['海边', '第一次'],
    coverImage: 'https://picsum.photos/400/500?random=1',
    imageCount: 12,
    author: 'YCH',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isPinned: true,
    location: '三亚',
    commentCount: 3,
  },
  {
    id: '2',
    title: '周末探店 · 老城区咖啡馆',
    content: '藏在巷子里的宝藏咖啡店，拿铁拉花超美',
    category: 'food',
    tags: ['咖啡', '探店'],
    coverImage: 'https://picsum.photos/400/300?random=2',
    imageCount: 6,
    author: 'LWJ',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isPinned: false,
    location: '上海',
    commentCount: 1,
  },
  {
    id: '3',
    title: '在一起 500 天',
    content: '不知不觉已经500天了，每一天都是礼物',
    category: 'activity',
    tags: ['纪念日'],
    coverImage: 'https://picsum.photos/400/400?random=3',
    imageCount: 3,
    author: 'YCH',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isPinned: true,
    location: '杭州',
    commentCount: 5,
  },
  {
    id: '4',
    title: '家里的新成员',
    content: '领养了一只橘猫，取名叫小郁',
    category: 'photo',
    tags: ['宠物', '日常'],
    coverImage: 'https://picsum.photos/400/600?random=4',
    imageCount: 9,
    author: 'LWJ',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    isPinned: false,
    location: null,
    commentCount: 8,
  },
  {
    id: '5',
    title: '东京塔下的约定',
    content: '在东京塔下许了一个愿望',
    category: 'travel',
    tags: ['日本', '东京'],
    coverImage: 'https://picsum.photos/400/450?random=5',
    imageCount: 20,
    author: 'YCH',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    isPinned: false,
    location: '东京',
    commentCount: 2,
  },
  {
    id: '6',
    title: '自制生日蛋糕',
    content: '第一次做蛋糕竟然还挺成功的！',
    category: 'food',
    tags: ['生日', '烘焙'],
    coverImage: 'https://picsum.photos/400/350?random=6',
    imageCount: 4,
    author: 'LWJ',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    isPinned: false,
    location: null,
    commentCount: 4,
  },
]

export default function FeedPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const filteredRecords = activeCategory === 'all'
    ? MOCK_RECORDS
    : MOCK_RECORDS.filter(r => r.category === activeCategory)

  // Separate pinned and normal records
  const pinnedRecords = filteredRecords.filter(r => r.isPinned)
  const normalRecords = filteredRecords.filter(r => !r.isPinned)

  return (
    <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-milk-50/80 dark:bg-dark-bg/80 backdrop-blur-xl safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            TwoLyp
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors"
            >
              <Search className="w-5 h-5 text-milk-600 dark:text-milk-400" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-milk-600 dark:text-milk-400" />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all',
              activeCategory === 'all'
                ? 'bg-apricot-400 text-white shadow-sm'
                : 'bg-milk-200 dark:bg-dark-card text-milk-600 dark:text-milk-400 hover:bg-milk-300'
            )}
          >
            全部
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1.5',
                activeCategory === cat.id
                  ? 'bg-apricot-400 text-white shadow-sm'
                  : 'bg-milk-200 dark:bg-dark-card text-milk-600 dark:text-milk-400 hover:bg-milk-300'
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Pinned records */}
      {pinnedRecords.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Pin className="w-3.5 h-3.5 text-apricot-500" />
            <span className="text-xs font-medium text-apricot-600 dark:text-apricot-400">精选</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {pinnedRecords.map(record => (
              <div
                key={record.id}
                onClick={() => navigate(`/record/${record.id}`)}
                className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-white dark:bg-dark-card shadow-sm border border-milk-200 dark:border-dark-border cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={record.coverImage}
                    alt={record.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2.5">
                  <h3 className="text-sm font-medium text-milk-900 dark:text-milk-100 line-clamp-1">
                    {record.title}
                  </h3>
                  <p className="text-xs text-milk-500 dark:text-milk-400 mt-0.5">
                    {formatRelativeTime(record.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masonry card grid */}
      <div className="card-grid pt-3 pb-4">
        {normalRecords.map((record, index) => (
          <div
            key={record.id}
            className="card-item animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => navigate(`/record/${record.id}`)}
          >
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-dark-card shadow-sm border border-milk-100 dark:border-dark-border cursor-pointer active:scale-[0.98] transition-transform">
              {/* Cover image with variable height */}
              <div className="relative overflow-hidden">
                <img
                  src={record.coverImage}
                  alt={record.title}
                  className="w-full object-cover"
                  loading="lazy"
                />
                {record.imageCount > 1 && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {record.imageCount}张
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-milk-900 dark:text-milk-100 line-clamp-2 leading-snug">
                  {record.title}
                </h3>
                {record.content && (
                  <p className="text-xs text-milk-500 dark:text-milk-400 mt-1 line-clamp-2">
                    {record.content}
                  </p>
                )}

                {/* Tags */}
                {record.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {record.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-apricot-50 dark:bg-dark-border text-apricot-600 dark:text-apricot-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer: author + time */}
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[10px] text-milk-400 dark:text-milk-500">
                    {record.author}
                  </span>
                  <span className="text-[10px] text-milk-400 dark:text-milk-500">
                    {formatRelativeTime(record.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <span className="text-5xl mb-4">🌷</span>
          <h3 className="text-lg font-medium text-milk-700 dark:text-milk-300">
            花园还是空的
          </h3>
          <p className="text-sm text-milk-500 dark:text-milk-400 mt-1">
            点击 + 按钮，种下第一朵郁金香吧
          </p>
        </div>
      )}
    </div>
  )
}
