'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Shield, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function GoogleDocsAuth() {
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getAuthUrl = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/google-docs')
      const data = await response.json()
      
      if (data.authUrl) {
        setAuthUrl(data.authUrl)
      } else {
        setError('Failed to get authorization URL')
      }
    } catch (error) {
      console.error('Auth URL error:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Google Docs Authorization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Additional Authorization Required:</strong> 
            To import from Google Docs, you need to grant additional permissions beyond the basic login.
            This is separate from your regular Google sign-in.
          </AlertDescription>
        </Alert>

        {!authUrl && (
          <Button 
            onClick={getAuthUrl}
            disabled={loading}
            className="w-full flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {loading ? 'Generating...' : 'Get Google Docs Authorization'}
          </Button>
        )}

        {authUrl && (
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Step 1:</strong> Click the button below to authorize Google Docs access
                <br />
                <strong>Step 2:</strong> After authorization, return here to use Google Docs import
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => window.open(authUrl, '_blank')}
              className="w-full flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Authorize Google Docs Access
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Grants permission to read your Google Docs</li>
            <li>Allows the app to import document content</li>
            <li>Does not give access to edit or delete documents</li>
            <li>This is separate from your login authentication</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}