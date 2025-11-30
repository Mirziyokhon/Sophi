'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ExtractResponse, VideoData } from '@/lib/api'

interface AppContextType {
  // Content state
  extractedContent: ExtractResponse | null
  setExtractedContent: (content: ExtractResponse | null) => void
  
  // Personalization state
  selectedInterest: string | null
  setSelectedInterest: (interest: string | null) => void
  
  // Video generation state
  currentVideo: VideoData | null
  setCurrentVideo: (video: VideoData | null) => void
  
  // Processing state
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  
  // Settings
  duration: number
  setDuration: (duration: number) => void
  
  // Reset function
  reset: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [extractedContent, setExtractedContent] = useState<ExtractResponse | null>(null)
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [duration, setDuration] = useState(30) // 30 seconds default

  const reset = () => {
    setExtractedContent(null)
    setSelectedInterest(null)
    setCurrentVideo(null)
    setIsProcessing(false)
    setDuration(30)
  }

  return (
    <AppContext.Provider
      value={{
        extractedContent,
        setExtractedContent,
        selectedInterest,
        setSelectedInterest,
        currentVideo,
        setCurrentVideo,
        isProcessing,
        setIsProcessing,
        duration,
        setDuration,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
