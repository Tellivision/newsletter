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

  useEffect(() => {
    setMounted(true)
    
    // Prevent hydration errors by only running auth code on the client
    if (typeof window !== 'undefined') {
      const supabase = createClient()

      // Get initial session
      const getInitialSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          setSession(session)
          setUser(session?.user ?? null)
        } catch (error) {
          console.error('Error getting initial session:', error)
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
    } else {
      // Server-side rendering case
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
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
  }

  const signOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      return { error }
    }

    // Redirect to sign-in page after successful sign-out
    window.location.href = '/auth/signin'

    return { error: null }
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