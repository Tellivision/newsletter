'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import AuthLoadingFallback from '@/components/auth-loading-fallback'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Prevent hydration errors by only running auth code on the client
    if (typeof window !== 'undefined') {
      try {
        const supabase = createClient()

        // Get initial session
        const getInitialSession = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user ?? null)
          } catch (error) {
            console.error('Error getting initial session:', error)
            setError(error instanceof Error ? error.message : 'Failed to initialize authentication')
          } finally {
            setLoading(false)
          }
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
          }
        )

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('Error initializing Supabase client:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize Supabase client')
        setLoading(false)
      }
    } else {
      // Server-side rendering case
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid email profile https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file',
        },
      })

      if (error) {
        console.error('Error signing in with Google:', error)
        return { error }
      }

      if (data?.url) {
        window.location.href = data.url
      }

      return { error: null }
    } catch (error) {
      console.error('Error during Google sign-in setup:', error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        return { error }
      }

      // Redirect to sign-in page after successful sign-out
      window.location.href = '/auth/signin'

      return { error: null }
    } catch (error) {
      console.error('Error during sign-out:', error)
      return { error: error as AuthError }
    }
  }

  // If there's a configuration error, show it
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Configuration Error</h1>
          <p className="text-sm text-gray-600 text-center mb-4">
            The application is not properly configured. Please check the environment variables.
          </p>
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-sm text-red-800 font-mono break-all">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut
  }

  // Show loading UI during initial auth check
  if (!mounted || loading) {
    return <AuthLoadingFallback />
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}