import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Dexie from 'dexie'
import { supabase } from '../lib/supabase'

/**
 * Local IndexedDB for offline-first storage.
 */
const db = new Dexie('TwoLypDB')

db.version(1).stores({
  records: 'id, createdAt, category, isDeleted, deletedAt, syncedAt',
  media: 'id, recordId, type, syncedAt',
  comments: 'id, recordId, createdAt',
  tags: 'id, name',
  anniversaries: 'id, date, title',
  drafts: 'id, updatedAt',
  userProfile: 'id',
  appSettings: 'key',
})

const AuthContext = createContext(null)
const DBContext = createContext(null)
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

/**
 * Load garden info for the current user.
 * Queries garden_members to find which garden the user belongs to.
 */
async function loadGardenInfo(userId) {
  try {
    const { data: membership } = await supabase
      .from('garden_members')
      .select('garden_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (membership?.garden_id) {
      const { data: garden } = await supabase
        .from('gardens')
        .select('id, name, created_by, invite_code')
        .eq('id', membership.garden_id)
        .single()

      return {
        gardenId: garden?.id || membership.garden_id,
        garden: garden || null,
      }
    }
  } catch (e) {
    console.warn('Failed to load garden info:', e)
  }
  return { gardenId: null, garden: null }
}

/**
 * AuthProvider — Supabase Auth backed authentication + garden state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [gardenId, setGardenId] = useState(null)
  const [inviteCode, setInviteCode] = useState(null)
  const [garden, setGarden] = useState(null)
  const [pendingRegistration, setPendingRegistration] = useState(null)
  const [pendingPasswordReset, setPendingPasswordReset] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from Supabase on mount
  useEffect(() => {
    let active = true

    // Safety timeout: if session restore takes too long, show login page
    const timeout = setTimeout(() => {
      if (active) setIsLoading(false)
    }, 5000)

    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!active) return
        clearTimeout(timeout)

        if (session?.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const nextUser = {
            id: session.user.id,
            email: session.user.email,
            nickname: profile?.nickname || '',
            avatar: profile?.avatar_url || null,
          }

          // Load garden info
          const { gardenId: gid, garden: g } = await loadGardenInfo(session.user.id)
          if (!active) return
          setGardenId(gid)
          setGarden(g)

          // Load invite code from local storage
          const codeEntry = await db.appSettings.get('garden-invite-code')
          if (codeEntry?.value) setInviteCode(codeEntry.value)

          setUser(nextUser)

          // Persist last active time locally
          await db.appSettings.put({
            key: 'auth-session',
            value: { user: nextUser, lastActiveAt: Date.now() },
          })
        } else {
          // Check local session fallback
          const localSession = await db.appSettings.get('auth-session')
          if (localSession?.value?.user) {
            const inactiveFor = Date.now() - Number(localSession.value.lastActiveAt || 0)
            if (inactiveFor <= THREE_DAYS_MS) {
              setUser(localSession.value.user)
            } else {
              await db.appSettings.delete('auth-session')
            }
          }
        }
      } catch (error) {
        console.warn('Unable to restore session:', error)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    restoreSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return

      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        const nextUser = {
          id: session.user.id,
          email: session.user.email,
          nickname: profile?.nickname || '',
          avatar: profile?.avatar_url || null,
        }

        // Load garden info on sign in
        const { gardenId: gid, garden: g } = await loadGardenInfo(session.user.id)
        if (!active) return
        setGardenId(gid)
        setGarden(g)

        const codeEntry = await db.appSettings.get('garden-invite-code')
        if (codeEntry?.value) setInviteCode(codeEntry.value)

        setUser(nextUser)
        await db.appSettings.put({
          key: 'auth-session',
          value: { user: nextUser, lastActiveAt: Date.now() },
        })
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setGardenId(null)
        setInviteCode(null)
        setGarden(null)
        await db.appSettings.delete('auth-session')
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    if (!email || !password) throw new Error('请输入邮箱和密码')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('邮箱或密码不正确')
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('邮箱尚未验证，请先完成邮箱验证')
      }
      throw new Error(error.message || '登录失败')
    }

    return data.user
  }, [])

  const register = useCallback(async ({ email, password, inviteCode: code, createGarden }) => {
    if (!email || !password) throw new Error('请完整填写注册信息')
    if (!createGarden && !code) throw new Error('加入花园需要邀请码')

    // If joining with invite code, verify it first
    if (!createGarden && code) {
      const { data: inviteData, error: inviteError } = await supabase
        .from('invite_codes')
        .select('garden_id, is_used')
        .eq('code', code.trim().toUpperCase())
        .single()

      if (inviteError || !inviteData) {
        throw new Error('邀请码无效，请检查后重试')
      }
      if (inviteData.is_used) {
        throw new Error('该邀请码已被使用')
      }

      // Check garden member count
      const { count } = await supabase
        .from('garden_members')
        .select('*', { count: 'exact', head: true })
        .eq('garden_id', inviteData.garden_id)

      if (count >= 2) {
        throw new Error('该花园已满员（最多两位成员）')
      }
    }

    // Sign up with Supabase — this triggers email OTP
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          invite_code: !createGarden ? code.trim().toUpperCase() : null,
          create_garden: createGarden,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('该邮箱已注册，请直接登录')
      }
      throw new Error(error.message || '注册失败')
    }

    setPendingRegistration({ email, inviteCode: code, createGarden, userId: data.user?.id })
    return { emailVerificationRequired: true }
  }, [])

  const verifyEmail = useCallback(async (email, code) => {
    if (code.length !== 6) throw new Error('请输入 6 位邮箱验证码')

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error) {
      if (error.message.includes('Token has expired') || error.message.includes('invalid')) {
        throw new Error('验证码无效或已过期，请重新获取')
      }
      throw new Error(error.message || '验证失败')
    }

    // After verification, handle garden creation or joining
    if (pendingRegistration) {
      const userId = data.user?.id || pendingRegistration.userId

      if (pendingRegistration.createGarden) {
        // Create a new garden for the first user
        const newInviteCode = generateInviteCode()
        const { data: gardenData, error: gardenError } = await supabase
          .from('gardens')
          .insert({
            name: '我们的花园',
            created_by: userId,
            invite_code: newInviteCode,
          })
          .select()
          .single()

        if (gardenError) throw new Error('创建花园失败: ' + (gardenError.message || ''))

        // Add creator as owner
        await supabase
          .from('garden_members')
          .insert({ garden_id: gardenData.id, user_id: userId, role: 'owner' })

        // Store invite code and garden info locally
        await db.appSettings.put({ key: 'garden-invite-code', value: newInviteCode })
        setInviteCode(newInviteCode)
        setGardenId(gardenData.id)
        setGarden(gardenData)
      } else if (pendingRegistration.inviteCode) {
        // Join existing garden
        const { data: inviteData } = await supabase
          .from('invite_codes')
          .select('garden_id')
          .eq('code', pendingRegistration.inviteCode.trim().toUpperCase())
          .single()

        if (inviteData) {
          await supabase
            .from('garden_members')
            .insert({ garden_id: inviteData.garden_id, user_id: userId, role: 'member' })

          // Mark invite code as used
          await supabase
            .from('invite_codes')
            .update({ is_used: true, used_by: userId, used_at: new Date().toISOString() })
            .eq('code', pendingRegistration.inviteCode.trim().toUpperCase())

          // Load garden info
          const { data: gardenData } = await supabase
            .from('gardens')
            .select('id, name, created_by, invite_code')
            .eq('id', inviteData.garden_id)
            .single()

          setGardenId(inviteData.garden_id)
          setGarden(gardenData)
        }
      }

      setPendingRegistration(null)
    }

    return data.user
  }, [pendingRegistration])

  const resendVerification = useCallback(async (email) => {
    if (!email) throw new Error('请先填写邮箱')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) throw new Error(error.message || '验证码发送失败')
    return { sent: true }
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    if (!email) throw new Error('请先填写邮箱')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login?mode=reset',
    })

    if (error) throw new Error(error.message || '发送失败')
    setPendingPasswordReset({ email })
    return { sent: true }
  }, [])

  const resetPassword = useCallback(async (email, code, password) => {
    if (code.length !== 6) throw new Error('请输入 6 位邮箱验证码')
    if (password.length < 8) throw new Error('新密码至少需要 8 位')

    // Verify OTP first
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (verifyError) throw new Error('验证码无效或已过期')

    // Update password
    const { error } = await supabase.auth.updateUser({ password })

    if (error) throw new Error(error.message || '密码更新失败')

    setPendingPasswordReset(null)
    return { updated: true }
  }, [pendingPasswordReset])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setGardenId(null)
    setInviteCode(null)
    setGarden(null)
    setPendingRegistration(null)
    setPendingPasswordReset(null)
    await db.appSettings.delete('auth-session')
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      gardenId,
      inviteCode,
      garden,
      isLoading,
      login,
      register,
      verifyEmail,
      resendVerification,
      requestPasswordReset,
      resetPassword,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function DBProvider({ children }) {
  return <DBContext.Provider value={db}>{children}</DBContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useDB() {
  const ctx = useContext(DBContext)
  if (!ctx) throw new Error('useDB must be used within DBProvider')
  return ctx
}

export { db }

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
