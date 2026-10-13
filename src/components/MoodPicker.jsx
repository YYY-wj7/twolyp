import { useState, useEffect } from 'react'
import { cn, withTimeout } from '../lib/utils'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'

/* Cute cat sticker moods — bigger, rounder, sparklier */
const MOODS = [
  {
    id: 'happy', label: '开心',
    color: 'from-amber-50 to-yellow-50', darkColor: 'dark:from-amber-900/20 dark:to-yellow-900/20',
    ringColor: 'ring-amber-300/60', accent: 'text-amber-600 dark:text-amber-400',
    face: (
      <svg viewBox="0 0 52 52" className="w-full h-full">
        <ellipse cx="26" cy="28" rx="17" ry="16" fill="#FFD97D"/>
        <polygon points="11,16 6,3 17,12" fill="#FFD97D" stroke="#F0C040" strokeWidth="0.5"/>
        <polygon points="41,16 46,3 35,12" fill="#FFD97D" stroke="#F0C040" strokeWidth="0.5"/>
        <polygon points="11,16 8,6 15,12" fill="#FFBB5C"/>
        <polygon points="41,16 44,6 37,12" fill="#FFBB5C"/>
        {/* Big sparkly eyes */}
        <ellipse cx="19" cy="26" rx="3.2" ry="3.5" fill="#3E2723"/>
        <ellipse cx="33" cy="26" rx="3.2" ry="3.5" fill="#3E2723"/>
        <circle cx="20.2" cy="24.5" r="1.3" fill="white"/>
        <circle cx="34.2" cy="24.5" r="1.3" fill="white"/>
        <circle cx="18" cy="27" r="0.6" fill="white" opacity="0.6"/>
        <circle cx="32" cy="27" r="0.6" fill="white" opacity="0.6"/>
        {/* Cute W mouth */}
        <path d="M22 33 Q24 35 26 33 Q28 35 30 33" stroke="#3E2723" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Big pink cheeks */}
        <ellipse cx="13" cy="31" rx="3.5" ry="2.5" fill="#FFB5B5" opacity="0.5"/>
        <ellipse cx="39" cy="31" rx="3.5" ry="2.5" fill="#FFB5B5" opacity="0.5"/>
        {/* Whiskers */}
        <line x1="5" y1="25" x2="13" y2="27" stroke="#3E2723" strokeWidth="0.5" opacity="0.3"/>
        <line x1="5" y1="29" x2="13" y2="29" stroke="#3E2723" strokeWidth="0.5" opacity="0.3"/>
        <line x1="39" y1="27" x2="47" y2="25" stroke="#3E2723" strokeWidth="0.5" opacity="0.3"/>
        <line x1="39" y1="29" x2="47" y2="29" stroke="#3E2723" strokeWidth="0.5" opacity="0.3"/>
        {/* Nose */}
        <ellipse cx="26" cy="30" rx="1.5" ry="1" fill="#E8A0BF"/>
      </svg>
    ),
  },
  {
    id: 'calm', label: '平静',
    color: 'from-emerald-50 to-sage-50', darkColor: 'dark:from-emerald-900/20 dark:to-sage-900/20',
    ringColor: 'ring-emerald-300/60', accent: 'text-emerald-600 dark:text-emerald-400',
    face: (
      <svg viewBox="0 0 52 52" className="w-full h-full">
        <ellipse cx="26" cy="28" rx="17" ry="16" fill="#C8E6C9"/>
        <polygon points="11,16 6,3 17,12" fill="#C8E6C9" stroke="#A5D6A7" strokeWidth="0.5"/>
        <polygon points="41,16 46,3 35,12" fill="#C8E6C9" stroke="#A5D6A7" strokeWidth="0.5"/>
        <polygon points="11,16 8,6 15,12" fill="#A5D6A7"/>
        <polygon points="41,16 44,6 37,12" fill="#A5D6A7"/>
        {/* Serene closed eyes - curved lines */}
        <path d="M15 26 Q19 22 23 26" stroke="#3E2723" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M29 26 Q33 22 37 26" stroke="#3E2723" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* Tiny smile */}
        <path d="M23 33 Q26 35 29 33" stroke="#3E2723" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Soft cheeks */}
        <ellipse cx="13" cy="30" rx="3.5" ry="2.5" fill="#FFD1DC" opacity="0.35"/>
        <ellipse cx="39" cy="30" rx="3.5" ry="2.5" fill="#FFD1DC" opacity="0.35"/>
        {/* Nose */}
        <ellipse cx="26" cy="30" rx="1.5" ry="1" fill="#E8A0BF"/>
        {/* Whiskers */}
        <line x1="5" y1="26" x2="13" y2="28" stroke="#3E2723" strokeWidth="0.5" opacity="0.3"/>
        <line x1="39" y1="28" x2="47" y2="26" stroke="#3E2723" strokeWidth="0.5" opacity="0.3"/>
        {/* Sleepy Z */}
        <text x="42" y="16" fill="#81C784" fontSize="8" fontWeight="bold" opacity="0.5">z</text>
      </svg>
    ),
  },
  {
    id: 'miss', label: '想念',
    color: 'from-pink-50 to-rose-50', darkColor: 'dark:from-pink-900/20 dark:to-rose-900/20',
    ringColor: 'ring-pink-300/60', accent: 'text-pink-600 dark:text-pink-400',
    face: (
      <svg viewBox="0 0 52 52" className="w-full h-full">
        <ellipse cx="26" cy="28" rx="17" ry="16" fill="#FFD1DC"/>
        <polygon points="11,16 6,3 17,12" fill="#FFD1DC" stroke="#FFB5C5" strokeWidth="0.5"/>
        <polygon points="41,16 46,3 35,12" fill="#FFD1DC" stroke="#FFB5C5" strokeWidth="0.5"/>
        <polygon points="11,16 8,6 15,12" fill="#FFB5C5"/>
        <polygon points="41,16 44,6 37,12" fill="#FFB5C5"/>
        {/* Heart-shaped eyes */}
        <path d="M16 24 C16 21 19 20 19 23 C19 20 22 21 22 24 C22 27 19 29 19 29 C19 29 16 27 16 24Z" fill="#E8546E"/>
        <path d="M30 24 C30 21 33 20 33 23 C33 20 36 21 36 24 C36 27 33 29 33 29 C33 29 30 27 30 24Z" fill="#E8546E"/>
        {/* Cute open smile */}
        <path d="M22 33 Q26 37 30 33" stroke="#E8546E" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* Rosy cheeks */}
        <ellipse cx="13" cy="31" rx="3.5" ry="2.5" fill="#FF8FA3" opacity="0.4"/>
        <ellipse cx="39" cy="31" rx="3.5" ry="2.5" fill="#FF8FA3" opacity="0.4"/>
        {/* Nose */}
        <ellipse cx="26" cy="30" rx="1.5" ry="1" fill="#E8A0BF"/>
        {/* Floating hearts */}
        <path d="M40 10 C40 7.5 43 6.5 43 9 C43 6.5 46 7.5 46 10 C46 13 43 15 43 15 C43 15 40 13 40 10Z" fill="#FF6B8A" opacity="0.55"/>
        <path d="M7 18 C7 16.5 9 16 9 17.5 C9 16 11 16.5 11 18 C11 19.5 9 20.5 9 20.5 C9 20.5 7 19.5 7 18Z" fill="#FF8FA3" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'grumpy', label: '烦躁',
    color: 'from-orange-50 to-red-50', darkColor: 'dark:from-orange-900/20 dark:to-red-900/20',
    ringColor: 'ring-orange-300/60', accent: 'text-orange-600 dark:text-orange-400',
    face: (
      <svg viewBox="0 0 52 52" className="w-full h-full">
        <ellipse cx="26" cy="28" rx="17" ry="16" fill="#FFE0B2"/>
        <polygon points="11,16 6,3 17,12" fill="#FFE0B2" stroke="#FFCC80" strokeWidth="0.5"/>
        <polygon points="41,16 46,3 35,12" fill="#FFE0B2" stroke="#FFCC80" strokeWidth="0.5"/>
        <polygon points="11,16 8,6 15,12" fill="#FFCC80"/>
        <polygon points="41,16 44,6 37,12" fill="#FFCC80"/>
        {/* Angry slanted eyebrows + eyes */}
        <line x1="13" y1="20" x2="22" y2="23" stroke="#3E2723" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="39" y1="20" x2="30" y2="23" stroke="#3E2723" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="19" cy="26" r="2.5" fill="#3E2723"/>
        <circle cx="33" cy="26" r="2.5" fill="#3E2723"/>
        <circle cx="19.8" cy="25.3" r="0.8" fill="white"/>
        <circle cx="33.8" cy="25.3" r="0.8" fill="white"/>
        {/* Frown */}
        <path d="M22 34 Q26 31 30 34" stroke="#3E2723" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Angry blush */}
        <ellipse cx="13" cy="31" rx="3.5" ry="2.5" fill="#FFAB91" opacity="0.4"/>
        <ellipse cx="39" cy="31" rx="3.5" ry="2.5" fill="#FFAB91" opacity="0.4"/>
        {/* Nose */}
        <ellipse cx="26" cy="30" rx="1.5" ry="1" fill="#E8A0BF"/>
        {/* Steam puffs */}
        <circle cx="8" cy="18" r="2" fill="#FF8A65" opacity="0.25"/>
        <circle cx="6" cy="14" r="1.5" fill="#FF8A65" opacity="0.2"/>
        <circle cx="44" cy="18" r="2" fill="#FF8A65" opacity="0.25"/>
        <circle cx="46" cy="14" r="1.5" fill="#FF8A65" opacity="0.2"/>
      </svg>
    ),
  },
  {
    id: 'sad', label: '难过',
    color: 'from-blue-50 to-indigo-50', darkColor: 'dark:from-blue-900/20 dark:to-indigo-900/20',
    ringColor: 'ring-blue-300/60', accent: 'text-blue-600 dark:text-blue-400',
    face: (
      <svg viewBox="0 0 52 52" className="w-full h-full">
        <ellipse cx="26" cy="28" rx="17" ry="16" fill="#BBDEFB"/>
        <polygon points="11,16 6,3 17,12" fill="#BBDEFB" stroke="#90CAF9" strokeWidth="0.5"/>
        <polygon points="41,16 46,3 35,12" fill="#BBDEFB" stroke="#90CAF9" strokeWidth="0.5"/>
        <polygon points="11,16 8,6 15,12" fill="#90CAF9"/>
        <polygon points="41,16 44,6 37,12" fill="#90CAF9"/>
        {/* Big watery eyes */}
        <ellipse cx="19" cy="26" rx="3.5" ry="4" fill="#3E2723"/>
        <ellipse cx="33" cy="26" rx="3.5" ry="4" fill="#3E2723"/>
        <circle cx="20.5" cy="24" r="1.5" fill="white"/>
        <circle cx="34.5" cy="24" r="1.5" fill="white"/>
        <circle cx="18" cy="27.5" r="0.7" fill="white" opacity="0.5"/>
        <circle cx="32" cy="27.5" r="0.7" fill="white" opacity="0.5"/>
        {/* Sad mouth */}
        <path d="M22 34 Q26 31 30 34" stroke="#3E2723" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* Tears */}
        <path d="M16 28 Q15 33 14.5 37" stroke="#64B5F6" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6"/>
        <ellipse cx="14.5" cy="38" rx="1.5" ry="2" fill="#64B5F6" opacity="0.4"/>
        <path d="M36 28 Q37 33 37.5 37" stroke="#64B5F6" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6"/>
        <ellipse cx="37.5" cy="38" rx="1.5" ry="2" fill="#64B5F6" opacity="0.4"/>
        {/* Cheeks */}
        <ellipse cx="13" cy="31" rx="3" ry="2" fill="#B3E5FC" opacity="0.35"/>
        <ellipse cx="39" cy="31" rx="3" ry="2" fill="#B3E5FC" opacity="0.35"/>
        {/* Nose */}
        <ellipse cx="26" cy="30" rx="1.5" ry="1" fill="#E8A0BF"/>
        {/* Sad eyebrows */}
        <path d="M14 21 Q17 19 22 21" stroke="#3E2723" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>
        <path d="M30 21 Q35 19 38 21" stroke="#3E2723" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>
      </svg>
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
          supabase.from('garden_members').select('user_id, profiles(nickname)').eq('garden_id', gardenId), 8000
        )
        const partner = members?.find(m => m.user_id !== user.id)
        if (partner?.profiles) setPartnerName(partner.profiles.nickname || '对方')

        const { data: moodRecords } = await withTimeout(
          supabase.from('records').select('author_id, content, custom_tags')
            .eq('garden_id', gardenId).eq('is_deleted', false).contains('custom_tags', ['mood'])
            .gte('recorded_at', today + 'T00:00:00').lt('recorded_at', today + 'T23:59:59'), 8000
        )
        if (moodRecords) {
          const mine = moodRecords.find(r => r.author_id === user.id)
          const theirs = moodRecords.find(r => r.author_id !== user.id)
          if (mine) setTodayMood(mine.content)
          if (theirs) setPartnerMood(theirs.content)
        }
      } catch (e) { console.warn('Failed to fetch moods:', e) }
      finally { setLoaded(true) }
    }
    fetchMoods()
  }, [gardenId, user])

  const handleSelectMood = async (mood) => {
    if (saving || todayMood || !gardenId || !user) return
    setSelectedId(mood.id); setSaving(true); setSaveError('')
    try {
      const today = getTodayKey()
      const content = `${mood.id}:${mood.label}`
      const { error } = await withTimeout(
        supabase.from('records').insert({
          garden_id: gardenId, author_id: user.id, title: '今日心情', content,
          category: 'custom', custom_tags: ['mood'], recorded_at: today + 'T12:00:00',
        }), 8000
      )
      if (error) { setSaveError('保存失败，请重试'); setSelectedId(null) }
      else setTodayMood(content)
    } catch (e) { setSaveError('网络异常，请重试'); setSelectedId(null) }
    finally { setSaving(false) }
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
        'border border-milk-100/60 dark:border-dark-border/60 shadow-sm'
      )}>
        <div className="h-[2px] bg-gradient-to-r from-apricot-300 via-tulip-300 to-apricot-300" />

        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-apricot-50 dark:bg-apricot-900/20 text-apricot-500 dark:text-apricot-400 font-semibold tracking-wide">
              {formatToday()}
            </span>
            {myMood && (
              <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />已记录
              </span>
            )}
          </div>

          {saveError && (
            <div className="mb-2.5 text-[11px] text-tulip-500 bg-tulip-50 dark:bg-tulip-900/20 px-3 py-2 rounded-xl">{saveError}</div>
          )}

          {myMood ? (
            <div className="space-y-2">
              <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r', myMood.color, myMood.darkColor)}>
                <div className="w-11 h-11 shrink-0">{myMood.face}</div>
                <p className="text-sm font-medium text-milk-800 dark:text-milk-200">今天你是 <span className={myMood.accent}>{myMood.label}</span></p>
              </div>
              {partnerMoodObj && (
                <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r opacity-85', partnerMoodObj.color, partnerMoodObj.darkColor)}>
                  <div className="w-11 h-11 shrink-0">{partnerMoodObj.face}</div>
                  <p className="text-sm text-milk-700 dark:text-milk-300">
                    <span className="font-medium">{partnerName}</span> 今天<span className={cn('ml-1 font-medium', partnerMoodObj.accent)}>{partnerMoodObj.label}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-milk-500 dark:text-milk-400 mb-3 font-medium">今天心情怎么样？</p>
              <div className="flex gap-2">
                {MOODS.map(mood => (
                  <button key={mood.id} onClick={() => handleSelectMood(mood)} disabled={saving}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300',
                      'bg-gradient-to-b', mood.color, mood.darkColor,
                      'hover:scale-110 active:scale-95',
                      'border border-transparent hover:border-white/60 dark:hover:border-white/10',
                      saving && 'opacity-50 cursor-not-allowed',
                      selectedId === mood.id && saving && 'ring-2', mood.ringColor
                    )}>
                    <div className="w-10 h-10">{mood.face}</div>
                    <span className="text-[9px] text-milk-600 dark:text-milk-400 font-semibold">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {partnerMoodObj && !myMood && (
            <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-milk-50 dark:bg-dark-surface/50">
              <div className="w-6 h-6 shrink-0">{partnerMoodObj.face}</div>
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
