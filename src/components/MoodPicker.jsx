import { useState, useEffect } from 'react'
import { cn, withTimeout } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

const MOODS = [
  { emoji: '😊', label: '开心' },
  { emoji: '😌', label: '平静' },
  { emoji: '🥰', label: '想念' },
  { emoji: '😤', label: '烦躁' },
  { emoji: '😢', label: '难过' },
]

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatToday() {
  const d = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
}

export default function MoodPicker() {
  const { user, gardenId } = useAuth()
  const [todayMood, setTodayMood] = useState(null) // my mood today
  const [partnerMood, setPartnerMood] = useState(null) // partner's mood today
  const [partnerName, setPartnerName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Fetch today's moods for both partners
  useEffect(() => {
    if (!gardenId || !user) return
    const today = getTodayKey()

    async function fetchMoods() {
      try {
        // Get partner info
        const { data: members } = await withTimeout(
          supabase.from('garden_members')
            .select('user_id, profiles(nickname)')
            .eq('garden_id', gardenId),
          8000
        )
        const partner = members?.find(m => m.user_id !== user.id)
        if (partner?.profiles) setPartnerName(partner.profiles.nickname || '对方')

        // Get today's mood records
        const { data: moodRecords } = await withTimeout(
          supabase.from('records')
            .select('author_id, content, custom_tags')
            .eq('garden_id', gardenId)
            .eq('is_deleted', false)
            .contains('custom_tags', ['mood'])
            .gte('recorded_at', today + 'T00:00:00')
            .lt('recorded_at', today + 'T23:59:59'),
          8000
        )

        if (moodRecords) {
          const mine = moodRecords.find(r => r.author_id === user.id)
          const theirs = moodRecords.find(r => r.author_id !== user.id)
          if (mine) setTodayMood(mine.content)
          if (theirs) setPartnerMood(theirs.content)
        }
      } catch (e) {
        console.warn('Failed to fetch moods:', e)
      } finally {
        setLoaded(true)
      }
    }
    fetchMoods()
  }, [gardenId, user])

  const handleSelectMood = async (mood) => {
    if (saving || todayMood || !gardenId || !user) return
    setSaving(true)
    try {
      const today = getTodayKey()
      const content = `${mood.emoji}${mood.label}`
      const { error } = await withTimeout(
        supabase.from('records').insert({
          garden_id: gardenId,
          author_id: user.id,
          title: '今日心情',
          content,
          category: 'custom',
          custom_tags: ['mood'],
          recorded_at: today + 'T12:00:00',
        }),
        8000
      )
      if (!error) {
        setTodayMood(content)
      }
    } catch (e) {
      console.warn('Failed to save mood:', e)
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  // Parse mood emoji from content string
  const myEmoji = todayMood ? todayMood.slice(0, 2) : null
  const partnerEmoji = partnerMood ? partnerMood.slice(0, 2) : null

  return (
    <div className="mx-4 mb-3 animate-fade-in">
      <div className={cn(
        'rounded-2xl px-4 py-3',
        'bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm',
        'border border-milk-100/60 dark:border-dark-border/60'
      )}>
        {/* Date + status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-milk-500 dark:text-milk-500 font-medium">{formatToday()}</span>
          {myEmoji && (
            <span className="text-[10px] text-apricot-500 dark:text-apricot-400 font-medium">
              已记录 ✓
            </span>
          )}
        </div>

        {/* Mood selection or result display */}
        {myEmoji ? (
          <div className="flex items-center gap-3">
            <span className="text-lg">{myEmoji}</span>
            <span className="text-sm text-milk-700 dark:text-milk-300">
              今天你选了 {myEmoji}
              {partnerEmoji && (
                <span className="ml-1">，{partnerName}选了 {partnerEmoji}</span>
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-milk-500 dark:text-milk-500 mr-1 shrink-0">今天心情</span>
            <div className="flex gap-1.5 flex-1">
              {MOODS.map(mood => (
                <button
                  key={mood.label}
                  onClick={() => handleSelectMood(mood)}
                  disabled={saving}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-200',
                    'hover:bg-apricot-50 dark:hover:bg-dark-surface active:scale-95',
                    saving && 'opacity-50'
                  )}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-[9px] text-milk-500 dark:text-milk-500">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Partner mood badge */}
        {partnerEmoji && !myEmoji && (
          <div className="mt-1.5 text-[11px] text-milk-500 dark:text-milk-500">
            {partnerName}今天选了 {partnerEmoji}
          </div>
        )}
      </div>
    </div>
  )
}
