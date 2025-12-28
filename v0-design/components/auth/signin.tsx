'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface SignInProps {
  onSwitchToSignUp: () => void
  onSuccess: () => void
}

export function SignIn({ onSwitchToSignUp, onSuccess }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        toast.success('Welcome back! You are now signed in.')
        onSuccess()
      } else {
        toast.error(result.error || 'Sign in failed')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-8 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-serif text-[#F4EEE9]">Welcome Back</h1>
            <p className="text-[#F4EEE9]/60">Sign in to your account to continue learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#F4EEE9] text-[#1a0509] font-bold rounded-xl hover:bg-white shadow-lg hover:shadow-[#cfaa32]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F4EEE9]/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a0509]/0 backdrop-blur-md text-[#F4EEE9]/40">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full py-3 border border-[#F4EEE9]/20 rounded-xl hover:bg-[#F4EEE9]/5 text-[#F4EEE9] transition-all cursor-pointer flex items-center justify-center gap-2 font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-[#F4EEE9]/60">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-[#cfaa32] hover:text-[#deb63d] hover:underline cursor-pointer font-semibold transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
