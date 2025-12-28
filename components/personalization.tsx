'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { api } from '@/lib/api'
import { Clock, TrendingUp, AlertCircle, FileText, Wrench } from 'lucide-react'

interface PersonalizationProps {
  onNext: () => void
}

const presets = [
  { id: 'no-interest', emoji: '📚', label: 'No Interest' },
  { id: 'football', emoji: '🏈', label: 'Football' },
  { id: 'art', emoji: '🎨', label: 'Art' },
  { id: 'business', emoji: '💼', label: 'Business' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'cooking', emoji: '👨‍🍳', label: 'Cooking' },
]

export function Personalization({ onNext }: PersonalizationProps) {
  const { extractedContent, setSelectedInterest, selectedInterest, duration, setDuration } = useApp()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(selectedInterest)
  const [customText, setCustomText] = useState(selectedInterest && !presets.find(p => p.label === selectedInterest) ? selectedInterest : '')
  const [showCustom, setShowCustom] = useState(false)
  const [durationRecommendation, setDurationRecommendation] = useState<any>(null)
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)

  const isReady = selectedPreset || customText.trim().length > 0
  
  const durationOptions = [
    { value: 30, label: '0.5 minutes' },
    { value: 60, label: '1 minute' },
    { value: 90, label: '1.5 minutes' },
    { value: 120, label: '2 minutes' },
    { value: 150, label: '2.5 minutes' },
    { value: 180, label: '3 minutes' }
  ]

  // Get duration recommendation when content is available
  useEffect(() => {
    if (extractedContent?.text) {
      console.log('Content available, fetching recommendation:', extractedContent.word_count, 'words')
      fetchDurationRecommendation()
    } else {
      console.log('No extracted content available')
    }
  }, [extractedContent])

  const fetchDurationRecommendation = async () => {
    if (!extractedContent?.text) {
      console.log('No text to analyze')
      return
    }
    
    console.log('Fetching duration recommendation for', extractedContent.word_count, 'words')
    setLoadingRecommendation(true)
    try {
      const response = await api.getDurationRecommendation(extractedContent.text)
      console.log('Recommendation received:', response)
      setDurationRecommendation(response)
      
      // Auto-set recommended duration as default
      setDuration(response.recommendation.recommended_duration)
      console.log('Auto-set duration to:', response.recommendation.recommended_duration)
    } catch (error) {
      console.error('Failed to get duration recommendation:', error)
    } finally {
      setLoadingRecommendation(false)
    }
  }

  // Manual test function
  const testRecommendation = async () => {
    const testText = "This is a longer test content to simulate a real educational video script with multiple concepts and detailed explanations. It contains enough words to trigger a longer duration recommendation. The system should analyze this content and recommend an appropriate video duration that allows for thorough coverage of the concepts without rushing. This text represents typical educational content that would benefit from a longer video duration to properly explain all the concepts and ensure viewer comprehension."
    setLoadingRecommendation(true)
    try {
      const response = await api.getDurationRecommendation(testText)
      console.log('Test recommendation:', response)
      setDurationRecommendation(response)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setLoadingRecommendation(false)
    }
  }

  const handleNext = () => {
    const interest = customText.trim() || selectedPreset
    if (interest) {
      setSelectedInterest(interest)
      onNext()
    }
  }

  // Drag handlers for progress bar (updated for 60-180 range)
  const handleBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newDuration = Math.round(60 + (percentage * 120)) // 60 to 180 range
    
    // Snap to nearest duration option
    const nearestOption = durationOptions.reduce((prev, curr) => 
      Math.abs(curr.value - newDuration) < Math.abs(prev.value - newDuration) ? curr : prev
    )
    setDuration(nearestOption.value)
  }

  const handleDrag = (event: any, info: any) => {
    const rect = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!rect) return
    
    const x = info.point.x - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newDuration = Math.round(60 + (percentage * 120)) // 60 to 180 range
    
    // Snap to nearest duration option
    const nearestOption = durationOptions.reduce((prev, curr) => 
      Math.abs(curr.value - newDuration) < Math.abs(prev.value - newDuration) ? curr : prev
    )
    setDuration(nearestOption.value)
  }

  const handleDragEnd = (event: any, info: any) => {
    // Final snap to ensure exact duration value
    const currentDuration = duration
    const nearestOption = durationOptions.find(opt => Math.abs(opt.value - currentDuration) < 30)
    if (nearestOption) {
      setDuration(nearestOption.value)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 pt-32"
    >
      <div className="w-full max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">What Do You Love?</h1>
          <p className="text-lg text-muted-foreground">Choose your passion to personalize your learning</p>
        </motion.div>

        {/* Preset Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
        >
          {presets.map((preset, i) => (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => {
                setSelectedPreset(preset.label)
                setCustomText('')
                setShowCustom(false)
              }}
              className={`p-6 rounded-2xl border-2 transition-smooth ${
                selectedPreset === preset.label
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-border bg-card hover:border-primary/50 hover-lift'
              }`}
            >
              <div className="text-5xl mb-3">{preset.emoji}</div>
              <p className="font-semibold text-foreground">{preset.label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground font-medium">Or describe your passion</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Custom Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 mb-10"
        >
          <textarea
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value)
              if (e.target.value.trim()) setShowCustom(true)
            }}
            onFocus={() => setShowCustom(true)}
            placeholder="Share what you're passionate about..."
            className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth text-foreground placeholder:text-muted-foreground resize-none h-24"
          />
          {showCustom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground">{customText.length} / 200</span>
            </motion.div>
          )}
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.23 }}
          className="mb-6"
        >
          {/* Header */}
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Video Duration
          </h2>
          
          {/* Recommendation Card */}
          {durationRecommendation && !loadingRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">
                  Recommended: {durationRecommendation.recommendation.recommended_label}
                </span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{durationRecommendation.recommendation.word_count} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>Technical complexity</span>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Loading state */}
          {loadingRecommendation && (
            <div className="mb-6 p-4 bg-muted/50 rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Analyzing content...</span>
            </div>
          )}
          
          {/* Classic Duration Select Dropdown */}
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth text-foreground cursor-pointer"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Generate Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={handleNext}
          disabled={!isReady}
          className={`w-full py-4 font-semibold rounded-xl transition-smooth ${
            isReady
              ? 'bg-primary text-primary-foreground hover-lift animate-pulse-glow'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          }`}
        >
          Generate Video
        </motion.button>
      </div>
    </motion.div>
  )
}
