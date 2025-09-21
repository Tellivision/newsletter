import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Lazy-loaded admin client to prevent build errors when env vars are missing
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables for admin client')
    }

    // Server-side client with service role key for admin operations
    // This should ONLY be used in server-side code (API routes, server components, etc.)
    // Note: This client has access to Supabase Auth built-in tables plus our custom newsletter tables
    _supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return _supabaseAdmin
}

// Use getSupabaseAdmin() function instead of direct export to avoid build errors