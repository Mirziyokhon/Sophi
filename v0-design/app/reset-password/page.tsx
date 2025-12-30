'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BackgroundGrid } from '@/components/background-grid'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const initialToken = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [token, setToken] = useState(initialToken)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      toast.error('Paste the reset token from your email.')
      return
    }
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = await resetPassword(token, password)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Password updated! You can now sign in.')
      setIsComplete(true)
    } else {
      toast.error(result.error ?? 'Unable to reset password. Please try again.')
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
            <h1 className="text-3xl font-serif font-bold text-[#F4EEE9]">Choose a new password</h1>
            <p className="text-[#F4EEE9]/70">
              Paste the secure token we emailed you and pick a new password to regain access to your Sophi account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">
                Reset token
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                placeholder="Paste the token from your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all"
                placeholder="Repeat your password"
                required
                minLength={8}
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
                  Updating password...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>

          {isComplete && (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-[#F4EEE9]">
              Your password is updated. You can{' '}
              <Link href="/?screen=login" className="font-semibold text-[#cfaa32] hover:text-[#deb63d]">
                sign in now
              </Link>
              .
            </div>
          )}

          <div className="text-center text-sm text-[#F4EEE9]/70">
            Didn&apos;t request this?{' '}
            <Link href="/" className="text-[#cfaa32] hover:text-[#deb63d] font-semibold">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050304] text-[#F4EEE9]">
          <div className="flex items-center gap-3 text-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading reset form...
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
