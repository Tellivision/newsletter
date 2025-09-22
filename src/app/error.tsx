'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Info } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the diagnostics component to avoid SSR issues
const ContextDiagnostics = dynamic(
  () => import('@/components/context-diagnostics'),
  { ssr: false, loading: () => <div className="p-4 text-center">Loading diagnostics...</div> }
)

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDiagnostics, setShowDiagnostics] = React.useState(false)

  React.useEffect(() => {
    // Log the error to the console
    console.error('Global error caught:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl mb-4">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-center text-red-900">Application Error</CardTitle>
              <CardDescription className="text-center text-red-700">
                The application encountered a critical error. This is likely due to missing environment variables or authentication configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error message */}
              <div className="bg-red-50 p-4 rounded-md text-sm text-red-800 font-mono overflow-auto max-h-40">
                {error.message || error.toString()}
                {error.digest && (
                  <div className="mt-2 text-xs">
                    Error ID: {error.digest}
                  </div>
                )}
              </div>
              
              {/* Common solutions */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-800">
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Possible Solutions
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Check that all required environment variables are set in your Vercel project</li>
                  <li>Ensure Supabase authentication is properly configured</li>
                  <li>Verify that your browser supports all required features</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Check the browser console for more detailed error messages</li>
                </ul>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => setShowDiagnostics(!showDiagnostics)} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
                </Button>
                
                <Button onClick={reset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Diagnostics panel */}
          {showDiagnostics && (
            <div className="w-full max-w-2xl">
              <ContextDiagnostics />
            </div>
          )}
        </div>
      </body>
    </html>
  )
}