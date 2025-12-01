'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Header } from './header'

interface SignupProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  onHome?: () => void
  onNavigateToLibrary?: () => void
  onNavigateToPricing?: () => void
  onNavigateToContact?: () => void
}

export function Signup({ onSuccess, onSwitchToLogin, onHome, onNavigateToLibrary, onNavigateToPricing, onNavigateToContact }: SignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSuccess?.()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onLogoClick={onHome || (() => {})}
        onNavigateToLibrary={onNavigateToLibrary || (() => {})}
        onNavigateToContact={onNavigateToContact || (() => {})}
        onNavigateToLogin={onSwitchToLogin || (() => {})}
        onNavigateToSignup={() => {}}
        showLogo={true}
      />

      <div className="flex items-center justify-center px-4 pt-24 pb-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">Join Sophi to start learning through your passion</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors cursor-text"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors cursor-text"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors cursor-text"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors cursor-text"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full py-2 border border-border rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer">
                Sign up with Google
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <button onClick={onSwitchToLogin} className="text-primary hover:underline cursor-pointer font-semibold">
                Sign in
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
