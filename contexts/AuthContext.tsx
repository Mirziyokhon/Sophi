'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const GUEST_USER: User = {
  id: 'guest',
  email: 'guest@sophi.ai',
  name: 'Guest',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(GUEST_USER)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const savedUser = localStorage.getItem('sophi_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('sophi_user')
        setUser(GUEST_USER)
      }
    } else {
      setUser(GUEST_USER)
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call - in production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication - accept any email/password for demo
      if (email && password) {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0] // Use email prefix as name for demo
        }
        
        setUser(user)
        localStorage.setItem('sophi_user', JSON.stringify(user))
        return { success: true }
      } else {
        return { success: false, error: 'Please enter email and password' }
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during sign in' }
    }
  }

  const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (name && email && password) {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name
        }
        
        setUser(user)
        localStorage.setItem('sophi_user', JSON.stringify(user))
        return { success: true }
      } else {
        return { success: false, error: 'Please fill in all fields' }
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during sign up' }
    }
  }

  const signOut = () => {
    setUser(GUEST_USER)
    localStorage.removeItem('sophi_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: true,
        signIn,
        signUp,
        signOut,
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
