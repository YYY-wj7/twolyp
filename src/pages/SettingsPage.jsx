import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Lock, Bell, Shield, Palette, Globe, ChevronRight, Check, Pencil, Loader2, X, Eye, EyeOff, Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { db } from '../contexts/AppContext'
import { cn, withTimeout } from '../lib/utils'

/* ── Theme options ── */
const THEME_OPTIONS = [
  { id: 'light', label: '浅色', icon: Sun },
  { id: 'dark', label: '深色', icon: Moon },
  { id: 'system', label: '跟随系统', icon: Monitor },
]

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('force-dark')
    root.classList.remove('force-light')
  } else if (theme === 'light') {
    root.classList.add('force-light')
    root.classList.remove('force-dark')
  } else {
    root.classList.remove('force-dark', 'force-light')
  }
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Nickname state
  const [editingNickname, setEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [savedNickname, setSavedNickname] = useState(user?.nickname || '')
  const [savingNickname, setSavingNickname] = useState(false)
  const [nicknameError, setNicknameError] = useState(null)
  const [nicknameSuccess, setNicknameSuccess] = useState(null)

  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(null)

  // Theme state
  const [theme, setTheme] = useState('system')
  const [showThemePicker, setShowThemePicker] = useState(false)

  // Notification state
  const [notifPermission, setNotifPermission] = useState(Notification?.permission || 'default')

  // Load theme preference on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const entry = await db.appSettings.get('theme-preference')
        const saved = entry?.value || 'system'
        setTheme(saved)
        applyTheme(saved)
      } catch (e) { /* ignore */ }
    }
    loadTheme()
  }, [])

  // Save theme preference
  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    setShowThemePicker(false)
    try {
      await db.appSettings.put({ key: 'theme-preference', value: newTheme })
    } catch (e) { /* ignore */ }
  }

  // Nickname handlers
  const handleSaveNickname = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) { setNicknameError('昵称不能为空'); return }
    if (trimmed === savedNickname) { setEditingNickname(false); return }

    setSavingNickname(true)
    setNicknameError(null)
    setNicknameSuccess(null)
    try {
      const { error } = await withTimeout(
        supabase.from('profiles').update({ nickname: trimmed }).eq('id', user.id),
        15000, '保存昵称'
      )
      if (error) throw error
      setSavedNickname(trimmed)
      setEditingNickname(false)
      setNicknameSuccess('昵称已更新')
      setTimeout(() => setNicknameSuccess(null), 3000)
    } catch (err) {
      setNicknameError(err.message || '保存失败，请稍后重试')
    } finally {
      setSavingNickname(false)
    }
  }

  const handleCancelEdit = () => {
    setNickname(savedNickname)
    setEditingNickname(false)
    setNicknameError(null)
  }

  // Password change handler
  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword.length < 8) {
      setPasswordError('新密码至少需要 8 位')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    setSavingPassword(true)
    try {
      const { error } = await withTimeout(
        supabase.auth.updateUser({ password: newPassword }),
        15000, '修改密码'
      )
      if (error) throw error
      setPasswordSuccess('密码修改成功')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(null)
      }, 1500)
    } catch (err) {
      setPasswordError(err.message || '修改失败，请稍后重试')
    } finally {
      setSavingPassword(false)
    }
  }

  // Notification permission request
  const handleNotifToggle = async () => {
    if (notifPermission === 'granted') return
    try {
      const result = await Notification.requestPermission()
      setNotifPermission(result)
    } catch (e) { /* ignore */ }
  }

  const currentThemeOption = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[2]
  const CurrentThemeIcon = currentThemeOption.icon

  return (
    <div className="relative z-10 animate-page-enter">
      <header className="sticky top-0 z-40 glass dark:glass-dark safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-milk-200 dark:hover:bg-dark-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-milk-600 dark:text-milk-400" />
          </button>
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">设置</h1>
        </div>
      </header>

      <div className="px-4 mt-2 space-y-6 pb-8">

        {/* ── 个人资料 ── */}
        <div>
          <h2 className="text-xs font-medium text-milk-500 dark:text-milk-400 uppercase tracking-wider mb-2 px-1">个人资料</h2>
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center">
                <User className="w-[18px] h-[18px] text-apricot-400" />
              </div>
              <div className="flex-1"><span className="text-sm font-medium text-milk-900 dark:text-milk-100">昵称</span></div>
              <div className="flex items-center gap-2">
                {editingNickname ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                      maxLength={20} autoFocus disabled={savingNickname}
                      className={cn('w-28 h-8 px-2.5 rounded-xl text-sm text-right bg-milk-50 dark:bg-dark-surface border border-apricot-200 dark:border-dark-border text-milk-900 dark:text-milk-100 focus:outline-none focus:ring-2 focus:ring-apricot-300/50 transition-all', savingNickname && 'opacity-60')}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNickname() } if (e.key === 'Escape') handleCancelEdit() }}
                    />
                    <button type="button" onClick={handleSaveNickname} disabled={savingNickname || !nickname.trim()}
                      className={cn('w-8 h-8 flex items-center justify-center rounded-xl transition-all', savingNickname ? 'bg-milk-200' : !nickname.trim() ? 'bg-milk-200 opacity-50' : 'bg-apricot-400 text-white active:scale-95 shadow-sm')}>
                      {savingNickname ? <Loader2 className="w-4 h-4 animate-spin text-apricot-400" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={handleCancelEdit} disabled={savingNickname} className="w-8 h-8 flex items-center justify-center rounded-xl bg-milk-100 dark:bg-dark-border text-milk-500 active:scale-95">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingNickname(true)} className="flex items-center gap-1.5 py-1">
                    <span className="text-sm text-milk-700 dark:text-milk-300 font-medium">{savedNickname || '未设置'}</span>
                    <Pencil className="w-3.5 h-3.5 text-milk-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {nicknameError && <div className="mt-2 px-3 py-2 rounded-xl bg-tulip-50 dark:bg-tulip-900/20 border border-tulip-100"><p className="text-xs text-tulip-600 dark:text-tulip-400">{nicknameError}</p></div>}
          {nicknameSuccess && <div className="mt-2 px-3 py-2 rounded-xl bg-sage-50 dark:bg-sage-600/10 border border-sage-200"><p className="text-xs text-sage-600 dark:text-sage-400">{nicknameSuccess}</p></div>}
        </div>

        {/* ── 账号 ── */}
        <div>
          <h2 className="text-xs font-medium text-milk-500 dark:text-milk-400 uppercase tracking-wider mb-2 px-1">账号</h2>
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card overflow-hidden">
            <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-milk-50 dark:hover:bg-dark-border transition-colors">
              <div className="w-9 h-9 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center">
                <Lock className="w-[18px] h-[18px] text-apricot-400" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-milk-900 dark:text-milk-100">修改密码</span>
                <p className="text-[11px] text-milk-500 dark:text-milk-400">更新你的登录密码</p>
              </div>
              <ChevronRight className="w-4 h-4 text-milk-400" />
            </button>
          </div>
        </div>

        {/* ── 隐私 ── */}
        <div>
          <h2 className="text-xs font-medium text-milk-500 dark:text-milk-400 uppercase tracking-wider mb-2 px-1">隐私</h2>
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card overflow-hidden">
            {/* Notifications */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center">
                <Bell className="w-[18px] h-[18px] text-apricot-400" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-milk-900 dark:text-milk-100">消息通知</span>
                <p className="text-[11px] text-milk-500 dark:text-milk-400">
                  {notifPermission === 'granted' ? '已开启' : notifPermission === 'denied' ? '已被浏览器阻止' : '接收 TA 的新记录通知'}
                </p>
              </div>
              {notifPermission === 'granted' ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-sage-100 dark:bg-sage-600/20 text-sage-600 dark:text-sage-400 font-medium">已开启</span>
              ) : (
                <button onClick={handleNotifToggle} className="text-xs px-3 py-1.5 rounded-full gradient-coral text-white font-medium active:scale-95 transition-transform">
                  开启
                </button>
              )}
            </div>
            {/* Encryption - still coming soon */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-t border-milk-100 dark:border-dark-border/50 opacity-50">
              <div className="w-9 h-9 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center">
                <Shield className="w-[18px] h-[18px] text-apricot-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-milk-900 dark:text-milk-100">端到端加密</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-milk-200 dark:bg-dark-border text-milk-500 dark:text-milk-400 font-medium">开发中</span>
                </div>
                <p className="text-[11px] text-milk-500 dark:text-milk-400">记录数据全程加密传输</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 外观 ── */}
        <div>
          <h2 className="text-xs font-medium text-milk-500 dark:text-milk-400 uppercase tracking-wider mb-2 px-1">外观</h2>
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card overflow-hidden">
            {/* Theme picker */}
            <div className="relative">
              <button onClick={() => setShowThemePicker(!showThemePicker)} className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-milk-50 dark:hover:bg-dark-border transition-colors">
                <div className="w-9 h-9 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center">
                  <Palette className="w-[18px] h-[18px] text-apricot-400" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-milk-900 dark:text-milk-100">主题</span>
                  <p className="text-[11px] text-milk-500 dark:text-milk-400">{currentThemeOption.label}</p>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-milk-400 transition-transform', showThemePicker && 'rotate-180')} />
              </button>

              {showThemePicker && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 mx-2 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-milk-200 dark:border-dark-border overflow-hidden">
                  {THEME_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    return (
                      <button key={opt.id} onClick={() => handleThemeChange(opt.id)}
                        className={cn('flex items-center gap-3 w-full px-4 py-3 hover:bg-milk-50 dark:hover:bg-dark-border transition-colors', theme === opt.id && 'bg-apricot-50 dark:bg-apricot-400/10')}>
                        <Icon className={cn('w-4 h-4', theme === opt.id ? 'text-apricot-500' : 'text-milk-500')} />
                        <span className={cn('text-sm', theme === opt.id ? 'text-apricot-600 dark:text-apricot-400 font-medium' : 'text-milk-700 dark:text-milk-300')}>{opt.label}</span>
                        {theme === opt.id && <Check className="w-4 h-4 text-apricot-500 ml-auto" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {/* Language - still coming soon */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-t border-milk-100 dark:border-dark-border/50 opacity-50">
              <div className="w-9 h-9 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center">
                <Globe className="w-[18px] h-[18px] text-apricot-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-milk-900 dark:text-milk-100">语言</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-milk-200 dark:bg-dark-border text-milk-500 dark:text-milk-400 font-medium">开发中</span>
                </div>
                <p className="text-[11px] text-milk-500 dark:text-milk-400">目前仅支持简体中文</p>
              </div>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="text-center pt-4">
          <p className="text-xs text-milk-400 dark:text-milk-500 font-medium">TwoLyp v1.0.0</p>
          <p className="text-xs text-milk-300 dark:text-milk-600 mt-1">Two of us, one garden</p>
        </div>
      </div>

      {/* ── Password change modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !savingPassword && setShowPasswordModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-t-3xl p-6 pb-8 animate-slide-up shadow-2xl">
            <div className="w-10 h-1 rounded-full bg-milk-300 dark:bg-dark-border mx-auto mb-4" />
            <h3 className="text-lg font-bold text-milk-900 dark:text-milk-100 mb-5">修改密码</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-1.5 uppercase tracking-wider">新密码</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="至少 8 位" minLength={8}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-milk-50 dark:bg-dark-bg border border-milk-200 dark:border-dark-border text-sm text-milk-900 dark:text-milk-100 placeholder:text-milk-400 outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-200/30 transition-all" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-milk-400 hover:text-milk-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-milk-600 dark:text-milk-400 mb-1.5 uppercase tracking-wider">确认新密码</label>
                <input type={showPwd ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再输入一次"
                  className="w-full px-4 py-3 rounded-xl bg-milk-50 dark:bg-dark-bg border border-milk-200 dark:border-dark-border text-sm text-milk-900 dark:text-milk-100 placeholder:text-milk-400 outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-200/30 transition-all" />
              </div>
            </div>

            {passwordError && <div className="mt-3 px-3 py-2 rounded-xl bg-tulip-50 dark:bg-tulip-900/20"><p className="text-xs text-tulip-600 dark:text-tulip-400">{passwordError}</p></div>}
            {passwordSuccess && <div className="mt-3 px-3 py-2 rounded-xl bg-sage-50 dark:bg-sage-600/10"><p className="text-xs text-sage-600 dark:text-sage-400">{passwordSuccess}</p></div>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => !savingPassword && setShowPasswordModal(false)} className="flex-1 py-3 rounded-xl border border-milk-200 dark:border-dark-border text-sm font-medium text-milk-600 dark:text-milk-400 active:scale-95">取消</button>
              <button onClick={handlePasswordChange} disabled={!newPassword || !confirmPassword || savingPassword}
                className="flex-1 py-3 rounded-xl gradient-coral text-white text-sm font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2">
                {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                {savingPassword ? '保存中...' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
