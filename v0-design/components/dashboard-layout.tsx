'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Upload, FolderOpen, Settings, LogOut, User, MessageSquare } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentScreen: string
  onNavigate: (screen: 'dashboard' | 'upload' | 'library' | 'contact' | 'profile') => void
  onSignOut: () => void
  userName?: string
  userEmail?: string
}

export function DashboardLayout({ 
  children, 
  currentScreen, 
  onNavigate, 
  onSignOut,
  userName = 'User',
  userEmail = 'user@example.com'
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true) // Keep sidebar open on desktop
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'library', label: 'Library', icon: FolderOpen },
    { id: 'upload', label: 'Create', icon: Upload },
    { id: 'contact', label: 'Contact', icon: MessageSquare },
  ]

  const handleNavigation = (screen: 'dashboard' | 'upload' | 'library' | 'profile' | 'contact') => {
    onNavigate(screen)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="min-h-screen text-[#F4EEE9] font-sans selection:bg-[#cfaa32]/30 overflow-x-hidden relative flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -280 } : { x: 0 }}
            animate={sidebarOpen ? { x: 0 } : { x: -280 }}
            exit={isMobile ? { x: -280 } : { x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 h-full bg-[#1a1a1a] border-r border-[#cfaa32]/20 z-50 ${
              isMobile ? 'w-64' : sidebarOpen ? (sidebarCollapsed ? 'w-16' : 'w-64') : 'w-0'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className={`flex items-center justify-between p-6 border-b border-[#cfaa32]/20 ${sidebarCollapsed ? 'px-2' : ''}`}>
                <button
                  onClick={toggleSidebarCollapse}
                  className="flex items-center gap-3 hover:bg-[#cfaa32]/20 rounded-lg p-2 transition-colors"
                >
                  {!sidebarCollapsed ? (
                    <>
                      <img 
                        src="/sophi beige logo.png" 
                        alt="Sophi"
                        className="h-10 object-contain"
                      />
                      <span className="text-xl font-semibold">Sophi</span>
                    </>
                  ) : (
                    <img 
                      src="/sophi beige logo.png" 
                      alt="Sophi"
                      className="h-8 object-contain"
                    />
                  )}
                </button>
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-[#cfaa32]/20 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* User Info */}
              {!sidebarCollapsed && (
                <div className="p-6 border-b border-[#cfaa32]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#cfaa32] flex items-center justify-center">
                      <User size={20} className="text-black" />
                    </div>
                    <div>
                      <p className="font-medium">{userName}</p>
                      <p className="text-sm text-[#F4EEE9]/60">{userEmail}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className={`flex-1 p-4 ${sidebarCollapsed ? 'px-2' : ''}`}>
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentScreen === item.id
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNavigation(item.id as 'dashboard' | 'upload' | 'library' | 'profile' | 'contact')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? 'bg-[#cfaa32] text-black'
                              : 'hover:bg-[#cfaa32]/20 text-[#F4EEE9]/80 hover:text-[#F4EEE9]'
                          }`}
                          title={sidebarCollapsed ? item.label : ''}
                        >
                          <Icon size={20} />
                          {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Profile and Sign Out */}
              <div className={`p-4 border-t border-[#cfaa32]/20 space-y-2 ${sidebarCollapsed ? 'px-2' : ''}`}>
                <button
                  onClick={() => handleNavigation('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentScreen === 'profile'
                      ? 'bg-[#cfaa32] text-black'
                      : 'hover:bg-[#cfaa32]/20 text-[#F4EEE9]/80 hover:text-[#F4EEE9]'
                  }`}
                  title={sidebarCollapsed ? 'Profile' : ''}
                >
                  <User size={20} />
                  {!sidebarCollapsed && <span className="font-medium">Profile</span>}
                </button>
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#cfaa32]/20 transition-colors text-[#F4EEE9]/80 hover:text-[#F4EEE9]"
                  title={sidebarCollapsed ? 'Sign Out' : ''}
                >
                  <LogOut size={20} />
                  {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${!isMobile ? (sidebarOpen ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0') : ''}`}>
        {/* Mobile Header */}
        {isMobile && (
          <header className="fixed top-0 left-0 right-0 z-30 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-[#cfaa32]/20 px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-[#cfaa32]/20 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <img 
                  src="/sophi beige logo.png" 
                  alt="Sophi"
                  className="h-8 object-contain"
                />
              </div>
              <div className="w-10" />
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={`${isMobile ? 'pt-20' : ''} ${!isMobile && !sidebarOpen ? 'pl-16' : ''} min-h-screen`}>
          {children}
        </main>
      </div>
    </div>
  )
}
