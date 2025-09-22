import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time or if environment variables are not configured
    // Return the response without authentication checks
    console.warn('Supabase environment variables not available, skipping auth check')
    return supabaseResponse
  }
  
  // For Vercel deployments, ensure we're using the correct URL
  const host = request.headers.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { [key: string]: unknown }) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { [key: string]: unknown }) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    // If auth check fails in edge runtime, continue without user
    console.warn('Auth check failed in middleware:', error)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.redirect() or
  // NextResponse.rewrite(), you must:
  // 1. Pass the request in it, like so: NextResponse.redirect(url, { request })
  // 2. Copy over the cookies, like so: response.cookies.setAll(supabaseResponse.cookies.getAll())

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/api/auth'
  ]
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  )

  if (!user && !isPublicRoute) {
    // No user and not a public route, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    
    // Ensure we're using the correct URL for redirects
    const response = NextResponse.redirect(url, { request })
    
    // Copy cookies from the Supabase-managed response
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie)
    }
    return response
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}