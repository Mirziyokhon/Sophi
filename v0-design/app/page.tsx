'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Dashboard } from '@/components/dashboard'
import { Contact } from '@/components/contact'
import { Profile } from '@/components/profile'
import { Landing } from '@/components/landing'
import { Upload } from '@/components/upload'
import { Personalization } from '@/components/personalization'
import { Processing } from '@/components/processing'
import { Player } from '@/components/player'
import { Library } from '@/components/library'
import { Login } from '@/components/login'
import { Signup } from '@/components/signup'
import { BackgroundGrid } from '@/components/background-grid'
import { ProtectedRoute } from '@/components/auth/protected-route'

type Screen = 'landing' | 'dashboard' | 'upload' | 'personalization' | 'processing' | 'player' | 'library' | 'login' | 'signup' | 'contact' | 'profile'

export default function Home() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sophi_v0_screen')
      return (saved as Screen) || 'landing'
    }
    return 'landing'
  })
  const [videoGenerated, setVideoGenerated] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sophi_v0_video_generated')
      return saved === 'true'
    }
    return false
  })

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sophi_v0_screen', screen)
    }
  }, [screen])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sophi_v0_video_generated', videoGenerated.toString())
    }
  }, [videoGenerated])

  const handleStartLearning = () => setScreen('upload')
  const handleUploadNext = () => setScreen('personalization')
  const handlePersonalizationNext = () => setScreen('processing')
  const handleProcessingComplete = () => {
    setVideoGenerated(true)
    setScreen('player')
  }
  const handleCreateAnother = () => {
    setVideoGenerated(false)
    setScreen('upload')
    // Note: reset is handled by AppContext
  }

  const handleLogoClick = () => {
    setVideoGenerated(false)
    setScreen('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToLibrary = () => setScreen('library')
  const handleBackToLibrary = () => setScreen('library')
  
  const handleNavigateToLogin = () => setScreen('login')
  const handleNavigateToSignup = () => setScreen('signup')

  const handleNavigateToStart = () => {
    setScreen('landing')
    setTimeout(() => {
      const element = document.getElementById('start-learning')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleNavigateToContact = () => {
    setScreen('landing')
    setTimeout(() => {
      const element = document.getElementById('contact')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleSignOut = () => {
    setScreen('landing')
    setVideoGenerated(false)
  }

  const handleNavigateToDashboard = () => setScreen('dashboard')

  return (
    <div className="min-h-screen text-[#F4EEE9] font-sans selection:bg-[#cfaa32]/30 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0">
        <BackgroundGrid />
      </div>
      <div className="relative z-20">
        {screen === 'login' || screen === 'signup' || screen === 'landing' ? (
          // Public views with header
          <div className="flex flex-col flex-grow min-h-screen">
            {screen !== 'login' && screen !== 'signup' && (
              <Header 
                onLogoClick={handleLogoClick} 
                onNavigateToLibrary={handleNavigateToLibrary}
                onNavigateToLogin={handleNavigateToLogin}
                onNavigateToSignup={handleNavigateToSignup}
                onNavigateToStart={handleNavigateToStart}
                onNavigateToContact={handleNavigateToContact}
                showLogo={true}
              />
            )}

            <main className={`flex-grow ${screen !== 'login' && screen !== 'signup' ? 'pt-32' : ''}`}>
              {screen === 'landing' && <Landing onStart={handleStartLearning} />}
              {screen === 'login' && (
                <Login 
                  onSuccess={handleStartLearning}
                  onSwitchToSignup={handleNavigateToSignup}
                  onHome={handleLogoClick}
                  onNavigateToLibrary={handleNavigateToLibrary}
                  onNavigateToContact={handleNavigateToContact}
                  onNavigateToStart={handleNavigateToStart}
                />
              )}
              {screen === 'signup' && (
                <Signup 
                  onSuccess={handleStartLearning}
                  onSwitchToLogin={handleNavigateToLogin}
                  onHome={handleLogoClick}
                  onNavigateToLibrary={handleNavigateToLibrary}
                  onNavigateToContact={handleNavigateToContact}
                  onNavigateToStart={handleNavigateToStart}
                />
              )}
            </main>
            <Footer />
          </div>
        ) : (
          // Authenticated views with dashboard layout
          <DashboardLayout 
            currentScreen={screen}
            onNavigate={(navScreen) => {
              if (navScreen === 'dashboard') setScreen('dashboard')
              else if (navScreen === 'upload') setScreen('upload')
              else if (navScreen === 'library') setScreen('library')
              else if (navScreen === 'profile') setScreen('profile')
              else if (navScreen === 'contact') setScreen('contact')
            }}
            onSignOut={handleSignOut}
            userName="Student"
            userEmail="student@sophi.com"
          >
            {screen === 'dashboard' && <Dashboard onCreateNew={handleStartLearning} />}
            {screen === 'library' && <Library />}
            {screen === 'upload' && <Upload onNext={handleUploadNext} />}
            {screen === 'personalization' && <Personalization onNext={handlePersonalizationNext} />}
            {screen === 'processing' && <Processing onComplete={handleProcessingComplete} />}
            {screen === 'player' && <Player onCreateAnother={handleCreateAnother} />}
            {screen === 'contact' && <Contact />}
            {screen === 'profile' && <Profile userName="Student" userEmail="student@sophi.com" />}
          </DashboardLayout>
        )}
      </div>
    </div>
  )
}
