'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  onLogoClick: () => void
  onNavigateToLibrary?: () => void
  onNavigateToLogin?: () => void
  onNavigateToSignup?: () => void
  onNavigateToDashboard?: () => void
  onStartCreating?: () => void
  showLogo?: boolean
}

export function Header({ 
  onLogoClick, 
  onNavigateToLibrary, 
  onNavigateToLogin, 
  onNavigateToSignup, 
  onNavigateToDashboard, 
  onStartCreating, 
  showLogo = true
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Track scroll for header styling
  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Build nav items based on authentication state
  const navItems = isAuthenticated
    ? [
        { label: 'Home', action: onLogoClick },
        { label: 'Create', action: onStartCreating },
        { label: 'Library', action: onNavigateToLibrary },
      ]
    : [
        { label: 'Home', action: onLogoClick },
      ]

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-4 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]' : 'py-6 bg-transparent'
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
              <div className="h-12 w-32" /> // Placeholder to prevent layout shift
            )}
          </button>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-300">Hi, {user?.name}</span>
              <button 
                onClick={signOut}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => onNavigateToLogin?.()}
                className="px-4 py-2 text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => onNavigateToSignup?.()}
                className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-full text-[var(--accent-foreground)] text-sm font-semibold transition-all flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden text-gray-700 dark:text-gray-200 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
                className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white text-lg font-medium"
              >
                {item.label}
              </button>
            ))}
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                className="w-full py-3 bg-[var(--secondary)] rounded-xl text-[var(--foreground)] font-semibold mt-2"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    onNavigateToLogin?.()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full py-3 bg-[var(--secondary)] rounded-xl text-[var(--foreground)] font-semibold mt-2"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    onNavigateToSignup?.()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full py-3 bg-primary rounded-xl text-primary-foreground font-semibold mt-2"
                >
                  Get Started
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
