import { NextResponse } from 'next/server'
import { getSupabaseSession, createUnauthorizedResponse } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    const { session, error: authError } = await getSupabaseSession()
    if (authError || !session) {
      return createUnauthorizedResponse()
    }

    const { csvUrl } = await request.json()
    
    if (!csvUrl) {
      return NextResponse.json(
        { error: 'CSV URL is required' },
        { status: 400 }
      )
    }

    // Fetch the CSV data from Google Sheets
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Access denied. Please make sure your Google Sheets is shared publicly with "Anyone with the link can view".' },
          { status: 403 }
        )
      }
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    
    // Parse CSV and extract emails
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line)
    const emails: string[] = []
    
    for (const line of lines) {
      // Split by comma and clean up
      const fields = line.split(',').map(field => field.trim().replace(/['"]/g, ''))
      
      // Look for email addresses in each field
      for (const field of fields) {
        if (field.includes('@') && field.includes('.')) {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (emailRegex.test(field)) {
            emails.push(field.toLowerCase())
          }
        }
      }
    }
    
    // Remove duplicates
    const uniqueEmails = [...new Set(emails)]

    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses found in the Google Sheets' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      emails: uniqueEmails,
      count: uniqueEmails.length,
      message: `Found ${uniqueEmails.length} unique email addresses`
    })

  } catch (error) {
    console.error('Google Sheets import error:', error)
    return NextResponse.json(
      { error: 'Failed to import from Google Sheets. Please check the URL and make sure the sheet is publicly accessible.' },
      { status: 500 }
    )
  }
}