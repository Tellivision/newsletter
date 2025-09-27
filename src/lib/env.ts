/**
 * Environment configuration utilities
 * Handles different deployment environments (local, Vercel production, Vercel preview)
 */

export function getBaseUrl(): string {
  // Client-side: use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side: determine the correct URL
  // Vercel provides these environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Production Vercel URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://newsletter-omega-smoky.vercel.app'
  }

  // Development fallback
  return 'http://localhost:3000'
}

export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`
}

export function isVercelEnvironment(): boolean {
  return (
    process.env.VERCEL === '1' || 
    (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'))
  )
}

export function isLocalEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && 
     (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  )
}

export function getEnvironmentInfo() {
  return {
    baseUrl: getBaseUrl(),
    callbackUrl: getAuthCallbackUrl(),
    isVercel: isVercelEnvironment(),
    isLocal: isLocalEnvironment(),
    nodeEnv: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
  }
}