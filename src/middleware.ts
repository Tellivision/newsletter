import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets, API endpoints, and other non-authenticated routes
  if (request.nextUrl.pathname.startsWith('/api/test-supabase') || 
      request.nextUrl.pathname.startsWith('/api/test-oauth') ||
      request.nextUrl.pathname.startsWith('/api/debug-oauth') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('favicon.ico') ||
      request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|js|css)$/)) {
    return NextResponse.next()
  }
  
  try {
    return await updateSession(request)
  } catch (error) {
    console.warn('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match specific paths that need authentication:
     * - Main app routes that require authentication
     */
    '/',
    '/analytics/:path*',
    '/editor/:path*',
    '/newsletters/:path*',
    '/subscribers/:path*',
    '/templates/:path*',
  ],
}