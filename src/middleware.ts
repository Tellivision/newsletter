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
     * Match all request paths except for the ones starting with:
     * - _next (static files, image optimization, etc.)
     * - static (static files)
     * - favicon.ico (favicon file)
     * - Any file with a standard web extension
     */
    '/((?!_next|static|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp|js|css|ico|json|woff|woff2|ttf|otf|eot)$).*)',
  ],
}