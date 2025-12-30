'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Header } from './header'
import { BackgroundGrid } from './background-grid'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { GoogleSignInButton } from '@/components/auth/google-signin-button'

interface SignupProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  onHome?: () => void
  onNavigateToLibrary?: () => void
  onNavigateToPricing?: () => void
  onNavigateToContact?: () => void
  onNavigateToStart?: () => void
}

export function Signup({
  onSuccess,
  onSwitchToLogin,
  onHome,
  onNavigateToLibrary,
  onNavigateToPricing,
  onNavigateToContact,
  onNavigateToStart,
}: SignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const result = await signUp(name, email, password)
      if (result.success) {
        if (result.message) {
          toast.success(result.message)
        } else {
          toast.success('Account created successfully! Welcome to Sophi.')
        }
        onSuccess?.()
      } else {
        toast.error(result.error ?? 'Unable to sign up. Please try again.')
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-[#F4EEE9] font-sans selection:bg-[#cfaa32]/30 overflow-x-hidden relative">
      <BackgroundGrid />

      <Header
        onLogoClick={onHome || (() => {})}
        onNavigateToLibrary={onNavigateToLibrary || (() => {})}
        onNavigateToLogin={onSwitchToLogin || (() => {})}
        onNavigateToSignup={() => {}}
        onNavigateToStart={onNavigateToStart || (() => {})}
        onNavigateToContact={onNavigateToContact || (() => {})}
        showLogo={true}
      />

      <div className="relative z-10 flex items-center justify-center px-4 pt-32 pb-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold font-serif text-[#F4EEE9]">Create Account</h1>
              <p className="text-[#F4EEE9]/60">Join Sophi to start learning through your passion</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#F4EEE9] text-[#1a0509] font-bold rounded-xl hover:bg-white shadow-lg hover:shadow-[#cfaa32]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {loading ? 'Creating account...' : 'Create Account'}
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
              <GoogleSignInButton
                text="Sign up with Google"
                onSuccess={() => {
                  toast.success('Signed in with Google!')
                  onSuccess?.()
                }}
                onError={(message) => {
                  if (message) {
                    toast.error(message)
                  }
                }}
              />
            </div>

            <div className="text-center text-sm">
              <span className="text-[#F4EEE9]/60">Already have an account? </span>
              <button onClick={onSwitchToLogin} className="text-[#cfaa32] hover:text-[#deb63d] hover:underline cursor-pointer font-semibold transition-colors">
                Sign in
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
