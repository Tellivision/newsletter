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
      let errorMessage = err instanceof Error ? err.message : 'Failed to import document'
      
      // Check if this might be a Google Sheets URL instead of Docs
      if (docUrl.includes('spreadsheets')) {
        errorMessage = 'This appears to be a Google Sheets URL. For importing email subscribers from spreadsheets, please use the "Import from Google Sheets" option in the email management section below. Google Docs import is only for newsletter content (text documents).'
      }
      
      setError(errorMessage)
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
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <Copy className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Recommended:</strong> Copy and paste your newsletter content directly from Google Docs. 
            This is the fastest and most reliable method.
            <br/><br/>
            <strong>How to:</strong> Open your Google Doc → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste in the Manual Import tab below.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">📋 Manual Import (Recommended)</TabsTrigger>
            <TabsTrigger value="google-docs">🔗 Direct Import (Advanced)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Fastest Method</h4>
              <p className="text-sm text-green-700 mb-3">
                Copy content directly from Google Docs, Word, or any other source. All formatting will be preserved.
              </p>
              <div className="text-xs text-green-600 bg-white rounded p-2 font-mono">
                Google Docs → Ctrl+A (Select All) → Ctrl+C (Copy) → Paste below
              </div>
            </div>
            
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
                💡 <strong>Pro tip:</strong> Paste rich content from Google Docs (Ctrl+V) and formatting like bold, italic, and lists will be preserved.
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
          
          <TabsContent value="google-docs" className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>⚠️ Advanced Feature - Currently Unavailable</strong><br/>
                Direct Google Docs import requires additional OAuth scopes that are complex to configure with Supabase Auth.
                <br/><br/>
                <strong>Alternative:</strong> Use the Manual Import tab above - it's faster and more reliable!
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Why Manual Import is Better:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Faster:</strong> No authentication setup required</li>
                <li>• <strong>More reliable:</strong> Works with any document source</li>
                <li>• <strong>Better formatting:</strong> Preserves rich text formatting</li>
                <li>• <strong>Privacy-friendly:</strong> No additional permissions needed</li>
              </ul>
            </div>

            <div className="text-center p-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                Direct import feature is temporarily disabled.<br/>
                Please use Manual Import for the best experience.
              </p>
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