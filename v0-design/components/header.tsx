'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onLogoClick: () => void
  onNavigateToLibrary?: () => void
  onNavigateToLogin?: () => void
  onNavigateToSignup?: () => void
  onNavigateToStart?: () => void
  onNavigateToContact?: () => void
  showLogo?: boolean
}

export function Header({ 
  onLogoClick, 
  onNavigateToLibrary, 
  onNavigateToLogin, 
  onNavigateToSignup, 
  onNavigateToStart,
  onNavigateToContact,
  showLogo = true
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const isAuthenticated = !!user
  const [mounted, setMounted] = useState(false)

  // Track scroll for header styling
  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Build nav items based on authentication state
  const navItems = [
    { label: 'Home', action: onLogoClick },
    { label: 'Start', action: onNavigateToStart },
    { label: 'Contact', action: onNavigateToContact },
    ...(isAuthenticated ? [{ label: 'Library', action: onNavigateToLibrary }] : [])
  ]

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-6 bg-[var(--background)]/90 backdrop-blur-md border-b border-[#F4EEE9]/5' : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        {showLogo && (
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {mounted ? (
              <img 
                src="/sophi beige logo.png" 
                alt="Sophi"
                className="h-12 object-contain"
              />
            ) : (
              <div className="h-12 w-32" /> // Placeholder
            )}
          </button>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-sm font-medium text-[#F4EEE9]/80 hover:text-[#F4EEE9] transition-colors font-sans"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-[#F4EEE9]/80">
                <User size={16} />
                <span>{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-[#F4EEE9]/80 hover:text-[#F4EEE9] hover:bg-white/10"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <button 
                onClick={onNavigateToLogin}
                className="text-sm font-medium text-[#F4EEE9]/80 hover:text-[#F4EEE9] transition-colors font-sans"
              >
                Sign In
              </button>
              <button 
                onClick={onNavigateToSignup}
                className="px-6 py-2.5 bg-[#F4EEE9] hover:bg-[#e0d0c8] rounded-full text-[#2A0813] text-sm font-bold transition-all flex items-center gap-2 group font-sans"
              >
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden text-[var(--foreground)] cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[var(--background)] border-b border-[var(--border)] p-6 md:hidden flex flex-col gap-4"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action?.()
                  setMobileMenuOpen(false)
                }}
                className="text-[var(--foreground)]/70 hover:text-[var(--foreground)] text-lg font-medium"
              >
                {item.label}
              </button>
            ))}
            <button className="w-full py-3 bg-[var(--accent)] rounded-xl text-[var(--accent-foreground)] font-semibold mt-2">
              Get Started
            </button>
            {user && (
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-sm text-[var(--foreground)]/60 mb-2">
                  <span>Signed in as {user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
