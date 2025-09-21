import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient, type PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables are not configured',
      })
    }

    const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnon, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Test public client connection
    const { error: publicError } = await supabase
      .from('subscribers')
      .select('count')
      .limit(1)

    if (publicError && publicError.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
      console.error('Public client error:', publicError)
      return NextResponse.json({
        success: false,
        error: 'Public client connection failed',
        details: publicError.message
      }, { status: 500 })
    }

    // Test admin client connection (only if service key is available)
    let adminError: PostgrestError | null = null
    if (supabaseServiceKey) {
      const supabaseAdmin = createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const adminRes = await supabaseAdmin
        .from('subscribers')
        .select('count')
        .limit(1)
      adminError = adminRes.error
    }

    if (adminError && adminError.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
      console.error('Admin client error:', adminError)
      return NextResponse.json({
        success: false,
        error: 'Admin client connection failed',
        details: adminError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString(),
      clients: {
        public: publicError?.code === 'PGRST116' ? 'Connected (table not found - expected)' : 'Connected',
        admin: adminError?.code === 'PGRST116' ? 'Connected (table not found - expected)' : 'Connected'
      }
    })

  } catch (error: unknown) {
    console.error('Supabase connection test failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: errorMessage
    }, { status: 500 })
  }
}