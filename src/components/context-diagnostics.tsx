'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export default function ContextDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results: DiagnosticResult[] = []

    // Check environment variables
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    envVars.forEach(envVar => {
      const value = process.env[envVar]
      results.push({
        name: `Environment Variable: ${envVar}`,
        status: value ? 'success' : 'error',
        message: value ? 'Available' : 'Missing',
        details: value ? `Value starts with: ${value.substring(0, 4)}...` : 'Environment variable is not defined'
      })
    })

    // Check window object availability
    results.push({
      name: 'Window Object',
      status: typeof window !== 'undefined' ? 'success' : 'error',
      message: typeof window !== 'undefined' ? 'Available' : 'Not available',
      details: typeof window !== 'undefined' ? 'Running in browser environment' : 'Running in server environment'
    })

    // Check document object availability
    results.push({
      name: 'Document Object',
      status: typeof document !== 'undefined' ? 'success' : 'error',
      message: typeof document !== 'undefined' ? 'Available' : 'Not available',
      details: typeof document !== 'undefined' ? 'DOM is accessible' : 'DOM is not accessible'
    })

    // Check localStorage availability
    let localStorageAvailable = false
    try {
      localStorageAvailable = typeof localStorage !== 'undefined'
      if (localStorageAvailable) {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
      }
    } catch (e) {
      localStorageAvailable = false
    }

    results.push({
      name: 'Local Storage',
      status: localStorageAvailable ? 'success' : 'error',
      message: localStorageAvailable ? 'Available' : 'Not available',
      details: localStorageAvailable ? 'Browser storage is accessible' : 'Browser storage is not accessible'
    })

    setDiagnostics(results)
    setIsRunning(false)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          System Diagnostics
        </CardTitle>
        <CardDescription>
          Checking for potential issues that might cause blank pages or errors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Run Diagnostics Again
                </>
              )}
            </Button>
            <Button 
              onClick={() => setShowDetails(!showDetails)} 
              variant="ghost"
              size="sm"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          <div className="border rounded-md divide-y">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {diagnostic.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : diagnostic.status === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{diagnostic.name}</p>
                      <p className={`text-sm ${
                        diagnostic.status === 'success' ? 'text-green-600' : 
                        diagnostic.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {diagnostic.message}
                      </p>
                      {showDetails && diagnostic.details && (
                        <p className="text-xs text-gray-500 mt-1">{diagnostic.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {diagnostics.some(d => d.status === 'error') && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800 text-sm">
              <p className="font-semibold">Potential issues detected</p>
              <p className="mt-1">
                Missing environment variables or browser API limitations may be causing the blank page.
                Please check your Vercel environment configuration and ensure all required variables are set.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}