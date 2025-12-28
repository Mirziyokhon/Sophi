'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload } from './upload'
import { Personalization } from './personalization'
import { Processing } from './processing'

interface CreateProps {
  onBack: () => void
}

type Step = 'upload' | 'personalize' | 'processing'

export function Create({ onBack }: CreateProps) {
  const [step, setStep] = useState<Step>('upload')

  const handleUploadNext = () => {
    setStep('personalize')
  }

  const handlePersonalizeNext = () => {
    setStep('processing')
  }

  const handleProcessingComplete = () => {
    setStep('upload')
  }

  const handleBack = () => {
    if (step === 'personalize') {
      setStep('upload')
    } else if (step === 'processing') {
      setStep('personalize')
    } else {
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Your Video
          </h1>
          <p className="text-lg text-[var(--foreground)]/60">
            {step === 'upload' && 'Upload your content to get started'}
            {step === 'personalize' && 'Personalize your learning experience'}
            {step === 'processing' && 'Generating your personalized video'}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--foreground)]/10'}`}>
              1
            </div>
            <span className="hidden md:inline">Upload</span>
          </div>
          <div className="w-12 h-0.5 bg-[var(--foreground)]/10" />
          <div className={`flex items-center gap-2 ${step === 'personalize' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'personalize' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--foreground)]/10'}`}>
              2
            </div>
            <span className="hidden md:inline">Personalize</span>
          </div>
          <div className="w-12 h-0.5 bg-[var(--foreground)]/10" />
          <div className={`flex items-center gap-2 ${step === 'processing' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'processing' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--foreground)]/10'}`}>
              3
            </div>
            <span className="hidden md:inline">Generate</span>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Upload onNext={handleUploadNext} />
            </motion.div>
          )}

          {step === 'personalize' && (
            <motion.div
              key="personalize"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Personalization onNext={handlePersonalizeNext} onBack={handleBack} />
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Processing onComplete={handleProcessingComplete} onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        {step === 'upload' && (
          <div className="flex justify-center mt-8">
            <button
              onClick={onBack}
              className="px-6 py-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
