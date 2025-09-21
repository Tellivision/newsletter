import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSessionWithGoogleToken, createUnauthorizedResponse } from '@/lib/auth-helpers'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
  try {
    const { session, accessToken, error } = await getSupabaseSessionWithGoogleToken()
    
    if (error || !session || !accessToken) {
      return createUnauthorizedResponse(error || 'Unauthorized - Please sign in with Google')
    }

    const { docId } = await request.json()
    
    if (!docId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Initialize Google Docs API
    const auth = new google.auth.OAuth2()
    auth.setCredentials({
      access_token: accessToken
    })

    const docs = google.docs({ version: 'v1', auth })

    // Fetch the document
    const response = await docs.documents.get({
      documentId: docId
    })

    const document = response.data
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Extract content from the document
    const content = extractTextFromDocument(document)
    const title = document.title || 'Imported Document'

    return NextResponse.json({
      title,
      content,
      success: true
    })

  } catch (error: any) {
    console.error('Google Docs import error:', error)
    
    if (error.code === 403) {
      return NextResponse.json(
        { error: 'Access denied. Please make sure the document is shared with your account or is public.' },
        { status: 403 }
      )
    } else if (error.code === 404) {
      return NextResponse.json(
        { error: 'Document not found. Please check the URL and try again.' },
        { status: 404 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to import document. Please try again.' },
        { status: 500 }
      )
    }
  }
}

function extractTextFromDocument(document: any): string {
  let content = ''
  
  if (document.body && document.body.content) {
    for (const element of document.body.content) {
      if (element.paragraph) {
        const paragraphText = extractParagraphText(element.paragraph)
        if (paragraphText.trim()) {
          content += paragraphText + '\n\n'
        }
      } else if (element.table) {
        // Handle tables (basic support)
        content += extractTableText(element.table) + '\n\n'
      }
    }
  }
  
  return content.trim()
}

function extractParagraphText(paragraph: any): string {
  let text = ''
  
  if (paragraph.elements) {
    for (const element of paragraph.elements) {
      if (element.textRun && element.textRun.content) {
        let textContent = element.textRun.content
        
        // Apply basic formatting based on text style
        if (element.textRun.textStyle) {
          const style = element.textRun.textStyle
          if (style.bold) {
            textContent = `**${textContent}**`
          }
          if (style.italic) {
            textContent = `*${textContent}*`
          }
          if (style.underline) {
            textContent = `<u>${textContent}</u>`
          }
        }
        
        text += textContent
      }
    }
  }
  
  return text
}

function extractTableText(table: any): string {
  let tableText = ''
  
  if (table.tableRows) {
    for (const row of table.tableRows) {
      let rowText = ''
      if (row.tableCells) {
        for (const cell of row.tableCells) {
          if (cell.content) {
            for (const element of cell.content) {
              if (element.paragraph) {
                rowText += extractParagraphText(element.paragraph) + ' | '
              }
            }
          }
        }
      }
      if (rowText) {
        tableText += rowText.slice(0, -3) + '\n' // Remove last ' | '
      }
    }
  }
  
  return tableText
}