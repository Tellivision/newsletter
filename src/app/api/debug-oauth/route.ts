import { NextResponse } from 'next/server'
import { getAuthCallbackUrl, getEnvironmentInfo, getBaseUrl } from '@/lib/env'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const currentDomain = url.origin
    
    // Get environment information
    const envInfo = getEnvironmentInfo()
    const callbackUrl = getAuthCallbackUrl()
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Missing ✗',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : 'Missing ✗',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : 'Missing ✗',
      vercelUrl: process.env.VERCEL_URL || 'Not set',
      nodeEnv: process.env.NODE_ENV || 'Not set',
    }

    // Generate the exact URLs you need for Google OAuth configuration
    const requiredGoogleOAuthUrls = {
      authorizedJavaScriptOrigins: [
        'http://localhost:3000',
        'https://newsletter-omega-smoky.vercel.app',
        'https://vercel.app',
      ],
      authorizedRedirectUris: [
        'http://localhost:3000/auth/callback',
        'https://newsletter-omega-smoky.vercel.app/auth/callback',
        callbackUrl, // Current environment callback
      ]
    }

    // Generate Supabase redirect URLs
    const requiredSupabaseRedirectUrls = [
      'http://localhost:3000/auth/callback',
      'https://newsletter-omega-smoky.vercel.app/auth/callback',
      'https://*.vercel.app/auth/callback',
      'https://vercel.app/**',
    ]

    return NextResponse.json({
      success: true,
      message: 'OAuth Debug Information',
      currentRequest: {
        domain: currentDomain,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      },
      environment: envInfo,
      environmentVariables: envCheck,
      oauthConfiguration: {
        currentCallbackUrl: callbackUrl,
        googleOAuthSetup: {
          note: 'Add these EXACT URLs to your Google Cloud Console OAuth 2.0 Client ID',
          authorizedJavaScriptOrigins: requiredGoogleOAuthUrls.authorizedJavaScriptOrigins,
          authorizedRedirectUris: requiredGoogleOAuthUrls.authorizedRedirectUris,
        },
        supabaseAuthSetup: {
          note: 'Add these URLs to Supabase Auth Settings → URL Configuration → Redirect URLs',
          siteUrl: 'https://newsletter-omega-smoky.vercel.app',
          redirectUrls: requiredSupabaseRedirectUrls,
        }
      },
      troubleshooting: {
        redirectUriMismatchError: {
          issue: 'The redirect URI in Google OAuth does not match what your app is sending',
          solution: 'Add the exact callback URL above to your Google OAuth configuration',
          currentCallbackBeingSent: callbackUrl,
        },
        n8nZuluError: {
          issue: 'Your Google OAuth app is configured for "N8N Zulu" project',
          solution: 'Either create new OAuth credentials for GoogLetter or use the correct project credentials',
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}