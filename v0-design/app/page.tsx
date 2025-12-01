'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Landing } from '@/components/landing'
import { Upload } from '@/components/upload'
import { Personalization } from '@/components/personalization'
import { Processing } from '@/components/processing'
import { Player } from '@/components/player'
import { Library } from '@/components/library'
import { Contact } from '@/components/contact'
import About from '@/components/about'
import { BackgroundGrid } from '@/components/background-grid'

type Screen = 'landing' | 'upload' | 'personalization' | 'processing' | 'player' | 'library' | 'about' | 'contact'

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [videoGenerated, setVideoGenerated] = useState(false)

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
  }

  const handleNavigateToLibrary = () => setScreen('library')
  const handleNavigateToAbout = () => setScreen('about')
  const handleNavigateToContact = () => setScreen('contact')
  const handleBackToLibrary = () => setScreen('library')

  return (
    <div className="min-h-screen bg-[#050A18] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 z-0">
        <BackgroundGrid />
      </div>
      <div className="relative z-20 flex flex-col flex-grow min-h-screen">
        <Header 
          onLogoClick={handleLogoClick} 
          onNavigateToLibrary={handleNavigateToLibrary}
          onNavigateToAbout={handleNavigateToAbout}
          onNavigateToContact={handleNavigateToContact}
          onNavigateToLogin={() => {}}
          onNavigateToSignup={() => {}}
          showLogo={true}
        />

        <main className="flex-grow pt-20">
          {screen === 'landing' && <Landing onStart={handleStartLearning} />}
          {screen === 'upload' && <Upload onNext={handleUploadNext} />}
          {screen === 'personalization' && <Personalization onNext={handlePersonalizationNext} />}
          {screen === 'processing' && <Processing onComplete={handleProcessingComplete} />}
          {screen === 'player' && <Player onCreateAnother={handleCreateAnother} />}
          {screen === 'library' && <Library />}
          {screen === 'about' && <About />}
          {screen === 'contact' && <Contact />}
        </main>
      </div>
    </div>
  )
}
