import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Trash2, Settings, ChevronRight, LogOut, Copy, Check, Users, Heart, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, daysTogether, withTimeout } from '../lib/utils'

const MENU_ITEMS = [
  { icon: Camera, label: '年度报告', desc: '回顾这一年的故事', to: '/annual-report', color: 'text-peach-400' },
  { icon: Trash2, label: '回收站', desc: '31天内可恢复', to: '/recycle-bin', color: 'text-milk-500' },
  { icon: Settings, label: '设置', desc: '账号、隐私、通知', to: '/settings', color: 'text-apricot-400' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, gardenId, inviteCode, garden, logout } = useAuth()
  const [stats, setStats] = useState({ records: 0, photos: 0 })
  const [copied, setCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [memberName, setMemberName] = useState(null)
  const [daysCount, setDaysCount] = useState(0)

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      if (!gardenId) return
      try {
        const { data: recs } = await withTimeout(
          supabase.from('records').select('id').eq('garden_id', gardenId).eq('is_deleted', false),
          15000, '记录列表'
        )
        const recordIds = (recs || []).map(r => r.id)
        const recordCount = recordIds.length

        let mediaCount = 0
        if (recordIds.length > 0) {
          const { count } = await withTimeout(
            supabase.from('media').select('id', { count: 'exact', head: true }).in('record_id', recordIds),
            15000, '媒体统计'
          )
          mediaCount = count || 0
        }

        setStats({ records: recordCount, photos: mediaCount })
      } catch (e) {
        console.warn('Failed to fetch stats:', e)
      }
    }
    fetchStats()
  }, [gardenId])

  // Fetch partner + days count
  useEffect(() => {
    async function fetchMember() {
      if (!gardenId || !user) return
      try {
        const { data: members } = await withTimeout(
          supabase
            .from('garden_members')
            .select('user_id, profiles(nickname, email)')
            .eq('garden_id', gardenId)
            .neq('user_id', user.id),
          15000,
          '成员信息'
        )
        if (members?.[0]?.profiles) {
          setMemberName(members[0].profiles.nickname || members[0].profiles.email?.split('@')[0] || null)
        }

        // Days together
        const { data: anns } = await withTimeout(
          supabase.from('anniversaries').select('date').eq('garden_id', gardenId).order('date').limit(1),
          10000, '纪念日'
        )
        if (anns?.[0]?.date) {
          const d = new Date(anns[0].date)
          setDaysCount(Math.max(0, Math.floor((Date.now() - d) / 86400000)))
        }
      } catch (e) { /* ignore */ }
    }
    fetchMember()
  }, [gardenId, user])

  const handleCopyCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) { /* ignore */ }
  }

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true)
      return
    }
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setLoggingOut(false)
      setConfirmLogout(false)
    }
  }

  const isOwner = garden?.created_by === user?.id
  const displayName = user?.nickname || user?.email?.split('@')[0] || 'User'

  return (
    <div className="relative z-10 animate-page-enter">
      <header className="sticky top-0 z-40 glass dark:glass-dark safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-milk-900 dark:text-milk-100">
            我的
          </h1>
        </div>
      </header>

      {/* Premium profile card with gradient header */}
      <div className="mx-4 mt-2 rounded-2xl overflow-hidden shadow-card border border-milk-100 dark:border-dark-border">
        {/* Gradient header background */}
        <div className="gradient-hero h-24 relative">
          {/* Decorative circles */}
          <div className="absolute top-3 right-6 w-16 h-16 rounded-full bg-white/10" />
          <div className="absolute top-8 right-16 w-8 h-8 rounded-full bg-white/10" />
          <div className="absolute top-2 left-8 w-6 h-6 rounded-full bg-white/10" />
        </div>

        {/* Profile info (overlapping gradient) */}
        <div className="bg-white dark:bg-dark-card px-5 pb-5 -mt-10 relative">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-apricot-300 via-apricot-400 to-tulip-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-dark-card">
            {displayName[0]?.toUpperCase() || 'U'}
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-bold text-milk-900 dark:text-milk-100">
              {displayName}
            </h2>
            <p className="text-sm text-milk-500 dark:text-milk-400 mt-0.5">
              {user?.email || ''}
            </p>
            {memberName && (
              <p className="text-xs text-apricot-500 dark:text-apricot-400 mt-1 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" />
                和 {memberName} 的花园
                {daysCount > 0 && <span className="text-milk-400 dark:text-milk-500">· {daysCount}天</span>}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-milk-100 dark:border-dark-border">
            {[
              { label: '记录', value: stats.records, icon: '📝' },
              { label: '照片', value: stats.photos, icon: '📷' },
              { label: '天数', value: daysCount, icon: '💕' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-milk-900 dark:text-milk-100">
                  {stat.value}
                </div>
                <div className="text-xs text-milk-500 dark:text-milk-400 mt-0.5 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite code card */}
      {isOwner && inviteCode && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-apricot-50 via-tulip-50 to-peach-50 dark:from-dark-card dark:to-dark-card border border-apricot-200/50 dark:border-dark-border shadow-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-apricot-600 dark:text-apricot-400 font-medium mb-1">
                邀请 TA 加入花园
              </p>
              <p className="text-2xl font-bold tracking-[0.25em] text-milk-900 dark:text-milk-100 font-mono">
                {inviteCode}
              </p>
              <p className="text-[11px] text-milk-500 dark:text-milk-400 mt-1.5">
                把这个邀请码发给 TA，注册时输入即可加入
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className={cn(
                'flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium transition-all shrink-0',
                copied
                  ? 'bg-sage-100 dark:bg-sage-600/20 text-sage-600 dark:text-sage-400'
                  : 'bg-apricot-400 text-white active:scale-95 shadow-sm'
              )}
            >
              {copied ? <><Check className="w-3.5 h-3.5" />已复制</> : <><Copy className="w-3.5 h-3.5" />复制</>}
            </button>
          </div>
        </div>
      )}

      {/* Menu list */}
      <div className="mx-4 mt-4 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border shadow-card overflow-hidden">
        {MENU_ITEMS.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3.5 hover:bg-milk-50 dark:hover:bg-dark-border transition-colors',
                idx > 0 && 'border-t border-milk-100 dark:border-dark-border/50'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-apricot-50 dark:bg-dark-border flex items-center justify-center">
                <Icon className={cn('w-[18px] h-[18px]', item.color)} />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-milk-900 dark:text-milk-100">
                  {item.label}
                </span>
                <p className="text-[11px] text-milk-500 dark:text-milk-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-milk-400 dark:text-milk-600" />
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <div className="mx-4 mt-4 mb-8">
        {confirmLogout ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmLogout(false)}
              disabled={loggingOut}
              className="flex-1 py-3 rounded-2xl text-sm font-medium text-milk-600 dark:text-milk-400 bg-white dark:bg-dark-card border border-milk-200 dark:border-dark-border active:scale-95 transition-transform"
            >
              取消
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex-1 py-3 rounded-2xl text-sm font-medium text-white bg-tulip-500 hover:bg-tulip-600 active:scale-95 transition-all"
            >
              {loggingOut ? '退出中...' : '确认退出'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-milk-500 dark:text-milk-400 hover:text-tulip-500 dark:hover:text-tulip-400 hover:bg-tulip-50 dark:hover:bg-dark-card transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        )}
      </div>
    </div>
  )
}
