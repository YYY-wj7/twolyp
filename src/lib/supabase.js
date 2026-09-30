import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://imigpcxcrprmulbeopeb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_SaVo6XJdrpni5LzWNFKUEA_dXpK_Mtj'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
    storageKey: 'twolyp-auth-session',
  },
})
