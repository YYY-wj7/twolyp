import { useState, useEffect } from 'react'
import { cn, withTimeout } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

/* Cat sticker moods — SVG cat faces instead of emoji */
const MOODS = [
  {
    id: 'happy', label: '开心',
    color: 'from-amber-50 to-yellow-50', darkColor: 'dark:from-amber-900/20 dark:to-yellow-900/20',
    ringColor: 'ring-amber-300/60', accent: 'text-amber-600 dark:text-amber-400',
    face: (
      <svg viewBox="0 0 48 48" className="w-full h-full"><circle cx="24" cy="26" r="16" fill="#FFD97D" /><polygon points="10,14 6,4 16,10" fill="#FFD97D" /><polygon points="38,14 42,4 32,10" fill="#FFD97D" /><polygon points="10,14 8,6 14,11" fill="#FFBB5C" /><polygon points="38,14 40,6 34,11" fill="#FFBB5C" /><circle cx="18" cy="24" r="2.5" fill="#4A3728" /><circle cx="30" cy="24" r="2.5" fill="#4A3728" /><circle cx="19" cy="23" r="0.8" fill="white" /><circle cx="31" cy="23" r="0.8" fill="white" /><path d="M20 30 Q24 34 28 30" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" /><circle cx="14" cy="28" r="3" fill="#FFB5B5" opacity="0.4" /><circle cx="34" cy="28" r="3" fill="#FFB5B5" opacity="0.4" /><line x1="8" y1="24" x2="14" y2="25" stroke="#4A3728" strokeWidth="0.6" opacity="0.4" /><line x1="8" y1="27" x2="14" y2="27" stroke="#4A3728" strokeWidth="0.6" opacity="0.4" /><line x1="34" y1="25" x2="40" y2="24" stroke="#4A3728" strokeWidth="0.6" opacity="0.4" /><line x1="34" y1="27" x2="40" y2="27" stroke="#4A3728" strokeWidth="0.6" opacity="0.4" /></svg>
    ),
  },
  {
    id: 'calm', label: '平静',
    color: 'from-emerald-50 to-sage-50', darkColor: 'dark:from-emerald-900/20 dark:to-sage-900/20',
    ringColor: 'ring-emerald-300/60', accent: 'text-emerald-600 dark:text-emerald-400',
    face: (
      <svg viewBox="0 0 48 48" className="w-full h-full"><circle cx="24" cy="26" r="16" fill="#C8E6C9" /><polygon points="10,14 6,4 16,10" fill="#C8E6C9" /><polygon points="38,14 42,4 32,10" fill="#C8E6C9" /><polygon points="10,14 8,6 14,11" fill="#A5D6A7" /><polygon points="38,14 40,6 34,11" fill="#A5D6A7" /><path d="M15 24 Q18 22 21 24" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" /><path d="M27 24 Q30 22 33 24" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" /><ellipse cx="24" cy="30" rx="2" ry="1.2" fill="#E8A0BF" /><circle cx="14" cy="28" r="3" fill="#FFD1DC" opacity="0.3" /><circle cx="34" cy="28" r="3" fill="#FFD1DC" opacity="0.3" /><line x1="8" y1="24" x2="14" y2="25" stroke="#4A3728" strokeWidth="0.6" opacity="0.4" /><line x1="34" y1="25" x2="40" y2="24" stroke="#4A3728" strokeWidth="0.6" opacity="0.4" /></svg>
    ),
  },
  {
    id: 'miss', label: '想念',
    color: 'from-pink-50 to-rose-50', darkColor: 'dark:from-pink-900/20 dark:to-rose-900/20',
    ringColor: 'ring-pink-300/60', accent: 'text-pink-600 dark:text-pink-400',
    face: (
      <svg viewBox="0 0 48 48" className="w-full h-full"><circle cx="24" cy="26" r="16" fill="#FFD1DC" /><polygon points="10,14 6,4 16,10" fill="#FFD1DC" /><polygon points="38,14 42,4 32,10" fill="#FFD1DC" /><polygon points="10,14 8,6 14,11" fill="#FFB5C5" /><polygon points="38,14 40,6 34,11" fill="#FFB5C5" /><circle cx="18" cy="24" r="2.5" fill="#E8546E" /><circle cx="30" cy="24" r="2.5" fill="#E8546E" /><circle cx="19" cy="23" r="0.8" fill="white" /><circle cx="31" cy="23" r="0.8" fill="white" /><path d="M21 30 Q24 33 27 30" stroke="#E8546E" strokeWidth="1.5" fill="none" strokeLinecap="round" /><circle cx="14" cy="28" r="3.5" fill="#FF8FA3" opacity="0.35" /><circle cx="34" cy="28" r="3.5" fill="#FF8FA3" opacity="0.35" /><path d="M35 10 C35 7 38 6 38 9 C38 12 35 14 35 14 C35 14 32 12 32 9 C32 6 35 7 35 10Z" fill="#FF6B8A" opacity="0.6" /></svg>
    ),
  },
  {
    id: 'grumpy', label: '烦躁',
    color: 'from-orange-50 to-red-50', darkColor: 'dark:from-orange-900/20 dark:to-red-900/20',
    ringColor: 'ring-orange-300/60', accent: 'text-orange-600 dark:text-orange-400',
    face: (
      <svg viewBox="0 0 48 48" className="w-full h-full"><circle cx="24" cy="26" r="16" fill="#FFE0B2" /><polygon points="10,14 6,4 16,10" fill="#FFE0B2" /><polygon points="38,14 42,4 32,10" fill="#FFE0B2" /><polygon points="10,14 8,6 14,11" fill="#FFCC80" /><polygon points="38,14 40,6 34,11" fill="#FFCC80" /><path d="M14 21 L21 23" stroke="#4A3728" strokeWidth="1.8" strokeLinecap="round" /><path d="M34 21 L27 23" stroke="#4A3728" strokeWidth="1.8" strokeLinecap="round" /><circle cx="18" cy="25" r="2" fill="#4A3728" /><circle cx="30" cy="25" r="2" fill="#4A3728" /><path d="M20 31 Q24 28 28 31" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" /><line x1="22" y1="17" x2="26" y2="17" stroke="#4A3728" strokeWidth="1" opacity="0.5" /><circle cx="14" cy="28" r="3" fill="#FFAB91" opacity="0.3" /><circle cx="34" cy="28" r="3" fill="#FFAB91" opacity="0.3" /></svg>
    ),
  },
  {
    id: 'sad', label: '难过',
    color: 'from-blue-50 to-indigo-50', darkColor: 'dark:from-blue-900/20 dark:to-indigo-900/20',
    ringColor: 'ring-blue-300/60', accent: 'text-blue-600 dark:text-blue-400',
    face: (
      <svg viewBox="0 0 48 48" className="w-full h-full"><circle cx="24" cy="26" r="16" fill="#BBDEFB" /><polygon points="10,14 6,4 16,10" fill="#BBDEFB" /><polygon points="38,14 42,4 32,10" fill="#BBDEFB" /><polygon points="10,14 8,6 14,11" fill="#90CAF9" /><polygon points="38,14 40,6 34,11" fill="#90CAF9" /><circle cx="18" cy="24" r="2.5" fill="#4A3728" /><circle cx="30" cy="24" r="2.5" fill="#4A3728" /><circle cx="19" cy="23" r="0.8" fill="white" /><circle cx="31" cy="23" r="0.8" fill="white" /><path d="M20 32 Q24 28 28 32" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" /><path d="M20 26 Q19 30 18 34" stroke="#64B5F6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" /><ellipse cx="18" cy="35" rx="1.5" ry="2" fill="#64B5F6" opacity="0.5" /><circle cx="14" cy="28" r="3" fill="#B3E5FC" opacity="0.3" /><circle cx="34" cy="28" r="3" fill="#B3E5FC" opacity="0.3" /></svg>
    ),
  },
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
  const [selectedId, setSelectedId] = useState(null)

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
    setSelectedId(mood.id)
    setSaving(true)
    setSaveError('')
    try {
      const today = getTodayKey()
      const content = `${mood.id}:${mood.label}`
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
        setSelectedId(null)
      } else {
        setTodayMood(content)
      }
    } catch (e) {
      setSaveError('网络异常，请重试')
      setSelectedId(null)
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  const extractId = (str) => str ? str.split(':')[0] : null
  const myId = extractId(todayMood)
  const partnerId = extractId(partnerMood)
  const myMood = MOODS.find(m => m.id === myId)
  const partnerMoodObj = MOODS.find(m => m.id === partnerId)

  return (
    <div className="mx-4 mb-3 animate-fade-in">
      <div className={cn(
        'rounded-2xl overflow-hidden',
        'bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl',
        'border border-milk-100/60 dark:border-dark-border/60',
        'shadow-sm'
      )}>
        {/* Gradient accent line */}
        <div className="h-[2px] bg-gradient-to-r from-apricot-300 via-tulip-300 to-apricot-300" />

        <div className="px-4 py-3.5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-apricot-50 dark:bg-apricot-900/20 text-apricot-500 dark:text-apricot-400 font-semibold tracking-wide">
              {formatToday()}
            </span>
            {myMood && (
              <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                已记录
              </span>
            )}
          </div>

          {/* Error */}
          {saveError && (
            <div className="mb-2.5 text-[11px] text-tulip-500 bg-tulip-50 dark:bg-tulip-900/20 px-3 py-2 rounded-xl">
              {saveError}
            </div>
          )}

          {/* Selected state */}
          {myMood ? (
            <div className="space-y-2">
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r',
                myMood.color, myMood.darkColor
              )}>
                <div className="w-9 h-9 shrink-0">{myMood.face}</div>
                <p className="text-sm font-medium text-milk-800 dark:text-milk-200">
                  今天你是 <span className={myMood.accent}>{myMood.label}</span>
                </p>
              </div>
              {partnerMoodObj && (
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r opacity-85',
                  partnerMoodObj.color, partnerMoodObj.darkColor
                )}>
                  <div className="w-9 h-9 shrink-0">{partnerMoodObj.face}</div>
                  <p className="text-sm text-milk-700 dark:text-milk-300">
                    <span className="font-medium">{partnerName}</span> 今天
                    <span className={cn('ml-1 font-medium', partnerMoodObj.accent)}>{partnerMoodObj.label}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-milk-500 dark:text-milk-400 mb-3 font-medium">今天心情怎么样？</p>
              <div className="flex gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => handleSelectMood(mood)}
                    disabled={saving}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all duration-300',
                      'bg-gradient-to-b', mood.color, mood.darkColor,
                      'hover:scale-110 active:scale-95',
                      'border border-transparent hover:border-white/60 dark:hover:border-white/10',
                      saving && 'opacity-50 cursor-not-allowed',
                      selectedId === mood.id && saving && 'ring-2', mood.ringColor
                    )}
                  >
                    <div className="w-8 h-8">{mood.face}</div>
                    <span className="text-[9px] text-milk-600 dark:text-milk-400 font-semibold">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Partner preview */}
          {partnerMoodObj && !myMood && (
            <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-50 dark:bg-dark-surface/50">
              <div className="w-5 h-5 shrink-0">{partnerMoodObj.face}</div>
              <span className="text-[11px] text-milk-500 dark:text-milk-400">
                {partnerName}今天 <span className="font-medium text-milk-700 dark:text-milk-300">{partnerMoodObj.label}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
