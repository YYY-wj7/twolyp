import { useState, useEffect } from 'react'
import { cn, withTimeout } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

const MOODS = [
  { emoji: '😊', label: '开心', color: 'from-amber-100 to-yellow-50', darkColor: 'dark:from-amber-900/30 dark:to-yellow-900/20', accent: 'text-amber-500', ring: 'ring-amber-300/50' },
  { emoji: '😌', label: '平静', color: 'from-sage-100 to-emerald-50', darkColor: 'dark:from-sage-900/30 dark:to-emerald-900/20', accent: 'text-sage-500', ring: 'ring-sage-300/50' },
  { emoji: '🥰', label: '想念', color: 'from-apricot-100 to-pink-50', darkColor: 'dark:from-apricot-900/30 dark:to-pink-900/20', accent: 'text-apricot-500', ring: 'ring-apricot-300/50' },
  { emoji: '😤', label: '烦躁', color: 'from-orange-100 to-red-50', darkColor: 'dark:from-orange-900/30 dark:to-red-900/20', accent: 'text-orange-500', ring: 'ring-orange-300/50' },
  { emoji: '😢', label: '难过', color: 'from-blue-100 to-indigo-50', darkColor: 'dark:from-blue-900/30 dark:to-indigo-900/20', accent: 'text-blue-500', ring: 'ring-blue-300/50' },
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
  const [todayMood, setTodayMood] = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  const [partnerName, setPartnerName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [selectedAnim, setSelectedAnim] = useState(false)

  useEffect(() => {
    if (!gardenId || !user) return
    const today = getTodayKey()

    async function fetchMoods() {
      try {
        const { data: members } = await withTimeout(
          supabase.from('garden_members')
            .select('user_id, profiles(nickname)')
            .eq('garden_id', gardenId),
          8000
        )
        const partner = members?.find(m => m.user_id !== user.id)
        if (partner?.profiles) setPartnerName(partner.profiles.nickname || '对方')

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
    setSaveError('')
    setSelectedAnim(true)
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
      if (error) {
        setSaveError('保存失败，请重试')
        setSelectedAnim(false)
      } else {
        setTodayMood(content)
      }
    } catch (e) {
      setSaveError('网络异常，请重试')
      setSelectedAnim(false)
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  const extractEmoji = (str) => str ? Array.from(str).slice(0, 1).join('') : null
  const myEmoji = extractEmoji(todayMood)
  const partnerEmoji = extractEmoji(partnerMood)
  const myMood = MOODS.find(m => myEmoji === m.emoji)
  const partnerMoodObj = MOODS.find(m => partnerEmoji === m.emoji)

  return (
    <div className="mx-4 mb-3 animate-fade-in">
      <div className={cn(
        'rounded-2xl overflow-hidden',
        'bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl',
        'border border-milk-100/60 dark:border-dark-border/60',
        'shadow-sm'
      )}>
        {/* Gradient top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-apricot-300 via-tulip-300 to-apricot-300" />

        <div className="px-4 py-3.5">
          {/* Date + status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-apricot-50 dark:bg-apricot-900/20 text-apricot-500 dark:text-apricot-400 font-semibold tracking-wide">
                {formatToday()}
              </span>
            </div>
            {myEmoji && (
              <span className="text-[10px] text-sage-500 dark:text-sage-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                已记录
              </span>
            )}
          </div>

          {/* Error feedback */}
          {saveError && (
            <div className="mb-2.5 text-[11px] text-tulip-500 bg-tulip-50 dark:bg-tulip-900/20 px-3 py-2 rounded-xl">
              {saveError}
            </div>
          )}

          {/* Mood selection or result display */}
          {myEmoji ? (
            <div className="space-y-2.5">
              {/* My mood result */}
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'bg-gradient-to-r', myMood?.color || 'from-gray-50 to-gray-100',
                myMood?.darkColor || ''
              )}>
                <span className="text-2xl">{myEmoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-milk-800 dark:text-milk-200">
                    今天心情是 <span className={myMood?.accent || ''}>{myMood?.label}</span>
                  </p>
                </div>
              </div>

              {/* Partner mood */}
              {partnerEmoji && (
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'bg-gradient-to-r', partnerMoodObj?.color || 'from-gray-50 to-gray-100',
                  partnerMoodObj?.darkColor || '',
                  'opacity-80'
                )}>
                  <span className="text-2xl">{partnerEmoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-milk-700 dark:text-milk-300">
                      <span className="font-medium">{partnerName}</span> 今天
                      <span className={cn('ml-1 font-medium', partnerMoodObj?.accent || '')}>{partnerMoodObj?.label}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-milk-500 dark:text-milk-400 mb-2.5 font-medium">今天心情怎么样？</p>
              <div className="flex gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood.label}
                    onClick={() => handleSelectMood(mood)}
                    disabled={saving}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300',
                      'bg-gradient-to-b', mood.color, mood.darkColor,
                      'hover:scale-105 active:scale-95',
                      'border border-transparent hover:border-white/50 dark:hover:border-white/10',
                      saving && 'opacity-50 cursor-not-allowed',
                      selectedAnim && saving && 'animate-gentle-pulse'
                    )}
                  >
                    <span className="text-xl drop-shadow-sm">{mood.emoji}</span>
                    <span className="text-[10px] text-milk-600 dark:text-milk-400 font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Partner mood badge (when I haven't picked yet) */}
          {partnerEmoji && !myEmoji && (
            <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-50 dark:bg-dark-surface/50">
              <span className="text-sm">{partnerEmoji}</span>
              <span className="text-[11px] text-milk-500 dark:text-milk-400">
                {partnerName}今天选了 <span className="font-medium text-milk-700 dark:text-milk-300">{partnerMoodObj?.label || partnerEmoji}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
