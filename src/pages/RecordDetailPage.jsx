import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, MapPin, Share2, MoreHorizontal } from 'lucide-react'
import { cn, formatDate } from '../lib/utils'

// Mock record data
const MOCK_RECORD = {
  id: '1',
  title: '第一次去三亚',
  content: '阳光、沙滩、还有你。这是我们第一次一起看海，海浪声是最好的背景音乐。在沙滩上写下我们的名字，虽然很快就被浪花冲走了，但这段记忆会永远留在这里。',
  category: 'travel',
  tags: ['海边', '第一次', '度假'],
  images: [
    'https://picsum.photos/800/600?random=11',
    'https://picsum.photos/800/1000?random=12',
    'https://picsum.photos/800/700?random=13',
  ],
  author: 'YCH',
  authorAvatar: null,
  createdAt: '2025-12-20T10:30:00Z',
  location: '三亚·亚龙湾',
  weather: '晴 28°C',
  isLiked: true,
  comments: [
    { id: 'c1', author: 'LWJ', content: '最开心的一天！下次还要来', createdAt: '2025-12-20T18:00:00Z' },
    { id: 'c2', author: 'YCH', content: '必须的，下次带你去潜水', createdAt: '2025-12-20T19:30:00Z' },
  ],
}

export default function RecordDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const record = MOCK_RECORD // TODO: fetch from DB

  return (
    <div className="min-h-dvh bg-white dark:bg-dark-bg transition-theme">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-top">
        <div className="flex items-center justify-between h-12 px-4 bg-gradient-to-b from-black/30 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero image carousel */}
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={record.images[0]}
            alt={record.title}
            className="w-full h-full object-cover"
          />
        </div>
        {record.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {record.images.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === 0 ? 'bg-white w-4' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative -mt-6 rounded-t-3xl bg-white dark:bg-dark-bg px-5 pt-6 pb-8">
        {/* Author & date */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apricot-300 to-tulip-300 flex items-center justify-center text-white text-sm font-medium">
            {record.author[0]}
          </div>
          <div>
            <span className="text-sm font-medium text-milk-900 dark:text-milk-100">
              {record.author}
            </span>
            <p className="text-xs text-milk-500 dark:text-milk-400">
              {formatDate(record.createdAt)}
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100 mb-3">
          {record.title}
        </h1>

        {/* Content */}
        <p className="text-base text-milk-700 dark:text-milk-300 leading-relaxed mb-4">
          {record.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {record.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-apricot-50 dark:bg-dark-card text-apricot-600 dark:text-apricot-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Location & weather */}
        <div className="flex items-center gap-4 text-sm text-milk-500 dark:text-milk-400 mb-6">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {record.location}
          </span>
          <span>{record.weather}</span>
        </div>

        {/* Interaction bar */}
        <div className="flex items-center gap-6 py-4 border-t border-b border-milk-200 dark:border-dark-border">
          <button className="flex items-center gap-1.5">
            <Heart className={cn('w-5 h-5', record.isLiked ? 'text-tulip-500 fill-tulip-500' : 'text-milk-500')} />
            <span className="text-sm text-milk-600 dark:text-milk-400">喜欢</span>
          </button>
          <button className="flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5 text-milk-500" />
            <span className="text-sm text-milk-600 dark:text-milk-400">{record.comments.length} 评论</span>
          </button>
        </div>

        {/* Comments */}
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium text-milk-700 dark:text-milk-300">
            他说 / 她说
          </h3>
          {record.comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apricot-200 to-tulip-200 flex items-center justify-center text-xs font-medium text-milk-700 flex-shrink-0">
                {comment.author[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-milk-800 dark:text-milk-200">
                    {comment.author}
                  </span>
                  <span className="text-xs text-milk-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-milk-600 dark:text-milk-400 mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <div className="mt-6 flex items-center gap-3">
          <input
            type="text"
            placeholder="说点什么..."
            className="flex-1 h-10 px-4 rounded-full bg-milk-100 dark:bg-dark-card text-sm text-milk-800 dark:text-milk-200 placeholder:text-milk-400 focus:outline-none focus:ring-2 focus:ring-apricot-300"
          />
          <button className="px-4 h-10 rounded-full bg-apricot-400 text-white text-sm font-medium active:scale-95 transition-transform">
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
