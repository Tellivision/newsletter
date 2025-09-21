'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface GoogleDocsImporterProps {
  onImport: (content: string, title: string) => void
}

interface DocumentData {
  title: string
  content: string
}

export function GoogleDocsImporter({ onImport }: GoogleDocsImporterProps) {
  const { user } = useAuth()
  const [docUrl, setDocUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        throw new Error(data.error || 'Failed to import document')
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



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Import from Google Docs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            Paste the URL of your Google Docs document. Make sure it's shared with your account or is public.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={importFromGoogleDocs}
          disabled={isImporting || !docUrl.trim()}
          className="w-full flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isImporting ? 'Importing...' : 'Import Document'}
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
      </CardContent>
    </Card>
  )
}