import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'

/**
 * Animated splash screen shown while the app is loading.
 * Fades out once the app is ready.
 */
export default function SplashScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1200)
    const remove = setTimeout(() => onDone?.(), 1700)
    return () => { clearTimeout(timer); clearTimeout(remove) }
  }, [onDone])

  return (
    <div className={cn(
      'fixed inset-0 z-[100] flex flex-col items-center justify-center',
      'bg-gradient-to-b from-milk-50 to-apricot-50 dark:from-dark-bg dark:to-dark-card',
      'transition-opacity duration-500',
      fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
    )}>
      {/* Tulip icon with pulse */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-coral-400 to-apricot-500 flex items-center justify-center shadow-lg shadow-coral-400/30 animate-pulse">
          <svg viewBox="0 0 96 96" className="w-12 h-12" fill="none">
            <path d="M48 19c-5.8 0-11 5.7-13.2 13.7C28.9 26.4 22 25.1 17 28.8c.6 22.8 10.8 36.4 31 40.7 20.2-4.3 30.4-17.9 31-40.7-5-3.7-11.9-2.4-17.8 3.9C59 24.7 53.8 19 48 19Z" fill="white" />
            <path d="M46.2 68.4v8c0 2-1 3.5-3 4.5M49.8 68.4v8c0 2 1 3.5 3 4.5" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
          </svg>
        </div>
        {/* Decorative rings */}
        <div className="absolute -inset-3 rounded-3xl border-2 border-coral-200/30 dark:border-coral-800/20 animate-ping" style={{ animationDuration: '2s' }} />
      </div>

      {/* App name */}
      <h1 className="text-2xl font-bold text-milk-800 dark:text-milk-200 tracking-wider">
        TwoLyp
      </h1>
      <p className="text-xs text-milk-500 dark:text-milk-400 mt-2 tracking-wide">
        Two of us, one garden
      </p>

      {/* Loading dots */}
      <div className="flex items-center gap-1.5 mt-8">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-coral-400 dark:bg-coral-500"
            style={{
              animation: 'bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}
