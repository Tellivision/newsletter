import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  // Check if there's an OAuth error from the provider
  if (error) {
    console.error('OAuth Error:', {
      error,
      error_description: errorDescription,
      url: request.url
    })
    
    // Redirect to error page with error details
    const errorParams = new URLSearchParams({
      error: error,
      description: errorDescription || 'Authentication failed'
    })
    return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('Supabase exchange error:', exchangeError)
      
      // Redirect to error page with exchange error details
      const errorParams = new URLSearchParams({
        error: 'exchange_failed',
        description: exchangeError.message || 'Failed to exchange authorization code'
      })
      return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code&description=No authorization code received`)
}