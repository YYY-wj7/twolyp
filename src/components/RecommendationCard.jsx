import { useState } from 'react'
import { cn } from '../lib/utils'
import { X, MapPin, Film, Sparkles, ChevronRight } from 'lucide-react'

const TYPE_CONFIG = {
  travel: {
    icon: MapPin,
    label: '旅行推荐',
    gradient: 'from-apricot-400 to-peach-400',
    bgAccent: 'bg-apricot-50 dark:bg-apricot-900/20',
    textAccent: 'text-apricot-600 dark:text-apricot-400',
  },
  seasonal: {
    icon: Sparkles,
    label: '应季活动',
    gradient: 'from-sage-400 to-apricot-400',
    bgAccent: 'bg-sage-50 dark:bg-sage-900/20',
    textAccent: 'text-sage-600 dark:text-sage-400',
  },
  watch: {
    icon: Film,
    label: '一起看',
    gradient: 'from-tulip-400 to-apricot-400',
    bgAccent: 'bg-tulip-50 dark:bg-tulip-900/20',
    textAccent: 'text-tulip-600 dark:text-tulip-400',
  },
}

/**
 * Recommendation card for the Feed masonry grid.
 * Now clickable — calls onOpenDetail when tapped.
 */
export default function RecommendationCard({ item, type, onOpenDetail }) {
  if (!item) return null

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.travel
  const Icon = config.icon

  return (
    <button
      onClick={() => onOpenDetail?.({ item, type })}
      className={cn(
        'w-full text-left rounded-2xl overflow-hidden',
        'border border-milk-100/80 dark:border-dark-border',
        'bg-white dark:bg-dark-card shadow-card',
        'animate-fade-in active:scale-[0.98] transition-transform',
        'cursor-pointer'
      )}
    >
      {/* Gradient header */}
      <div className={cn('px-3 pt-3 pb-2 bg-gradient-to-r', config.gradient)}>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="w-3.5 h-3.5 text-white/90" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-white/90 tracking-wide">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl drop-shadow-sm">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
            {item.subtitle && (
              <p className="text-[11px] text-white/80 truncate">{item.subtitle}</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-milk-700 dark:text-milk-300 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Tags / metadata */}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.bestSeason && (
            <span className={cn(
              'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
              config.bgAccent, config.textAccent
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

        {/* Tap hint */}
        <p className="text-[9px] text-milk-400 dark:text-milk-500 mt-1.5 text-right">
          点击查看攻略 →
        </p>
      </div>
    </button>
  )
}

/**
 * Bottom sheet detail for a recommendation item.
 */
export function RecDetailSheet({ item, type, onClose }) {
  if (!item) return null

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.travel
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl animate-slide-up max-h-[80dvh] overflow-y-auto">
        {/* Close handle */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-card pt-3 px-4">
          <div className="flex justify-center mb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/20" />
          </div>
        </div>

        {/* Gradient hero */}
        <div className={cn('mx-4 mb-4 rounded-2xl bg-gradient-to-r p-5', config.gradient)}>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon className="w-4 h-4 text-white/90" />
            <span className="text-xs font-semibold text-white/90">{config.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow-md">{item.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{item.title}</h2>
              {item.subtitle && <p className="text-sm text-white/80 mt-0.5">{item.subtitle}</p>}
            </div>
          </div>
          {/* Meta badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.bestSeason && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{item.bestSeason}</span>
            )}
            {item.budget && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">预算 {item.budget}</span>
            )}
            {item.year && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{item.year}</span>
            )}
            {item.rating && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 text-white font-medium">★ {item.rating}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="px-5 pb-4">
          <p className="text-sm text-milk-700 dark:text-milk-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Travel-specific detail sections */}
        {type === 'travel' && (
          <div className="px-5 pb-6 space-y-4">
            {/* Best for */}
            {item.bestFor && (
              <div className={cn('p-3.5 rounded-xl', config.bgAccent)}>
                <p className="text-xs text-milk-600 dark:text-milk-400 font-medium mb-1">适合谁去</p>
                <p className="text-sm text-milk-800 dark:text-milk-200">{item.bestFor}</p>
              </div>
            )}

            {/* Must do */}
            {item.mustDo && item.mustDo.length > 0 && (
              <div>
                <p className="text-xs text-milk-500 dark:text-milk-400 font-semibold mb-2 tracking-wide">必做清单</p>
                <div className="space-y-1.5">
                  {item.mustDo.map((task, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-milk-50 dark:bg-dark-surface/50">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-apricot-300 to-tulip-300 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{i + 1}</span>
                      <span className="text-sm text-milk-700 dark:text-milk-300">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food recommendation */}
            {item.foodRec && (
              <div className="p-3.5 rounded-xl bg-peach-50 dark:bg-peach-900/20">
                <p className="text-xs text-milk-500 dark:text-milk-400 font-medium mb-1">美食推荐</p>
                <p className="text-sm text-milk-800 dark:text-milk-200">{item.foodRec}</p>
              </div>
            )}

            {/* Tips */}
            {item.tips && (
              <div className="p-3.5 rounded-xl bg-milk-50 dark:bg-dark-surface/50">
                <p className="text-xs text-milk-500 dark:text-milk-400 font-medium mb-1">小贴士</p>
                <p className="text-sm text-milk-700 dark:text-milk-300 leading-relaxed">{item.tips}</p>
              </div>
            )}
          </div>
        )}

        {/* Seasonal-specific detail sections */}
        {type === 'seasonal' && (
          <div className="px-5 pb-6 space-y-4">
            {/* How to */}
            {item.howTo && (
              <div>
                <p className="text-xs text-milk-500 dark:text-milk-400 font-semibold mb-2 tracking-wide">怎么做</p>
                <p className="text-sm text-milk-700 dark:text-milk-300 leading-relaxed">{item.howTo}</p>
              </div>
            )}

            {/* Preparation */}
            {item.prepare && item.prepare.length > 0 && (
              <div>
                <p className="text-xs text-milk-500 dark:text-milk-400 font-semibold mb-2 tracking-wide">需要准备</p>
                <div className="flex flex-wrap gap-2">
                  {item.prepare.map((p, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400 font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo tip */}
            {item.photoTip && (
              <div className="p-3.5 rounded-xl bg-apricot-50 dark:bg-apricot-900/20">
                <p className="text-xs text-milk-500 dark:text-milk-400 font-medium mb-1">拍照建议</p>
                <p className="text-sm text-milk-800 dark:text-milk-200">{item.photoTip}</p>
              </div>
            )}
          </div>
        )}

        {/* Watch-specific detail sections */}
        {type === 'watch' && (
          <div className="px-5 pb-6 space-y-4">
            {/* Why watch */}
            {item.whyWatch && (
              <div>
                <p className="text-xs text-milk-500 dark:text-milk-400 font-semibold mb-2 tracking-wide">为什么推荐</p>
                <p className="text-sm text-milk-700 dark:text-milk-300 leading-relaxed">{item.whyWatch}</p>
              </div>
            )}

            {/* Snack pairing */}
            {item.snackRec && (
              <div className="p-3.5 rounded-xl bg-peach-50 dark:bg-peach-900/20">
                <p className="text-xs text-milk-500 dark:text-milk-400 font-medium mb-1">搭配零食</p>
                <p className="text-sm text-milk-800 dark:text-milk-200">{item.snackRec}</p>
              </div>
            )}

            {/* Similar recommendations */}
            {item.similarRec && (
              <div className="p-3.5 rounded-xl bg-milk-50 dark:bg-dark-surface/50">
                <p className="text-xs text-milk-500 dark:text-milk-400 font-medium mb-1">喜欢还可以看</p>
                <p className="text-sm text-milk-700 dark:text-milk-300">{item.similarRec}</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom safe padding */}
        <div className="h-8" />
      </div>
    </div>
  )
}
