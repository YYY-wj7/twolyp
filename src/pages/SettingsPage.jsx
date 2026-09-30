import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Lock, Bell, Shield, Palette, Globe, ChevronRight, Check, Pencil } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const SETTING_SECTIONS = [
  {
    title: '账号',
    items: [
      { icon: Lock, label: '安全设置', desc: '密码、两步验证' },
    ],
  },
  {
    title: '隐私',
    items: [
      { icon: Shield, label: '加密暗号', desc: '修改共享加密密钥' },
      { icon: Bell, label: '通知设置', desc: '管理推送和提醒' },
    ],
  },
  {
    title: '外观',
    items: [
      { icon: Palette, label: '主题', desc: '跟随系统' },
      { icon: Globe, label: '语言', desc: '简体中文' },
    ],
  },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [editingNickname, setEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [saving, setSaving] = useState(false)

  const handleSaveNickname = async () => {
    const trimmed = nickname.trim()
    if (!trimmed || trimmed === user?.nickname) {
      setEditingNickname(false)
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: trimmed })
        .eq('id', user.id)

      if (error) throw error
      setEditingNickname(false)
    } catch (err) {
      console.error('Failed to save nickname:', err)
    } finally {
      setSaving(false)
    }
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
            设置
          </h1>
        </div>
      </header>

      <div className="px-4 mt-2 space-y-6 pb-8">
        {/* Profile card with nickname editing */}
        <div>
          <h2 className="text-xs font-medium text-milk-500 dark:text-milk-400 uppercase tracking-wider mb-2 px-1">
            个人资料
          </h2>
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <User className="w-5 h-5 text-apricot-500" />
              <div className="flex-1 text-left">
                <span className="text-sm text-milk-900 dark:text-milk-100">
                  昵称
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editingNickname ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                      autoFocus
                      className={cn(
                        'w-28 h-7 px-2 rounded-lg text-sm text-right',
                        'bg-milk-50 dark:bg-dark-surface',
                        'border border-milk-200 dark:border-dark-border',
                        'text-milk-900 dark:text-milk-100',
                        'focus:outline-none focus:ring-1 focus:ring-apricot-300'
                      )}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNickname()
                        if (e.key === 'Escape') {
                          setNickname(user?.nickname || '')
                          setEditingNickname(false)
                        }
                      }}
                    />
                    <button
                      onClick={handleSaveNickname}
                      disabled={saving}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-apricot-100 dark:bg-apricot-400/10 text-apricot-500 active:scale-95 transition-transform"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNickname(true)}
                    className="flex items-center gap-1.5"
                  >
                    <span className="text-sm text-milk-600 dark:text-milk-300">
                      {user?.nickname || '未设置'}
                    </span>
                    <Pencil className="w-3.5 h-3.5 text-milk-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other settings sections */}
        {SETTING_SECTIONS.map(section => (
          <div key={section.title}>
            <h2 className="text-xs font-medium text-milk-500 dark:text-milk-400 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border overflow-hidden">
              {section.items.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-3.5 hover:bg-milk-50 dark:hover:bg-dark-border transition-colors',
                      index > 0 && 'border-t border-milk-100 dark:border-dark-border'
                    )}
                  >
                    <Icon className="w-5 h-5 text-apricot-500" />
                    <div className="flex-1 text-left">
                      <span className="text-sm text-milk-900 dark:text-milk-100">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-milk-400">{item.desc}</span>
                      <ChevronRight className="w-4 h-4 text-milk-300" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* App info */}
        <div className="text-center pt-4">
          <p className="text-xs text-milk-400 dark:text-milk-500">
            TwoLyp v1.0.0
          </p>
          <p className="text-xs text-milk-300 dark:text-milk-600 mt-1">
            Two of us, one garden
          </p>
        </div>
      </div>
    </div>
  )
}
