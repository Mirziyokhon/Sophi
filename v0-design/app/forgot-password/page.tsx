'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BackgroundGrid } from '@/components/background-grid'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    const result = await requestPasswordReset(email)
    setIsSubmitting(false)

    if (result.success) {
      setIsSent(true)
      toast.success('Check your inbox for the reset link.')
    } else {
      toast.error(result.error ?? 'Unable to send reset email. Please try again.')
    }
  }

  return (
    <div className="min-h-screen text-[#F4EEE9] font-sans selection:bg-[#cfaa32]/30 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0">
        <BackgroundGrid />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[#F4EEE9]/50">Password Reset</p>
            <h1 className="text-3xl font-serif font-bold text-[#F4EEE9]">Forgot your password?</h1>
            <p className="text-[#F4EEE9]/70">
              Enter the email you used to create your Sophi account. We will send you a secure link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#F4EEE9] text-[#1a0509] font-bold rounded-xl hover:bg-white shadow-lg hover:shadow-[#cfaa32]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          {isSent && (
            <div className="rounded-2xl border border-[#cfaa32]/20 bg-[#cfaa32]/10 px-4 py-3 text-sm text-[#F4EEE9]">
              We sent a secure link to <span className="font-semibold">{email}</span>. It expires in 30 minutes.
              If you do not see it, check your spam folder or try again.
            </div>
          )}

          <div className="text-center text-sm text-[#F4EEE9]/70">
            Remembered your password?{' '}
            <Link href="/?screen=login" className="text-[#cfaa32] hover:text-[#deb63d] font-semibold">
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
