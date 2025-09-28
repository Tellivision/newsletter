'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SheetsImporterProps {
  onImport: (emails: string[]) => void
}

export function SheetsImporter({ onImport }: SheetsImporterProps) {
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const extractSheetsId = (url: string): string | null => {
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /spreadsheets\/d\/([a-zA-Z0-9-_]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  const importFromGoogleSheets = async () => {
    if (!sheetsUrl.trim()) {
      setError('Please enter a Google Sheets URL')
      return
    }

    const sheetsId = extractSheetsId(sheetsUrl)
    if (!sheetsId) {
      setError('Invalid Google Sheets URL. Please make sure you\'re using a valid Google Sheets link.')
      return
    }

    setIsImporting(true)
    setError('')
    setSuccess('')

    try {
      // Try to access the CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetsId}/export?format=csv&gid=0`
      
      const response = await fetch(`/api/google-sheets/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvUrl, originalUrl: sheetsUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import from Google Sheets')
      }

      if (data.emails && data.emails.length > 0) {
        onImport(data.emails)
        setSuccess(`Successfully imported ${data.emails.length} email addresses from Google Sheets`)
        setSheetsUrl('')
      } else {
        setError('No email addresses found in the Google Sheets. Make sure your spreadsheet contains email addresses.')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import from Google Sheets'
      setError(errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table className="h-5 w-5" />
          Import from Google Sheets
        </CardTitle>
        <p className="text-sm text-gray-600">
          Import email addresses directly from a Google Sheets spreadsheet
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Requirements:</strong> Your Google Sheets must be publicly accessible (shared with &quot;Anyone with the link can view&quot;).
            <br/>
            <strong>Format:</strong> Emails can be in any column - the importer will automatically detect them.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Google Sheets URL
          </label>
          <Input
            value={sheetsUrl}
            onChange={(e) => setSheetsUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Paste the URL of your Google Sheets document. Make sure it&apos;s shared publicly or with &quot;Anyone with the link can view&quot;.
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
          onClick={importFromGoogleSheets}
          disabled={isImporting || !sheetsUrl.trim()}
          className="w-full flex items-center gap-2"
        >
          <Table className="h-4 w-4" />
          {isImporting ? 'Importing...' : 'Import from Google Sheets'}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>How to prepare your Google Sheets:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Put email addresses in any column</li>
            <li>Share the sheet: File → Share → Change to &quot;Anyone with the link&quot;</li>
            <li>Copy the sharing URL and paste it above</li>
            <li>The importer will find and extract all valid email addresses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}