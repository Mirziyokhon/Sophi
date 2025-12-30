'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BackgroundGrid } from '@/components/background-grid'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Status = 'idle' | 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const prefilledToken = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const { verifyEmail } = useAuth()
  const [token, setToken] = useState(prefilledToken)
  const [status, setStatus] = useState<Status>(prefilledToken ? 'verifying' : 'idle')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!prefilledToken) return
    void handleVerification(prefilledToken, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledToken])

  const handleVerification = async (value?: string, isAuto = false) => {
    const verificationToken = value ?? token
    if (!verificationToken) {
      toast.error('Paste the verification token from your email.')
      return
    }

    setStatus('verifying')
    const result = await verifyEmail(verificationToken)

    if (result.success) {
      setStatus('success')
      setMessage(result.message ?? 'Email verified! You can now use all Sophi features.')
      if (!isAuto) {
        toast.success('Email verified successfully.')
      }
    } else {
      setStatus('error')
      setMessage(result.error ?? 'Unable to verify email. Please request a new link.')
      if (!isAuto) {
        toast.error(result.error ?? 'Verification failed')
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await handleVerification()
  }

  return (
    <div className="min-h-screen text-[#F4EEE9] font-sans selection:bg-[#cfaa32]/30 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0">
        <BackgroundGrid />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[#F4EEE9]/50">Verify Email</p>
            <h1 className="text-3xl font-serif font-bold text-[#F4EEE9]">Confirm your email address</h1>
            <p className="text-[#F4EEE9]/70">
              Click the link in your inbox or paste the verification token below to unlock your Sophi account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="block text-sm font-medium text-[#F4EEE9]/80 ml-1">
                Verification token
              </label>
              <textarea
                id="token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                rows={3}
                required
                className="w-full px-5 py-3 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-2xl focus:outline-none focus:border-[#cfaa32]/50 text-[#F4EEE9] placeholder:text-[#F4EEE9]/20 transition-all resize-none"
                placeholder="Paste the token from your confirmation email"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'verifying'}
              className="w-full py-4 bg-[#F4EEE9] text-[#1a0509] font-bold rounded-xl hover:bg-white shadow-lg hover:shadow-[#cfaa32]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'verifying' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify email'
              )}
            </button>
          </form>

          {message && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                status === 'success'
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
                  : 'border-red-400/40 bg-red-400/10 text-red-100'
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center text-sm text-[#F4EEE9]/70 space-y-2">
            <p>
              Need a new email?{' '}
              <Link href="/?screen=signup" className="text-[#cfaa32] hover:text-[#deb63d] font-semibold">
                Sign up again
              </Link>
            </p>
            <p>
              Ready to continue?{' '}
              <Link href="/?screen=login" className="text-[#cfaa32] hover:text-[#deb63d] font-semibold">
                Return to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
