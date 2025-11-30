'use client'

import { Share2, Share, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { api } from '@/lib/api'
import { SketchAnimationPlayer } from './sketch-animation-player'

interface PlayerProps {
  onCreateAnother: () => void
}

export function Player({ onCreateAnother }: PlayerProps) {
  const { currentVideo } = useApp()
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)

  if (!currentVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No video available</p>
      </div>
    )
  }

  const videoUrl = api.getVideoURL(currentVideo.filename)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center px-4 pt-20 pb-16"
    >
      <div className="w-full max-w-4xl space-y-5">
        {/* Sketch Animation Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <SketchAnimationPlayer
            animationHtml={currentVideo.animation_html || ''}
            script={currentVideo.script}
            duration={currentVideo.duration || 60}
            filename={currentVideo.filename}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center"
        >
          Your Personalized Lesson
        </motion.h1>
        
        {/* Video Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-8 space-y-2"
        >
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Interest:</span> {currentVideo.interest}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Duration:</span> {currentVideo.duration}s • 
            <span className="font-medium text-foreground">Words:</span> {currentVideo.word_count}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-12 justify-center"
        >
          {/* Open Animation */}
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover-lift shadow-lg flex items-center gap-2 justify-center"
          >
            <ExternalLink className="w-5 h-5" />
            Open Fullscreen
          </a>

          {/* Create Another */}
          <button
            onClick={onCreateAnother}
            className="px-8 py-3 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-smooth"
          >
            Create Another
          </button>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="px-8 py-3 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-smooth flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>

            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 w-48"
              >
                {[
                  { icon: Copy, label: 'Copy Link', action: handleCopy },
                  { icon: Share, label: 'Twitter', action: () => {} },
                  { icon: Share, label: 'Instagram', action: () => {} },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-smooth text-left text-foreground border-b border-border last:border-0"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.label === 'Copy Link' && copied && (
                      <Check className="w-4 h-4 ml-auto text-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="p-6 bg-card border border-border rounded-2xl text-center"
        >
          <p className="text-foreground font-medium mb-4 flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Was this helpful?
          </p>
          <div className="flex justify-center gap-4">
            {[
              { emoji: '👍', value: 'up' as const },
              { emoji: '👎', value: 'down' as const },
            ].map(({ emoji, value }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFeedback(value)}
                className={`text-4xl p-3 rounded-lg transition-smooth ${
                  feedback === value ? 'bg-primary/20' : 'hover:bg-primary/10'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
