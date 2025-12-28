'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center w-24 h-10 rounded-full border border-[var(--border)] bg-[var(--background)] p-1 transition-all duration-300 hover:shadow-lg"
      aria-label="Toggle theme"
    >
      {/* Sliding indicator */}
      <div
        className={`absolute w-8 h-8 rounded-full bg-[var(--foreground)] shadow-lg transition-all duration-300 flex items-center justify-center ${
          isDark ? 'left-1' : 'left-[calc(100%-2.25rem)]'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-[var(--background)]" />
        ) : (
          <Sun className="w-4 h-4 text-[var(--background)]" />
        )}
      </div>
      
      {/* Background icons */}
      <div className="flex w-full justify-between px-2 pointer-events-none">
        <Moon className={`w-4 h-4 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-40'} text-[var(--foreground)]`} />
        <Sun className={`w-4 h-4 transition-opacity duration-300 ${isDark ? 'opacity-40' : 'opacity-0'} text-[var(--foreground)]`} />
      </div>
    </button>
  )
}
