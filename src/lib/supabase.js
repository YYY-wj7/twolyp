import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://imigpcxcrprmulbeopeb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaWdwY3hjcnBybXVsYmVvcGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTA5NjksImV4cCI6MjEwNTEyNjk2OX0.diW5-MSSMNDV7N7JX79i465gOo0hAZ-AOZKA9dP6wEk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'twolyp-auth-session',
  },
})
