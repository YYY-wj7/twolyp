import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Map, Heart, User, Plus, Plane } from 'lucide-react'
import { cn } from '../lib/utils'

const NAV_ITEMS = [
  { to: '/feed', icon: Home, label: '首页' },
  { to: '/map', icon: Map, label: '足迹' },
  { to: '/create', icon: Plus, label: '', isCreate: true },
  { to: '/wishlist', icon: Plane, label: '心愿' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-dvh flex flex-col bg-milk-50 dark:bg-dark-bg transition-theme">
      {/* Floating tulip decorations */}
      <div className="tulip-float-deco top-right">🌷</div>
      <div className="tulip-float-deco bottom-left">🌷</div>

      {/* Main content area */}
      <main className="flex-1 relative z-10 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="glass dark:glass-dark border-t border-milk-200/60 dark:border-dark-border/60">
          <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
            {NAV_ITEMS.map((item) => {
              // Special create button (FAB)
              if (item.isCreate) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full gradient-coral text-white glow-coral active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                  </NavLink>
                )
              }

              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 w-14 h-full relative transition-all duration-200',
                    isActive && 'nav-pill-active'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-200',
                      isActive
                        ? 'text-apricot-500 dark:text-apricot-400'
                        : 'text-milk-500 dark:text-milk-600'
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className={cn(
                    'text-[10px] leading-tight transition-all duration-200',
                    isActive
                      ? 'text-apricot-600 dark:text-apricot-400 font-semibold'
                      : 'text-milk-500 dark:text-milk-600 font-medium'
                  )}>
                    {item.label}
                  </span>
                  {/* Active dot indicator */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-apricot-400" />
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
