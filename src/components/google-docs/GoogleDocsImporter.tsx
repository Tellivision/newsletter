'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, AlertCircle, CheckCircle, Copy, Type } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GoogleDocsAuth } from './GoogleDocsAuth'

interface GoogleDocsImporterProps {
  onImport: (content: string, title: string) => void
}



export function GoogleDocsImporter({ onImport }: GoogleDocsImporterProps) {
  const { user } = useAuth()
  const [docUrl, setDocUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Manual import states
  const [manualTitle, setManualTitle] = useState('')
  const [manualContent, setManualContent] = useState('')

  const extractDocId = (url: string): string | null => {
    // Check if it's a Google Sheets URL
    if (url.includes('spreadsheets') || url.includes('/spreadsheets/')) {
      return null // Return null to trigger specific error message
    }
    
    // Extract document ID from various Google Docs URL formats
    const patterns = [
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  const importFromGoogleDocs = async () => {
    if (!docUrl.trim()) {
      setError('Please enter a Google Docs URL')
      return
    }

    if (!user) {
      setError('Please sign in with Google to import documents')
      return
    }

    const docId = extractDocId(docUrl)
    if (!docId) {
      if (docUrl.includes('spreadsheets')) {
        setError('This is a Google Sheets link. This feature is for Google Docs (documents) only. For spreadsheet data, please copy and paste the content into the Manual Import tab.')
      } else {
        setError('Invalid Google Docs URL. Please make sure you\'re using a valid Google Docs document link (not Sheets, Slides, or other Google services).')
      }
      return
    }

    setIsImporting(true)
    setError('')
    setSuccess('')

    try {
      // Call our API route to import the document
      const response = await fetch('/api/google-docs/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ docId })
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to import document'
        
        if (response.status === 401) {
          errorMessage = 'Google access token not found - Please re-authenticate. The current Google sign-in may not have sufficient permissions for Google Docs access.'
        } else if (response.status === 403) {
          errorMessage = 'Access denied - Please make sure the document is shared with your account or is publicly accessible.'
        } else if (response.status === 404) {
          errorMessage = 'Document not found - Please check the URL and make sure the document exists.'
        }
        
        throw new Error(errorMessage)
      }

      onImport(data.content, data.title)
      setSuccess(`Successfully imported "${data.title}" from Google Docs!`)
      setDocUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import document')
    } finally {
      setIsImporting(false)
    }
  }



  const importManualContent = () => {
    if (!manualContent.trim()) {
      setError('Please enter some content to import')
      return
    }

    const title = manualTitle.trim() || 'Imported Content'
    onImport(manualContent, title)
    setSuccess(`Successfully imported "${title}"`)
    setManualTitle('')
    setManualContent('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Import Newsletter Content
        </CardTitle>
        <p className="text-sm text-gray-600">
          Import content for your newsletter from Google Docs or paste it manually
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Import</TabsTrigger>
            <TabsTrigger value="google-auth">Google Auth</TabsTrigger>
            <TabsTrigger value="google-docs">Google Docs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <Copy className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended:</strong> Copy and paste your newsletter content directly. This works with any source and doesn&apos;t require special permissions.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Newsletter Title (optional)
              </label>
              <Input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Enter a title for your newsletter"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Newsletter Content
              </label>
              <Textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Paste your newsletter content here... You can copy from Google Docs, Word, or any other source."
                className="w-full min-h-[200px]"
              />
              <p className="text-xs text-gray-500">
                Tip: Copy text from Google Docs (Ctrl+A, Ctrl+C) and paste it here. Basic formatting will be preserved.
              </p>
            </div>
            
            <Button
              onClick={importManualContent}
              disabled={!manualContent.trim()}
              className="w-full flex items-center gap-2"
            >
              <Type className="h-4 w-4" />
              Import Newsletter Content
            </Button>
          </TabsContent>
          
          <TabsContent value="google-auth" className="space-y-4">
            <GoogleDocsAuth />
          </TabsContent>
          
          <TabsContent value="google-docs" className="space-y-4">
            {!user && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please sign in with Google to import documents from Google Docs.
                </AlertDescription>  
              </Alert>
            )}

            {user && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Google Docs API Import:</strong> This imports newsletter content from Google Docs documents.
                  <br/>
                  <strong>Note:</strong> This is NOT for importing email lists/CSV files. This is for importing newsletter article content.
                  <br/>
                  <strong>Requirements:</strong> Google Docs API scope must be added to your OAuth configuration and you need to re-authenticate.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Google Docs URL (Newsletter Content Document)
              </label>
              <Input
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/your-document-id/edit"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Paste the URL of your Google Docs document containing newsletter content. Make sure it&apos;s shared with your account or is public.
                <br/>
                <strong>Note:</strong> This is for newsletter articles, not email lists. For subscriber lists, use the Subscribers page to import CSV files.
              </p>
            </div>

            <Button
              onClick={importFromGoogleDocs}
              disabled={isImporting || !docUrl.trim()}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import from Google Docs'}
            </Button>

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Supported formats:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Text content and paragraphs</li>
                <li>Basic formatting (bold, italic)</li>
                <li>Tables (converted to text)</li>
                <li>Lists and bullet points</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mt-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}