import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Map, Heart, User, Plus } from 'lucide-react'
import { cn } from '../lib/utils'

const NAV_ITEMS = [
  { to: '/feed', icon: Home, label: '首页' },
  { to: '/map', icon: Map, label: '足迹' },
  { to: '/create', icon: Plus, label: '', isCreate: true },
  { to: '/anniversary', icon: Heart, label: '纪念日' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-dvh flex flex-col bg-milk-50 dark:bg-dark-bg transition-theme">
      {/* Main content area */}
      <main className="flex-1 relative z-10 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl border-t border-milk-200 dark:border-dark-border">
          <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
            {NAV_ITEMS.map((item) => {
              // Special create button
              if (item.isCreate) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-apricot-400 dark:bg-apricot-500 text-white shadow-lg shadow-apricot-400/30 active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                  </NavLink>
                )
              }

              const isActive = location.pathname === item.to
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center gap-0.5 w-14 h-full"
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive
                        ? 'text-apricot-500 dark:text-apricot-400'
                        : 'text-milk-500 dark:text-milk-600'
                    )}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className={cn(
                    'text-[10px] leading-tight transition-colors',
                    isActive
                      ? 'text-apricot-600 dark:text-apricot-400 font-medium'
                      : 'text-milk-500 dark:text-milk-600'
                  )}>
                    {item.label}
                  </span>
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
