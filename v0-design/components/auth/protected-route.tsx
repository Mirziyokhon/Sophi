'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SignIn } from './signin'
import { SignUp } from './signup'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EEE9]">
        <div className="text-[#1E1A1C] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A0813] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthGate />
  }

  return <>{children}</>
}

function AuthGate() {
  const [isSignIn, setIsSignIn] = useState(true)
  const { user } = useAuth()

  // If user is authenticated, this component won't be rendered due to ProtectedRoute logic
  // But we still need to handle the success callback properly
  const handleAuthSuccess = () => {
    // The auth context will handle the state update
    // This will trigger a re-render and show the protected content
  }

  if (user) {
    return null // Should not happen, but just in case
  }

  return isSignIn ? (
    <SignIn 
      onSwitchToSignUp={() => setIsSignIn(false)} 
      onSuccess={handleAuthSuccess}
    />
  ) : (
    <SignUp 
      onSwitchToSignIn={() => setIsSignIn(true)} 
      onSuccess={handleAuthSuccess}
    />
  )
}
