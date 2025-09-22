'use client'

import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Info, ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the diagnostics component to avoid SSR issues
const ContextDiagnostics = dynamic(
  () => import('./context-diagnostics'),
  { ssr: false, loading: () => <div className="p-4 text-center">Loading diagnostics...</div> }
)

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDiagnostics: boolean
  errorContext: {
    url: string
    userAgent: string
    timestamp: string
  } | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDiagnostics: false,
    errorContext: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    // Collect additional context information
    const errorContext = {
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
      timestamp: new Date().toISOString()
    }
    
    this.setState({ 
      errorInfo,
      errorContext
    })
    
    // Log to console in a structured way for easier debugging
    console.group('Detailed Error Information')
    console.error('Error:', error)
    console.error('Component Stack:', errorInfo.componentStack)
    console.info('Context:', errorContext)
    console.groupEnd()
  }

  private handleReset = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDiagnostics: false,
      errorContext: null
    })
    // Attempt to reload the page
    window.location.reload()
  }
  
  private toggleDiagnostics = (): void => {
    this.setState(prevState => ({
      showDiagnostics: !prevState.showDiagnostics
    }))
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl mb-4">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-center text-red-900">Something went wrong</CardTitle>
              <CardDescription className="text-center text-red-700">
                The application encountered an unexpected error. This might be due to missing environment variables or authentication issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error message */}
              <div className="bg-red-50 p-4 rounded-md text-sm text-red-800 font-mono overflow-auto max-h-40">
                {this.state.error?.toString() || 'Unknown error'}
              </div>
              
              {/* Error context information */}
              {this.state.errorContext && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm">
                  <h4 className="font-medium mb-2 text-gray-700">Error Context</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex">
                      <span className="font-medium w-24">URL:</span>
                      <span className="text-gray-600">{this.state.errorContext.url}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-24">Time:</span>
                      <span className="text-gray-600">{new Date(this.state.errorContext.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-24">Browser:</span>
                      <span className="text-gray-600 truncate">{this.state.errorContext.userAgent}</span>
                    </div>
                  </div>
                </div>
              )}
              
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
                </ul>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={this.toggleDiagnostics} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  {this.state.showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
                </Button>
                
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Application
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Diagnostics panel */}
          {this.state.showDiagnostics && (
            <div className="w-full max-w-2xl">
              <Suspense fallback={<div className="p-4 text-center">Loading diagnostics...</div>}>
                <ContextDiagnostics />
              </Suspense>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary