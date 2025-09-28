import { NextResponse } from 'next/server'
import { getGoogleDocsAuthUrl } from '@/lib/google-auth'

export async function GET() {
  try {
    const authUrl = getGoogleDocsAuthUrl()
    
    return NextResponse.json({ 
      authUrl,
      message: 'Visit this URL to authorize Google Docs access' 
    })
  } catch (error) {
    console.error('Google Docs auth URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    )
  }
}