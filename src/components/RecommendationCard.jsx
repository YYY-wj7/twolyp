import { cn } from '../lib/utils'
import { MapPin, Film, Sparkles } from 'lucide-react'

/**
 * A compact recommendation card that sits inside the Feed masonry grid.
 * Renders differently based on type: travel / seasonal / watch.
 */
export default function RecommendationCard({ item, type }) {
  if (!item) return null

  const typeConfig = {
    travel: {
      icon: MapPin,
      label: '今日推荐旅行',
      gradient: 'from-apricot-400 to-peach-400',
      bgLight: 'bg-apricot-50 dark:bg-apricot-900/20',
    },
    seasonal: {
      icon: Sparkles,
      label: '应季活动推荐',
      gradient: 'from-sage-400 to-apricot-400',
      bgLight: 'bg-sage-50 dark:bg-sage-600/20',
    },
    watch: {
      icon: Film,
      label: '一起看推荐',
      gradient: 'from-tulip-400 to-apricot-400',
      bgLight: 'bg-tulip-50 dark:bg-tulip-900/20',
    },
  }

  const config = typeConfig[type] || typeConfig.travel
  const Icon = config.icon

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden border border-milk-100/80 dark:border-dark-border',
      'bg-white dark:bg-dark-card shadow-card',
      'animate-fade-in'
    )}>
      {/* Gradient header */}
      <div className={cn('px-3 pt-3 pb-2 bg-gradient-to-r', config.gradient)}>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="w-3.5 h-3.5 text-white/90" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-white/90 tracking-wide">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
            {item.subtitle && (
              <p className="text-[11px] text-white/80 truncate">{item.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-milk-700 dark:text-milk-300 leading-relaxed line-clamp-3">
          {item.description}
        </p>

        {/* Tags / metadata */}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.bestSeason && (
            <span className={cn(
              'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
              config.bgLight,
              'text-apricot-600 dark:text-apricot-300'
            )}>
              {item.bestSeason}
            </span>
          )}
          {item.budget && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-milk-100 dark:bg-dark-surface text-milk-600 dark:text-milk-400">
              预算 {item.budget}
            </span>
          )}
          {item.year && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-milk-100 dark:bg-dark-surface text-milk-600 dark:text-milk-400">
              {item.year}
            </span>
          )}
          {item.rating && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-apricot-50 dark:bg-apricot-900/20 text-apricot-600 dark:text-apricot-300">
              ★ {item.rating}
            </span>
          )}
          {item.tags?.map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-milk-100 dark:bg-dark-surface text-milk-600 dark:text-milk-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
