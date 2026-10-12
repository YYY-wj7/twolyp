import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Heart, Copy, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { cn, withTimeout } from '../lib/utils'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, inviteCode, gardenId, garden } = useAuth()

  const initialStep = user?.nickname ? 1 : 0
  const [step, setStep] = useState(initialStep)
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.nickname && step === 0) {
      setStep(1)
    }
  }, [user, step])

  const isCreator = garden?.created_by === user?.id

  const handleSaveNickname = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) return

    setSaving(true)
    try {
      const { error } = await withTimeout(
        supabase
          .from('profiles')
          .update({ nickname: trimmed })
          .eq('id', user.id),
        10000, '保存昵称'
      )

      if (error) throw error
      setStep(1)
    } catch (err) {
      console.error('Failed to save nickname:', err)
      setError('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = () => {
    navigate('/feed')
  }

  const handleCopyCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const totalSteps = 2

  return (
    <div className="min-h-dvh flex flex-col bg-milk-50 dark:bg-dark-bg transition-theme">
      {/* Subtle background pattern */}
      <div className="tulip-bg" />

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-12 pb-6 relative z-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === step
                ? 'w-8 bg-apricot-400'
                : i < step
                  ? 'w-1.5 bg-apricot-300'
                  : 'w-1.5 bg-milk-300 dark:bg-dark-border'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in relative z-10">
        {step === 0 && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-28 h-28 rounded-3xl gradient-coral flex items-center justify-center mb-8 shadow-lg glow-coral">
              <Sparkles className="w-14 h-14 text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-2xl font-bold text-milk-900 dark:text-milk-100 mb-2">
              设置你的昵称
            </h1>
            <p className="text-sm text-milk-500 dark:text-milk-400 text-center mb-8">
              TA 会在花园里看到这个名字
            </p>

            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入昵称..."
              maxLength={20}
              className={cn(
                'w-full h-14 px-5 rounded-2xl text-base',
                'bg-white dark:bg-dark-card',
                'border border-milk-200 dark:border-dark-border',
                'text-milk-900 dark:text-milk-100',
                'placeholder:text-milk-400 dark:placeholder:text-milk-500',
                'focus:outline-none focus:ring-2 focus:ring-apricot-300 dark:focus:ring-apricot-400',
                'shadow-card transition-shadow'
              )}
            />
          </div>
        )}

        {step === 1 && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-28 h-28 rounded-3xl gradient-rose flex items-center justify-center mb-8 shadow-lg">
              <Heart className="w-14 h-14 text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-2xl font-bold text-milk-900 dark:text-milk-100 mb-2">
              邀请你的 TA
            </h1>

            {isCreator ? (
              <>
                <p className="text-sm text-milk-500 dark:text-milk-400 text-center mb-6">
                  把这个邀请码发给 TA，TA 注册时输入即可加入花园
                </p>

                <div className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white dark:bg-dark-card border border-milk-200 dark:border-dark-border shadow-card">
                  <span className="text-2xl font-mono font-bold tracking-widest text-apricot-500 dark:text-apricot-400">
                    {inviteCode || '------'}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium',
                      'bg-apricot-50 dark:bg-apricot-400/10',
                      'text-apricot-500 dark:text-apricot-400',
                      'active:scale-95 transition-transform'
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-milk-500 dark:text-milk-400 text-center mb-6">
                  你们正在共同创建花园，开始记录属于你们的回忆吧
                </p>

                <div className="w-full flex items-center justify-center px-5 py-6 rounded-2xl bg-white dark:bg-dark-card border border-milk-200 dark:border-dark-border shadow-card">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-tulip-400 fill-tulip-400" />
                    <p className="text-sm text-milk-700 dark:text-milk-300 font-medium">
                      {garden?.name || '你们的花园'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-8 pb-12 safe-bottom relative z-10">
        {step === 0 && (
          <>
            {error && (
              <p className="text-sm text-tulip-500 text-center mb-3">{error}</p>
            )}
            <button
              onClick={handleSaveNickname}
              disabled={!nickname.trim() || saving}
              className={cn(
                'w-full h-14 rounded-2xl font-semibold text-white flex items-center justify-center gap-2',
                'gradient-coral active:scale-[0.98] transition-transform',
                'shadow-lg glow-coral',
                (!nickname.trim() || saving) && 'opacity-50 pointer-events-none'
              )}
            >
              {saving ? '保存中...' : '下一步'}
              {!saving && <ChevronRight className="w-5 h-5" />}
            </button>
          </>
        )}

        {step === 1 && (
          <button
            onClick={handleFinish}
            className={cn(
              'w-full h-14 rounded-2xl font-semibold text-white flex items-center justify-center gap-2',
              'gradient-coral active:scale-[0.98] transition-transform',
              'shadow-lg glow-coral'
            )}
          >
            开始使用
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {step === 0 && (
          <button
            onClick={() => navigate('/feed')}
            className="w-full mt-3 text-sm text-milk-400 hover:text-milk-600 dark:hover:text-milk-300 transition-colors"
          >
            跳过引导
          </button>
        )}
      </div>
    </div>
  )
}
