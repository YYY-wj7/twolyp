import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Download, Trash2, Camera, ChevronRight, LogOut, Copy, Check, Users } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const MENU_ITEMS = [
  { icon: Camera, label: '年度报告', desc: '回顾这一年的故事', to: '/annual-report' },
  { icon: Trash2, label: '回收站', desc: '31天内可恢复', to: '/recycle-bin' },
  { icon: Download, label: '导出数据', desc: '备份所有照片和记录', to: '/data-export' },
  { icon: Settings, label: '设置', desc: '账号、隐私、加密', to: '/settings' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, gardenId, inviteCode, garden, logout } = useAuth()
  const [stats, setStats] = useState({ records: 0, photos: 0 })
  const [copied, setCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [memberName, setMemberName] = useState(null)

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      if (!gardenId) return
      try {
        const [{ count: recordCount }, { count: mediaCount }] = await Promise.all([
          supabase.from('records').select('*', { count: 'exact', head: true }).eq('garden_id', gardenId).eq('is_deleted', false),
          supabase.from('media').select('id', { count: 'exact', head: true }).in('record_id',
            (await supabase.from('records').select('id').eq('garden_id', gardenId).eq('is_deleted', false)).data?.map(r => r.id) || []
          ),
        ])

        setStats({
          records: recordCount || 0,
          photos: mediaCount || 0,
        })
      } catch (e) {
        console.warn('Failed to fetch stats:', e)
      }
    }
    fetchStats()
  }, [gardenId])

  // Fetch other member's name
  useEffect(() => {
    async function fetchMember() {
      if (!gardenId || !user) return
      try {
        const { data: members } = await supabase
          .from('garden_members')
          .select('user_id, profiles(nickname, email)')
          .eq('garden_id', gardenId)
          .neq('user_id', user.id)

        if (members?.[0]?.profiles) {
          setMemberName(members[0].profiles.nickname || members[0].profiles.email?.split('@')[0] || null)
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
    if (!confirm('确定退出登录吗？')) return
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setLoggingOut(false)
    }
  }

  const isOwner = garden?.created_by === user?.id
  const displayName = user?.nickname || user?.email?.split('@')[0] || 'User'

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
            {displayName[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-milk-900 dark:text-milk-100">
              {displayName}
            </h2>
            <p className="text-sm text-milk-500 dark:text-milk-400">
              {user?.email || ''}
            </p>
            {memberName && (
              <p className="text-xs text-apricot-500 dark:text-apricot-400 mt-0.5 flex items-center gap-1">
                <Users className="w-3 h-3" />
                和 {memberName} 的花园
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around mt-5 pt-4 border-t border-milk-200 dark:border-dark-border">
          {[
            { label: '记录', value: stats.records },
            { label: '照片', value: stats.photos },
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

      {/* Invite code card (only for garden creator) */}
      {isOwner && inviteCode && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-apricot-50 to-tulip-50 dark:from-dark-card dark:to-dark-card border border-apricot-200/50 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-apricot-600 dark:text-apricot-400 font-medium mb-1">
                邀请 TA 加入花园
              </p>
              <p className="text-2xl font-bold tracking-[0.3em] text-milk-900 dark:text-milk-100">
                {inviteCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                copied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-apricot-400 text-white active:scale-95'
              )}
            >
              {copied ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制</>}
            </button>
          </div>
          <p className="text-xs text-milk-500 dark:text-milk-400 mt-2">
            把这个邀请码发给 TA，TA 注册时输入即可加入你们的花园
          </p>
        </div>
      )}

      {/* Menu list */}
      <div className="mx-4 mt-4 rounded-2xl bg-white dark:bg-dark-card border border-milk-100 dark:border-dark-border overflow-hidden">
        {MENU_ITEMS.map((item) => {
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
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm text-milk-500 hover:text-tulip-500 dark:text-milk-400 dark:hover:text-tulip-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? '退出中...' : '退出登录'}
        </button>
      </div>
    </div>
  )
}
