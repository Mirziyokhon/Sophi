'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (response: { credential: string }) => void }): void
          prompt(callback?: () => void): void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  text?: string
  className?: string
}

export function GoogleSignInButton({
  text = 'Continue with Google',
  className = '',
}: GoogleSignInButtonProps) {
  const { googleSignIn } = useAuth()
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.google) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => toast.error('Failed to load Google auth script')
    document.body.appendChild(script)
  }, [])

  const handleGoogleLogin = () => {
    if (!clientId) {
      toast.error('Google Client ID is not configured.')
      return
    }
    if (!scriptLoaded || typeof window === 'undefined' || !window.google?.accounts?.id) {
      toast.error('Google auth is not ready yet. Please try again.')
      return
    }

    try {
      setIsLoading(true)
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) {
            toast.error('Google login failed. Please try again.')
            setIsLoading(false)
            return
          }
          const result = await googleSignIn(credential)
          if (result.success) {
            toast.success('Signed in with Google')
          } else {
            toast.error(result.error || 'Google sign-in failed')
          }
          setIsLoading(false)
        },
      })
      window.google.accounts.id.prompt(() => setIsLoading(false))
    } catch (error) {
      console.error(error)
      toast.error('Unable to start Google sign-in')
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full py-3 border border-[#F4EEE9]/20 rounded-xl hover:bg-[#F4EEE9]/5 text-[#F4EEE9] transition-all cursor-pointer flex items-center justify-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
        </svg>
      )}
      {text}
    </button>
  )
}
