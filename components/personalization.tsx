'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'

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
  const { setSelectedInterest, selectedInterest, duration, setDuration } = useApp()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(selectedInterest)
  const [customText, setCustomText] = useState(selectedInterest && !presets.find(p => p.label === selectedInterest) ? selectedInterest : '')
  const [showCustom, setShowCustom] = useState(false)

  const isReady = selectedPreset || customText.trim().length > 0
  
  const durationOptions = [
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 90, label: '1.5 minutes' },
    { value: 120, label: '2 minutes' },
    { value: 150, label: '2.5 minutes' },
    { value: 180, label: '3 minutes' }
  ]

  const handleNext = () => {
    const interest = customText.trim() || selectedPreset
    if (interest) {
      setSelectedInterest(interest)
      onNext()
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
          <label className="block text-sm font-semibold text-foreground mb-2">
            Video Duration
          </label>
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
