import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
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

    // Test admin client connection
    const { error: adminError } = await supabaseAdmin
      .from('subscribers')
      .select('count')
      .limit(1)

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