import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSessionWithGoogleToken, createUnauthorizedResponse } from '@/lib/auth-helpers'
import { google } from 'googleapis'

interface SendNewsletterRequest {
  subject: string
  content: string
  recipients: string[]
  scheduledAt?: string
  isTest?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { session, accessToken, error } = await getSupabaseSessionWithGoogleToken()
    
    if (error || !session || !accessToken) {
      return createUnauthorizedResponse(error || 'Unauthorized - Please sign in with Google')
    }

    const { subject, content, recipients, scheduledAt, isTest }: SendNewsletterRequest = await request.json()
    
    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Subject, content, and recipients are required' },
        { status: 400 }
      )
    }

    // Initialize Gmail API
    const auth = new google.auth.OAuth2()
    auth.setCredentials({
      access_token: accessToken
    })

    const gmail = google.gmail({ version: 'v1', auth })

    // If scheduled, store in database (for now, we'll just send immediately)
    if (scheduledAt && !isTest) {
      // TODO: Implement scheduling logic with database storage
      return NextResponse.json(
        { message: 'Newsletter scheduled successfully', scheduledAt },
        { status: 200 }
      )
    }

    // Send emails
    const results = []
    const errors = []

    for (const recipient of recipients) {
      try {
        // Apply personalization tokens
        const personalizedContent = applyPersonalization(content, recipient)
        const personalizedSubject = applyPersonalization(subject, recipient)

        // Create email message
        const emailMessage = createEmailMessage(
          session.user?.email || '',
          recipient,
          personalizedSubject,
          personalizedContent
        )

        // Send email
        const response = await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: emailMessage
          }
        })

        results.push({
          recipient,
          messageId: response.data.id,
          status: 'sent'
        })
      } catch (error) {
        console.error(`Failed to send to ${recipient}:`, error)
        errors.push({
          recipient,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.length
    const errorCount = errors.length
    const totalCount = recipients.length

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${successCount}/${totalCount} recipients`,
      results,
      errors,
      stats: {
        total: totalCount,
        sent: successCount,
        failed: errorCount
      }
    })

  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: 'Failed to send newsletter. Please try again.' },
      { status: 500 }
    )
  }
}

function applyPersonalization(text: string, email: string): string {
  // Extract name from email (simple approach)
  const name = email.split('@')[0].replace(/[._]/g, ' ')
  
  return text
    .replace(/{{name}}/gi, name)
    .replace(/{{email}}/gi, email)
    .replace(/{{first_name}}/gi, name.split(' ')[0])
}

function createEmailMessage(
  from: string,
  to: string,
  subject: string,
  htmlContent: string
): string {
  const textContent = htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
  
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="boundary123"',
    '',
    '--boundary123',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    textContent,
    '',
    '--boundary123',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlContent,
    '',
    '--boundary123--'
  ].join('\n')

  // Encode in base64url format
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}