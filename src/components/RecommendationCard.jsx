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
      <div className="px-3 py-3">
        <p className="text-[11px] text-milk-700 dark:text-milk-300 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Tags / metadata */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {item.bestSeason && (
            <span className={cn(
              'text-[9px] px-2 py-0.5 rounded-full font-medium',
              config.bgAccent, config.textAccent
            )}>
              {item.bestSeason}
            </span>
          )}
          {item.budget && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-milk-100 dark:bg-dark-surface text-milk-600 dark:text-milk-400">
              预算 {item.budget}
            </span>
          )}
          {item.year && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-milk-100 dark:bg-dark-surface text-milk-600 dark:text-milk-400">
              {item.year}
            </span>
          )}
          {item.rating && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-apricot-50 dark:bg-apricot-900/20 text-apricot-600 dark:text-apricot-300">
              ★ {item.rating}
            </span>
          )}
          {item.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-milk-100 dark:bg-dark-surface text-milk-600 dark:text-milk-400">
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className={cn(
          'mt-2.5 flex items-center justify-center gap-1 py-1.5 rounded-lg',
          'bg-gradient-to-r', config.gradient, 'bg-opacity-10',
        )}>
          <span className="text-[10px] font-semibold text-white/90">查看完整攻略</span>
          <ChevronRight className="w-3 h-3 text-white/90" />
        </div>
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
              <div className={cn('p-4 rounded-xl', config.bgAccent)}>
                <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>👫</span> <span className="text-milk-600 dark:text-milk-400">适合谁去</span>
                </p>
                <p className="text-sm text-milk-800 dark:text-milk-200 leading-relaxed">{item.bestFor}</p>
              </div>
            )}

            {/* Must do */}
            {item.mustDo && item.mustDo.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5 text-milk-600 dark:text-milk-400">
                  <span>✅</span> 必做清单
                </p>
                <div className="space-y-2">
                  {item.mustDo.map((task, i) => (
                    <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-milk-50 dark:bg-dark-surface/50 border border-milk-100/50 dark:border-dark-border/50">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-apricot-400 to-tulip-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">{i + 1}</span>
                      <span className="text-sm text-milk-800 dark:text-milk-200 font-medium">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food recommendation */}
            {item.foodRec && (
              <div className="p-4 rounded-xl bg-peach-50 dark:bg-peach-900/20 border border-peach-100/50 dark:border-peach-800/20">
                <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>🍜</span> <span className="text-milk-600 dark:text-milk-400">美食推荐</span>
                </p>
                <p className="text-sm text-milk-800 dark:text-milk-200 leading-relaxed">{item.foodRec}</p>
              </div>
            )}

            {/* Tips */}
            {item.tips && (
              <div className="p-4 rounded-xl bg-milk-50 dark:bg-dark-surface/50 border border-milk-100/50 dark:border-dark-border/50">
                <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>💡</span> <span className="text-milk-600 dark:text-milk-400">小贴士</span>
                </p>
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
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-milk-600 dark:text-milk-400">
                  <span>📋</span> 怎么做
                </p>
                <p className="text-sm text-milk-700 dark:text-milk-300 leading-relaxed">{item.howTo}</p>
              </div>
            )}

            {/* Preparation */}
            {item.prepare && item.prepare.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5 text-milk-600 dark:text-milk-400">
                  <span>🎒</span> 需要准备
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.prepare.map((p, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400 font-medium border border-sage-100/50 dark:border-sage-800/30">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo tip */}
            {item.photoTip && (
              <div className="p-4 rounded-xl bg-apricot-50 dark:bg-apricot-900/20 border border-apricot-100/50 dark:border-apricot-800/20">
                <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>📸</span> <span className="text-milk-600 dark:text-milk-400">拍照建议</span>
                </p>
                <p className="text-sm text-milk-800 dark:text-milk-200 leading-relaxed">{item.photoTip}</p>
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
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-milk-600 dark:text-milk-400">
                  <span>💕</span> 为什么推荐一起看
                </p>
                <p className="text-sm text-milk-700 dark:text-milk-300 leading-relaxed">{item.whyWatch}</p>
              </div>
            )}

            {/* Snack pairing */}
            {item.snackRec && (
              <div className="p-4 rounded-xl bg-peach-50 dark:bg-peach-900/20 border border-peach-100/50 dark:border-peach-800/20">
                <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>🍿</span> <span className="text-milk-600 dark:text-milk-400">搭配零食</span>
                </p>
                <p className="text-sm text-milk-800 dark:text-milk-200 leading-relaxed">{item.snackRec}</p>
              </div>
            )}

            {/* Similar recommendations */}
            {item.similarRec && (
              <div className="p-4 rounded-xl bg-milk-50 dark:bg-dark-surface/50 border border-milk-100/50 dark:border-dark-border/50">
                <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <span>🎬</span> <span className="text-milk-600 dark:text-milk-400">喜欢还可以看</span>
                </p>
                <p className="text-sm text-milk-700 dark:text-milk-300 leading-relaxed">{item.similarRec}</p>
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
