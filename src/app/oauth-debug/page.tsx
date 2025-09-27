'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

interface DebugInfo {
  success: boolean
  environment: any
  environmentVariables: any
  oauthConfiguration: any
  troubleshooting: any
  currentRequest: any
}

export default function OAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug-oauth')
      const data = await response.json()
      setDebugInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debug info')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyArray = (items: string[]) => {
    navigator.clipboard.writeText(items.join('\n'))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading debug information...</p>
        </div>
      </div>
    )
  }

  if (error || !debugInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Debug Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || 'No debug information available'}</p>
            <Button onClick={fetchDebugInfo}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OAuth Configuration Debug</h1>
          <p className="text-gray-600">Use this information to fix your Google OAuth setup</p>
        </div>

        <div className="grid gap-6">
          {/* Current Environment */}
          <Card>
            <CardHeader>
              <CardTitle>Current Environment</CardTitle>
              <CardDescription>Information about your current deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Base URL:</strong> {debugInfo.environment.baseUrl}
                </div>
                <div>
                  <strong>Callback URL:</strong> {debugInfo.environment.callbackUrl}
                </div>
                <div>
                  <strong>Is Vercel:</strong> {debugInfo.environment.isVercel ? '✅' : '❌'}
                </div>
                <div>
                  <strong>Is Local:</strong> {debugInfo.environment.isLocal ? '✅' : '❌'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Check if all required variables are set</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(debugInfo.environmentVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{key}:</span>
                    <span className={`flex items-center gap-1 ${
                      String(value).includes('✓') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {String(value).includes('✓') ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Google OAuth Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Google OAuth Configuration</CardTitle>
              <CardDescription>Add these EXACT URLs to your Google Cloud Console</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Authorized JavaScript Origins</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyArray(debugInfo.oauthConfiguration.googleOAuthSetup.authorizedJavaScriptOrigins)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
                  {debugInfo.oauthConfiguration.googleOAuthSetup.authorizedJavaScriptOrigins.map((url: string) => (
                    <div key={url} className="flex items-center justify-between">
                      <span>{url}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(url)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Authorized Redirect URIs</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyArray(debugInfo.oauthConfiguration.googleOAuthSetup.authorizedRedirectUris)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
                  {debugInfo.oauthConfiguration.googleOAuthSetup.authorizedRedirectUris.map((url: string) => (
                    <div key={url} className="flex items-center justify-between">
                      <span>{url}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(url)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supabase Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Supabase Configuration</CardTitle>
              <CardDescription>Add these URLs to your Supabase Auth settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Site URL</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm flex items-center justify-between">
                  <span>{debugInfo.oauthConfiguration.supabaseAuthSetup.siteUrl}</span>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(debugInfo.oauthConfiguration.supabaseAuthSetup.siteUrl)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Redirect URLs</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyArray(debugInfo.oauthConfiguration.supabaseAuthSetup.redirectUrls)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
                  {debugInfo.oauthConfiguration.supabaseAuthSetup.redirectUrls.map((url: string) => (
                    <div key={url} className="flex items-center justify-between">
                      <span>{url}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(url)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h4 className="font-semibold text-red-800 mb-2">redirect_uri_mismatch Error</h4>
                <p className="text-red-700 text-sm mb-2">{debugInfo.troubleshooting.redirectUriMismatchError.issue}</p>
                <p className="text-red-700 text-sm mb-2"><strong>Solution:</strong> {debugInfo.troubleshooting.redirectUriMismatchError.solution}</p>
                <p className="text-red-700 text-sm"><strong>Current callback being sent:</strong> {debugInfo.troubleshooting.redirectUriMismatchError.currentCallbackBeingSent}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">N8N Zulu Project Error</h4>
                <p className="text-yellow-700 text-sm mb-2">{debugInfo.troubleshooting.n8nZuluError.issue}</p>
                <p className="text-yellow-700 text-sm"><strong>Solution:</strong> {debugInfo.troubleshooting.n8nZuluError.solution}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Cloud Console - Credentials
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Supabase Dashboard
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}