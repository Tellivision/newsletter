import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    })
    // Return a mock client that will help with debugging
    throw new Error(`Missing Supabase configuration. Please check your environment variables:
    - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✓ Set' : '✗ Missing'}`)
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

// Lazy-loaded singleton instance for backward compatibility
let _supabase: ReturnType<typeof createClient> | null = null
export const supabase = () => {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}