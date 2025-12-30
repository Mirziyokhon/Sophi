'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { api, type AuthUser } from '@/lib/api'

type AuthResult = { success: boolean; error?: string; message?: string }

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  googleSignIn: (idToken: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<AuthResult>
  resetPassword: (token: string, password: string) => Promise<AuthResult>
  verifyEmail: (token: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function unwrap<T>(fn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const value = await fn()
    return [value, null]
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return [null, message]
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    const [meErrorless] = await unwrap(() => api.currentUser())
    if (meErrorless) {
      setUser(meErrorless.user)
      return
    }

    const [refreshed] = await unwrap(() => api.refreshSession())
    if (refreshed) {
      setUser(refreshed.user)
      return
    }

    setUser(null)
  }, [])

  useEffect(() => {
    fetchCurrentUser().finally(() => setIsLoading(false))
  }, [fetchCurrentUser])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const [result, error] = await unwrap(() => api.login({ email, password }))
      if (error || !result) {
        return { success: false, error: error ?? undefined }
      }
      setUser(result.user)
      return { success: true }
    },
    []
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const [result, error] = await unwrap(() =>
        api.signup({ full_name: name || undefined, email, password })
      )
      if (error || !result) {
        return { success: false, error: error ?? undefined }
      }
      setUser(result.user)
      return {
        success: true,
        message: result.user.is_email_verified
          ? undefined
          : 'Account created! Please verify your email before continuing.',
      }
    },
    []
  )

  const googleSignIn = useCallback(async (idToken: string): Promise<AuthResult> => {
    const [result, error] = await unwrap(() => api.googleLogin(idToken))
    if (error || !result) {
      return { success: false, error: error ?? undefined }
    }
    setUser(result.user)
    return { success: true }
  }, [])

  const signOut = useCallback(async () => {
    await unwrap(() => api.logout())
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    await fetchCurrentUser()
  }, [fetchCurrentUser])

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    const [, error] = await unwrap(() => api.requestPasswordReset(email))
    if (error) {
      return { success: false, error: error ?? undefined }
    }
    return { success: true }
  }, [])

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<AuthResult> => {
      const [, error] = await unwrap(() => api.resetPassword(token, password))
      if (error) {
        return { success: false, error: error ?? undefined }
      }
      return { success: true }
    },
    []
  )

  const verifyEmail = useCallback(async (token: string): Promise<AuthResult> => {
    const [, error] = await unwrap(() => api.verifyEmail(token))
    if (error) {
      return { success: false, error: error ?? undefined }
    }
    await fetchCurrentUser()
    return { success: true, message: 'Email verified successfully' }
  }, [fetchCurrentUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        googleSignIn,
        signOut,
        refreshUser,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
      }}
    >
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
