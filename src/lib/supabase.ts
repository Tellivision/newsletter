import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Lazy-loaded singleton instance for backward compatibility
let _supabase: ReturnType<typeof createClient> | null = null
export const supabase = () => {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}