import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test the OAuth provider configuration
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback?next=http://localhost:3000/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'OAuth configuration test successful',
      redirectUrl: data.url
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test OAuth configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}