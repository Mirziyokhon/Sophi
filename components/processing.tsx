'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface ProcessingProps {
  onComplete: () => void
}

const steps = ['Analyzing content', 'Creating script', 'Generating visuals', 'Adding voiceover']

export function Processing({ onComplete }: ProcessingProps) {
  const { extractedContent, selectedInterest, duration, setCurrentVideo, setIsProcessing } = useApp()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsProcessing(true)
    
    const generateVideo = async () => {
      if (!extractedContent || !selectedInterest) {
        setError('Missing content or interest')
        toast.error('Missing required data')
        return
      }

      try {
        // Simulate progress through steps
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
        }, 15000) // 15 seconds per step

        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 0.5
            return newProgress > 95 ? 95 : newProgress
          })
        }, 500)

        // Call the API
        const result = await api.generateVideo({
          extracted_text: extractedContent.text,
          interest_description: selectedInterest,
          duration_seconds: duration
        })

        clearInterval(stepInterval)
        clearInterval(progressInterval)
        
        setProgress(100)
        setCurrentStep(steps.length - 1)
        setCurrentVideo(result.video_data)
        setIsProcessing(false)
        
        toast.success('Video generated successfully!')
        setTimeout(onComplete, 500)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate video')
        toast.error('Failed to generate video. Please try again.')
        setIsProcessing(false)
      }
    }

    generateVideo()
  }, [extractedContent, selectedInterest, duration, onComplete, setCurrentVideo, setIsProcessing])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 pt-32"
    >
      <div className="w-full max-w-md">
        {/* Animated Spinner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex justify-center"
        >
          <div className="relative w-24 h-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-b from-primary/20 to-transparent" />
          </div>
        </motion.div>

        {/* Status Text */}
        <div className="mb-12 text-center">
          <motion.h2
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
          >
            {steps[currentStep]}
          </motion.h2>
          <p className="text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              'Estimated time: 60-90 seconds'
            )}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 mb-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-smooth ${
                i < currentStep
                  ? 'bg-primary/20'
                  : i === currentStep
                    ? 'bg-primary/10 border border-primary/50'
                    : 'bg-card'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  i < currentStep
                    ? 'bg-primary border-primary'
                    : i === currentStep
                      ? 'border-primary bg-transparent'
                      : 'border-border bg-transparent'
                }`}
              >
                {i < currentStep && <span className="text-primary-foreground text-xs">✓</span>}
                {i === currentStep && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                )}
              </div>
              <span className={i <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card rounded-full h-2 overflow-hidden border border-border"
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-accent"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
