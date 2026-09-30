import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AppContext'
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { cn } from '../lib/utils'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialInviteCode = searchParams.get('invite')?.trim().toUpperCase() || ''
  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
  } = useAuth()
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' || initialInviteCode ? 'register' : 'login')
  const [registerType, setRegisterType] = useState(initialInviteCode ? 'join' : 'create')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState(initialInviteCode)
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const title = useMemo(() => {
    if (mode === 'verify') return '验证邮箱'
    if (mode === 'forgot') return '找回密码'
    if (mode === 'reset') return '设置新密码'
    if (mode === 'register') return registerType === 'create' ? '创建你们的花园' : '加入 TA 的花园'
    return '欢迎回来'
  }, [mode, registerType])

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setPassword('')
    setConfirmPassword('')
    setVerificationCode('')
    setShowPassword(false)
    setError('')
    setNotice('')
  }

  const validateRegistration = () => {
    if (!EMAIL_PATTERN.test(email)) return '请输入有效的邮箱地址'
    if (password.length < 8) return '密码至少需要 8 位'
    if (password !== confirmPassword) return '两次输入的密码不一致'
    if (registerType === 'join' && inviteCode.trim().length < 6) return '请输入有效的邀请码'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsLoading(true)

    try {
      if (mode === 'login') {
        if (!EMAIL_PATTERN.test(email)) throw new Error('请输入有效的邮箱地址')
        await login(email, password)
        navigate('/feed')
        return
      }

      if (mode === 'register') {
        const validationError = validateRegistration()
        if (validationError) throw new Error(validationError)

        await register({
          email,
          password,
          inviteCode: registerType === 'join' ? inviteCode.trim() : null,
          createGarden: registerType === 'create',
        })
        setMode('verify')
        setNotice('6 位验证码已发送到你的邮箱')
        return
      }

      if (mode === 'forgot') {
        if (!EMAIL_PATTERN.test(email)) throw new Error('请输入有效的邮箱地址')
        await requestPasswordReset(email)
        setVerificationCode('')
        setPassword('')
        setConfirmPassword('')
        setMode('reset')
        setNotice('6 位重置验证码已发送到你的邮箱')
        return
      }

      if (mode === 'reset') {
        if (verificationCode.length !== 6) throw new Error('请输入 6 位邮箱验证码')
        if (password.length < 8) throw new Error('新密码至少需要 8 位')
        if (password !== confirmPassword) throw new Error('两次输入的密码不一致')
        await resetPassword(email, verificationCode, password)
        setMode('login')
        setVerificationCode('')
        setPassword('')
        setConfirmPassword('')
        setNotice('密码已更新，请使用新密码登录')
        return
      }

      await verifyEmail(email, verificationCode)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || '操作失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setNotice('')
    setIsLoading(true)
    try {
      if (mode === 'reset') {
        await requestPasswordReset(email)
      } else {
        await resendVerification(email)
      }
      setNotice('新的验证码已发送，请检查邮箱')
    } catch (err) {
      setError(err.message || '验证码发送失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page min-h-dvh bg-milk-50 dark:bg-dark-bg transition-theme">
      <div className="tulip-bg" />
      <div className="auth-glow auth-glow-left" />
      <div className="auth-glow auth-glow-right" />

      <main className="auth-shell relative z-10">
        <section className="auth-panel animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <div className="brand-mark" aria-label="TwoLyp 郁金香标识">
              <img src="/favicon.svg" alt="" className="h-[58px] w-[58px]" />
            </div>
            <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-milk-900 dark:text-milk-100">
              TwoLyp
            </h1>
            <p className="mt-1 text-[13px] tracking-[0.08em] text-milk-600 dark:text-milk-400">
              TWO OF US · ONE GARDEN
            </p>
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div className="auth-tabs mt-7" role="tablist" aria-label="登录或注册">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                className={cn('auth-tab', mode === 'login' && 'auth-tab-active')}
              >
                登录
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => switchMode('register')}
                className={cn('auth-tab', mode === 'register' && 'auth-tab-active')}
              >
                注册
              </button>
            </div>
          )}

          <div className="mt-6">
            {(mode === 'verify' || mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => switchMode(mode === 'verify' ? 'register' : 'login')}
                className="mb-4 inline-flex items-center gap-1 text-sm text-milk-600 transition-colors hover:text-apricot-600 dark:text-milk-400"
              >
                <ArrowLeft className="h-4 w-4" />
                {mode === 'verify' ? '返回修改邮箱' : '返回登录'}
              </button>
            )}

            <div className="mb-5">
              <h2 className="text-[21px] font-semibold text-milk-900 dark:text-milk-100">{title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-milk-600 dark:text-milk-400">
                {mode === 'login' && '登录后继续翻阅只属于你们的回忆。'}
                {mode === 'register' && registerType === 'create' && '第一位用户先创建花园，之后再生成邀请码邀请另一位。'}
                {mode === 'register' && registerType === 'join' && '和 TA 一起创建你们的花园。'}
                {mode === 'verify' && <>验证码已发送至 <span className="font-medium text-milk-800 dark:text-milk-200">{email}</span></>}
                {mode === 'forgot' && '输入注册邮箱，我们会发送一次性验证码。'}
                {mode === 'reset' && <>请使用发送至 <span className="font-medium text-milk-800 dark:text-milk-200">{email}</span> 的验证码设置新密码。</>}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-milk-100 p-1.5 dark:bg-dark-surface">
                  <button
                    type="button"
                    onClick={() => setRegisterType('create')}
                    className={cn('auth-choice', registerType === 'create' && 'auth-choice-active')}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    创建花园
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterType('join')}
                    className={cn('auth-choice', registerType === 'join' && 'auth-choice-active')}
                  >
                    <Users className="h-4 w-4" />
                    邀请码加入
                  </button>
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                <label className="auth-field">
                  <Mail className="auth-field-icon" aria-hidden="true" />
                  <span className="sr-only">邮箱</span>
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="邮箱地址"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
              )}

              {mode === 'reset' && (
                <label className="auth-field auth-code-field">
                  <Mail className="auth-field-icon" aria-hidden="true" />
                  <span className="sr-only">邮箱验证码</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="输入 6 位验证码"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </label>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <label className="auth-field">
                  <LockKeyhole className="auth-field-icon" aria-hidden="true" />
                  <span className="sr-only">密码</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder={mode === 'login' ? '登录密码' : mode === 'reset' ? '新密码（至少 8 位）' : '设置密码（至少 8 位）'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="auth-field-action"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </label>
              )}

              {(mode === 'register' || mode === 'reset') && (
                <label className="auth-field">
                  <Check className="auth-field-icon" aria-hidden="true" />
                  <span className="sr-only">确认密码</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={mode === 'reset' ? '再次输入新密码' : '再次输入密码'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </label>
              )}

              {mode === 'register' && registerType === 'join' && (
                <label className="auth-field">
                  <KeyRound className="auth-field-icon" aria-hidden="true" />
                  <span className="sr-only">邀请码</span>
                  <input
                    type="text"
                    autoCapitalize="characters"
                    placeholder="一次性邀请码"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                    maxLength={8}
                    required
                  />
                </label>
              )}

              {mode === 'verify' && (
                <label className="auth-field auth-code-field">
                  <Mail className="auth-field-icon" aria-hidden="true" />
                  <span className="sr-only">邮箱验证码</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="输入 6 位验证码"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </label>
              )}

              {error && <p role="alert" className="auth-message auth-message-error">{error}</p>}
              {notice && <p role="status" aria-live="polite" className="auth-message auth-message-success">{notice}</p>}

              <button
                type="submit"
                disabled={isLoading || ((mode === 'verify' || mode === 'reset') && verificationCode.length !== 6)}
                className="auth-primary-button"
              >
                {isLoading && <span className="auth-spinner" aria-hidden="true" />}
                {mode === 'login' && (isLoading ? '正在登录' : '安全登录')}
                {mode === 'register' && (isLoading ? '正在创建' : '注册并验证邮箱')}
                {mode === 'verify' && (isLoading ? '正在验证' : '完成验证')}
                {mode === 'forgot' && (isLoading ? '正在发送' : '发送重置验证码')}
                {mode === 'reset' && (isLoading ? '正在更新' : '确认新密码')}
              </button>

              {mode === 'login' && (
                <button type="button" onClick={() => switchMode('forgot')} className="auth-text-button">
                  忘记密码？通过邮箱找回
                </button>
              )}

              {mode === 'verify' && (
                <button type="button" onClick={handleResend} disabled={isLoading} className="auth-text-button">
                  {isLoading ? '正在发送…' : '没收到？重新发送验证码'}
                </button>
              )}

              {mode === 'reset' && (
                <button type="button" onClick={handleResend} disabled={isLoading} className="auth-text-button">
                  {isLoading ? '正在发送…' : '没收到？重新发送重置验证码'}
                </button>
              )}
            </form>
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-apricot-50/80 px-3.5 py-3 dark:bg-dark-surface">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-apricot-600 dark:text-apricot-400" />
            <p className="text-xs leading-5 text-milk-700 dark:text-milk-400">
              花园只允许两位成员加入。邮箱验证、邀请码和后续端到端加密会共同保护你们的数据。
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
