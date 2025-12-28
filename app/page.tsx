'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Landing } from '@/components/landing'
import { Dashboard } from '@/components/dashboard'
import { Contact } from '@/components/contact'
import { Profile } from '@/components/profile'
import { Upload } from '@/components/upload'
import { Personalization } from '@/components/personalization'
import { Processing } from '@/components/processing'
import { Player } from '@/components/player'
import { Library } from '@/components/library'
import { BackgroundGrid } from '@/components/background-grid'
import SignIn from '@/components/auth/signin'
import SignUp from '@/components/auth/signup'
import { useAuth } from '@/contexts/AuthContext'

// Public screens (before login)
type PublicScreen = 'landing' | 'signin' | 'signup'

// Authenticated screens (after login) 
type AuthScreen = 'dashboard' | 'upload' | 'personalization' | 'processing' | 'player' | 'library' | 'contact' | 'profile'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Public navigation state
  const [publicScreen, setPublicScreen] = useState<PublicScreen>('landing')
  
  // Authenticated navigation state
  const [authScreen, setAuthScreen] = useState<AuthScreen>('dashboard')
  const [videoGenerated, setVideoGenerated] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

  // Hydrate state from localStorage after mount to keep SSR/CSR markup identical
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedPublic = localStorage.getItem('sophi_public_screen')
    if (savedPublic) {
      setPublicScreen((savedPublic as PublicScreen) || 'landing')
    }

    const savedAuth = localStorage.getItem('sophi_auth_screen')
    if (savedAuth) {
      setAuthScreen((savedAuth as AuthScreen) || 'dashboard')
    }

    const savedVideoGenerated = localStorage.getItem('sophi_video_generated')
    if (savedVideoGenerated !== null) {
      setVideoGenerated(savedVideoGenerated === 'true')
    }

    setHasHydrated(true)
  }, [])

  // Save navigation state to localStorage
  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return
    localStorage.setItem('sophi_public_screen', publicScreen)
  }, [publicScreen, hasHydrated])

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return
    localStorage.setItem('sophi_auth_screen', authScreen)
  }, [authScreen, hasHydrated])

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return
    localStorage.setItem('sophi_video_generated', videoGenerated.toString())
  }, [videoGenerated, hasHydrated])

  // Wait until client hydration to avoid SSR/client divergence
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 overflow-x-hidden relative">
        <div className="fixed inset-0 z-0">
          <BackgroundGrid />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </div>
    )
  }

  // Public handlers
  const handleLogoClick = () => {
    if (isAuthenticated) {
      setAuthScreen('dashboard')
    } else {
      setPublicScreen('landing')
    }
  }
  const handleNavigateToSignIn = () => setPublicScreen('signin')
  const handleNavigateToSignUp = () => setPublicScreen('signup')
  const handleGetStarted = () => setPublicScreen('signin')

  // Auth success handler - redirect to dashboard
  const handleAuthSuccess = () => {
    setAuthScreen('dashboard')
  }

  // Authenticated handlers
  const handleNavigateToLibrary = () => setAuthScreen('library')
  const handleStartCreating = () => setAuthScreen('upload')
  const handleUploadNext = () => setAuthScreen('personalization')
  const handlePersonalizationNext = () => setAuthScreen('processing')
  const handleProcessingComplete = () => {
    setVideoGenerated(true)
    setAuthScreen('player')
  }
  const handleCreateAnother = () => {
    setVideoGenerated(false)
    setAuthScreen('upload')
  }
  const handleNavigateToDashboard = () => setAuthScreen('dashboard')

  // Show loading state (after hydration)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0">
        <BackgroundGrid />
      </div>
      <div className="relative z-10">
        {isAuthenticated ? (
          // Authenticated views with dashboard layout
          <DashboardLayout 
            currentScreen={authScreen}
            onNavigate={setAuthScreen}
          >
            {authScreen === 'dashboard' && <Dashboard onCreateNew={handleStartCreating} />}
            {authScreen === 'library' && <Library />}
            {authScreen === 'upload' && <Upload onNext={handleUploadNext} />}
            {authScreen === 'personalization' && <Personalization onNext={handlePersonalizationNext} />}
            {authScreen === 'processing' && <Processing onComplete={handleProcessingComplete} />}
            {authScreen === 'player' && <Player onCreateAnother={handleCreateAnother} />}
            {authScreen === 'contact' && <Contact />}
            {authScreen === 'profile' && <Profile />}
          </DashboardLayout>
        ) : (
          // Public views with header
          <div className="flex flex-col flex-grow min-h-screen">
            <Header 
              onLogoClick={handleLogoClick} 
              onNavigateToLibrary={handleNavigateToLibrary}
              onNavigateToLogin={handleNavigateToSignIn}
              onNavigateToSignup={handleNavigateToSignUp}
              onNavigateToDashboard={handleNavigateToDashboard}
              onStartCreating={handleStartCreating}
              showLogo={true}
            />

            <main className="flex-grow pt-20">
              {publicScreen === 'landing' && <Landing onStart={handleGetStarted} />}
              {publicScreen === 'signin' && (
                <SignIn 
                  onSwitchToSignUp={handleNavigateToSignUp}
                  onSuccess={handleAuthSuccess}
                  onBack={() => setPublicScreen('landing')}
                />
              )}
              {publicScreen === 'signup' && (
                <SignUp 
                  onSwitchToSignIn={handleNavigateToSignIn}
                  onSuccess={handleAuthSuccess}
                  onBack={() => setPublicScreen('landing')}
                />
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
