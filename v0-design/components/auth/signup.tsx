'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { GoogleSignInButton } from './google-signin-button'

interface SignUpProps {
  onSwitchToSignIn: () => void
  onSuccess: () => void
}

export function SignUp({ onSwitchToSignIn, onSuccess }: SignUpProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp(name, email, password)
      
      if (result.success) {
        toast.success('Account created successfully! Welcome to Sophi.')
        onSuccess()
      } else {
        toast.error(result.error || 'Sign up failed')
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
            <h1 className="text-3xl font-bold font-serif text-[#F4EEE9]">Create Account</h1>
            <p className="text-[#F4EEE9]/60">Join Sophi to start learning through your passion</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
              />
            </div>

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
                placeholder="Create a password"
                required
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#F4EEE9] text-[#1a0509] font-bold rounded-xl hover:bg-white shadow-lg hover:shadow-[#cfaa32]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
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
            <GoogleSignInButton text="Sign up with Google" />
          </div>

          <div className="text-center text-sm">
            <span className="text-[#F4EEE9]/60">Already have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-[#cfaa32] hover:text-[#deb63d] hover:underline cursor-pointer font-semibold transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
