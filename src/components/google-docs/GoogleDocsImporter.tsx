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
      setError('Invalid Google Docs URL. Please check the URL and try again.')
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
          Import Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Import</TabsTrigger>
            <TabsTrigger value="google-docs">Google Docs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <Copy className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended:</strong> Copy and paste your content directly. This works with any source and doesn&apos;t require special permissions.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Title (optional)
              </label>
              <Input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Enter a title for your content"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Content
              </label>
              <Textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Paste your content here... You can copy from Google Docs, Word, or any other source."
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
              Import Content
            </Button>
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
                  <strong>Note:</strong> Google Docs import requires additional API permissions. 
                  If you see authentication errors, the Google OAuth configuration may need to include Google Docs API scopes.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Google Docs URL
              </label>
              <Input
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/your-document-id/edit"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Paste the URL of your Google Docs document. Make sure it&apos;s shared with your account or is public.
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