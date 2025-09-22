import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for test endpoints and static files
  if (request.nextUrl.pathname.startsWith('/api/test-supabase') || 
      request.nextUrl.pathname.startsWith('/api/test-oauth') ||
      request.nextUrl.pathname.startsWith('/api/debug-oauth') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon.ico')) {
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}