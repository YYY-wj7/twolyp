import { useNavigate } from 'react-router-dom'
import { Settings, Download, Trash2, BookOpen, Camera, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'

const MENU_ITEMS = [
  { icon: Camera, label: '年度报告', desc: '回顾这一年的故事', to: '/annual-report' },
  { icon: Trash2, label: '回收站', desc: '31天内可恢复', to: '/recycle-bin' },
  { icon: Download, label: '导出数据', desc: '备份所有照片和记录', to: '/data-export' },
  { icon: Settings, label: '设置', desc: '账号、隐私、加密', to: '/settings' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="relative z-10">
      <header className="sticky top-0 z-40 bg-milk-50/80 dark:bg-dark-bg/80 backdrop-blur-xl safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            我的
          </h1>
        </div>
      </header>

      {/* Profile card */}
      <div className="mx-4 mt-2 p-5 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-apricot-300 to-tulip-300 flex items-center justify-center text-white text-2xl font-medium shadow-md">
            {user?.nickname?.[0] || 'Y'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-milk-900 dark:text-milk-100">
              {user?.nickname || 'YCH'}
            </h2>
            <p className="text-sm text-milk-500 dark:text-milk-400">
              {user?.email || 'ych@twolyp.app'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around mt-5 pt-4 border-t border-milk-200 dark:border-dark-border">
          {[
            { label: '记录', value: 42 },
            { label: '照片', value: 186 },
            { label: '城市', value: 5 },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-semibold text-milk-900 dark:text-milk-100">
                {stat.value}
              </div>
              <div className="text-xs text-milk-500 dark:text-milk-400 mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu list */}
      <div className="mx-4 mt-4 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border overflow-hidden">
        {MENU_ITEMS.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-milk-50 dark:hover:bg-dark-border transition-colors"
            >
              <Icon className="w-5 h-5 text-apricot-500" />
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-milk-900 dark:text-milk-100">
                  {item.label}
                </span>
                <p className="text-xs text-milk-500 dark:text-milk-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-milk-400" />
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <div className="mx-4 mt-4 mb-8">
        <button
          onClick={() => {/* TODO: logout */}}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm text-milk-500 hover:text-tulip-500 dark:text-milk-400 dark:hover:text-tulip-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  )
}
