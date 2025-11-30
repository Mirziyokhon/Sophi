'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'

interface HeaderProps {
  onLogoClick: () => void
  onNavigateToLibrary?: () => void
  onNavigateToAbout?: () => void
  onNavigateToContact?: () => void
  onNavigateToLogin?: () => void
  onNavigateToSignup?: () => void
  showLogo?: boolean
}

export function Header({ 
  onLogoClick, 
  onNavigateToLibrary, 
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  showLogo = true
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Track scroll for header styling
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => setIsScrolled(window.scrollY > 20))
  }

  const navItems = [
    { label: 'Home', action: onLogoClick },
    { label: 'Library', action: onNavigateToLibrary },
    { label: 'About Us', action: onNavigateToAbout },
    { label: 'Contact', action: onNavigateToContact }
  ]

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-4 bg-[#050A18]/80 backdrop-blur-md border-b border-white/5' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        {showLogo && (
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img 
              src="/Sophi logo.png" 
              alt="Sophi"
              className="h-12"
            />
          </button>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold transition-all flex items-center gap-2 group">
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden text-white cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
            className="absolute top-full left-0 right-0 bg-[#0b1221] border-b border-white/10 p-6 md:hidden flex flex-col gap-4"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action?.()
                  setMobileMenuOpen(false)
                }}
                className="text-gray-300 hover:text-white text-lg font-medium"
              >
                {item.label}
              </button>
            ))}
            <button className="w-full py-3 bg-blue-600 rounded-xl text-white font-semibold mt-2">
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
