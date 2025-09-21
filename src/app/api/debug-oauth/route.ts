import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the OAuth URL for Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:3000' : 'https://yourdomain.com'}/auth/callback`,
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
      }, { status: 500 })
    }

    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
    }

    return NextResponse.json({
      success: true,
      oauthUrl: data.url,
      redirectTo: `http://localhost:3000/auth/callback`,
      environmentVariables: envCheck,
      message: 'OAuth URL generated successfully'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}