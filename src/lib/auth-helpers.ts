import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function getSupabaseSession() {
  const supabase = await createClient()

  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.user) {
    return { session: null, error: 'Unauthorized' }
  }

  return { session, error: null }
}

export async function getSupabaseSessionWithGoogleToken() {
  const { session, error } = await getSupabaseSession()
  
  if (error || !session) {
    return { session: null, accessToken: null, error }
  }

  const accessToken = session.provider_token
  
  if (!accessToken) {
    return { 
      session: null, 
      accessToken: null, 
      error: 'Google access token not found - Please re-authenticate' 
    }
  }

  return { session, accessToken, error: null }
}

export function createUnauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}