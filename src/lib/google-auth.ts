import { google } from 'googleapis'

// Create a separate Google OAuth client for Docs API
export function createGoogleDocsAuth() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
  )
}

// Get authorization URL for Google Docs access
export function getGoogleDocsAuthUrl() {
  const oauth2Client = createGoogleDocsAuth()
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'openid',
      'email', 
      'profile',
      'https://www.googleapis.com/auth/documents.readonly'
    ],
    prompt: 'consent' // Force consent to get refresh token
  })
}

// Exchange code for tokens
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createGoogleDocsAuth()
  
  try {
    const { tokens } = await oauth2Client.getToken(code)
    return { tokens, error: null }
  } catch (error) {
    return { tokens: null, error: error instanceof Error ? error.message : 'Token exchange failed' }
  }
}