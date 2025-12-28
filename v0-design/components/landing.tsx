'use client'

import { useEffect, useRef, useState } from 'react'
import { BackgroundGrid } from './background-grid'
import { Footer } from './footer'
import { ArrowRight } from 'lucide-react'


interface LandingProps {
  onStart: () => void
}

export function Landing({ onStart }: LandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const textCursorRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)
  const step4Ref = useRef<HTMLDivElement>(null)
  const step5Ref = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [typedText, setTypedText] = useState('')
  const [confettiVisible, setConfettiVisible] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<Array<{left: string, color: string, delay: string, duration: string}>>([])
  const [cursorType, setCursorType] = useState<'normal' | 'pointing' | 'text'>('normal')
  const [gsapLoaded, setGsapLoaded] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const fullText = "Learn about the history of jazz music and its influence on modern culture..."

  const getCursorImage = () => {
    switch (cursorType) {
      case 'pointing':
        return '/cursor-pointing.png'
      case 'text':
        return '/cursor-text.png'
      default:
        return '/cursor-normal.png'
    }
  }

  // Generate confetti on client side only
  useEffect(() => {
    const colors = ['#2A0813', '#F4EEE9', '#FFBFA3', '#F7DAD9', '#F4EEE9']
    const particles = Array.from({ length: 50 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      color: colors[i % 5],
      delay: `${(i * 0.05)}s`,
      duration: `${2 + Math.random()}s`
    }))
    setConfettiParticles(particles)

    // Track scroll position before GSAP loads
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Load GSAP dynamically on client side
    const loadGSAP = async () => {
      if (typeof window === 'undefined') return

      console.log('🎬 Starting GSAP load...')

      // Check if already loaded
      if ((window as any).gsap && (window as any).ScrollTrigger) {
        console.log('✅ GSAP already loaded!')
        initAnimations()
        return
      }

      // Load GSAP scripts
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          console.log('📥 Loading script:', src)
          const script = document.createElement('script')
          script.src = src
          script.onload = () => {
            console.log('✅ Loaded:', src)
            resolve()
          }
          script.onerror = (error) => {
            console.error('❌ Failed to load:', src, error)
            reject(error)
          }
          document.head.appendChild(script)
        })
      }

      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js')
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js')
        
        // Wait a bit for scripts to initialize
        setTimeout(() => {
          if ((window as any).gsap && (window as any).ScrollTrigger) {
            console.log('🚀 GSAP ready! Initializing animations...')
            setGsapLoaded(true)
            initAnimations()
            
            // Refresh ScrollTrigger to catch any scroll that happened during loading
            setTimeout(() => {
              const ScrollTrigger = (window as any).ScrollTrigger
              if (ScrollTrigger) {
                ScrollTrigger.refresh()
                console.log('🔄 Refreshed ScrollTrigger after initialization')
                
                // If user has scrolled down, force update animations
                if (scrollPosition > 100) {
                  console.log('📜 User had scrolled to', scrollPosition, '- updating animations')
                  ScrollTrigger.update()
                  ScrollTrigger.refresh()
                }
              }
            }, 100) // Decreased delay to ensure DOM is fully ready
          } else {
            console.error('❌ GSAP loaded but not available on window object')
          }
        }, 100)
      } catch (error) {
        console.error('❌ Failed to load GSAP:', error)
      }
    }

    const initAnimations = () => {
    const gsap = (window as any).gsap
    const ScrollTrigger = (window as any).ScrollTrigger
    
    if (!gsap || !ScrollTrigger) return
    
    gsap.registerPlugin(ScrollTrigger)

    // Clear existing ScrollTrigger instances
    ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill())

    // Cursor visibility test - show actual cursor image
    if (cursorRef.current) {
      console.log('🎯 Testing cursor visibility...')
      // Force cursor to be visible with inline styles
      cursorRef.current.style.cssText = `
        position: fixed !important;
        left: 200px !important;
        top: 200px !important;
        width: 36px !important;
        height: 36px !important;
        opacity: 1 !important;
        display: block !important;
        visibility: visible !important;
        z-index: 999999 !important;
        pointer-events: none !important;
        background-color: transparent !important;
        border-radius: 0 !important;
      `
      
      setTimeout(() => {
        if (cursorRef.current) {
          console.log('🎯 Hiding cursor after test')
          cursorRef.current.style.cssText = `
            position: fixed !important;
            left: -10000px !important;
            top: -10000px !important;
            width: 36px !important;
            height: 36px !important;
            opacity: 0 !important;
            display: none !important;
            visibility: hidden !important;
            z-index: 999999 !important;
            pointer-events: none !important;
            background-color: transparent !important;
            border-radius: 0 !important;
          `
        }
      }, 3000)
    }

    // STEP 1: Start Button Animation
    if (step1Ref.current && cursorRef.current) {
      const button = step1Ref.current.querySelector('button')
      
      if (button) {
        ScrollTrigger.create({
          trigger: step1Ref.current,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: false, // No scrub for instant 60 FPS
          onUpdate: (self: any) => {
            const progress = self.progress
            const step1Rect = step1Ref.current!.getBoundingClientRect()
            const buttonRect = button.getBoundingClientRect()
            
            // Calculate positions
            const startX = step1Rect.left + 100
            const startY = step1Rect.top + 100
            const endX = buttonRect.left + buttonRect.width / 2
            const endY = buttonRect.top + buttonRect.height / 2
            const descendAmount = 30
            
            // Phase 1: Move to button (0-35%)
            if (progress < 0.35) {
              const moveProgress = progress / 0.35
              const currentX = startX + (endX - startX) * moveProgress
              const currentY = startY + (endY - startY) * moveProgress + (descendAmount * progress)
              
              // Change to pointing cursor when entering button area (at 20%)
              if (progress > 0.2 && cursorType !== 'pointing') {
                setCursorType('pointing')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${currentX}px !important;
                  top: ${currentY}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: 1 !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(1) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              // Button glow starts at 15%
              if (progress > 0.15) {
                const glowProgress = (progress - 0.15) / 0.1
                gsap.set(button, {
                  boxShadow: `0 0 ${20 * glowProgress}px rgba(244, 238, 233, ${0.5 * glowProgress})`
                })
              }
            }
            // Phase 2: Press button (35-70%)
            else if (progress < 0.7) {
              const pressProgress = (progress - 0.35) / 0.35
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${endX}px !important;
                  top: ${endY + (descendAmount * progress)}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: 1 !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(${1 - (0.15 * Math.max(0, pressProgress))}) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              gsap.set(button, {
                scale: 1 - (0.04 * Math.max(0, pressProgress)),
                boxShadow: `0 0 30px rgba(244, 238, 233, ${0.5 + 0.4 * Math.max(0, pressProgress)})`
              })
            }
            // Phase 3: Release and fade (70-100%)
            else {
              const releaseProgress = (progress - 0.7) / 0.3
              
              if (releaseProgress > 0 && cursorType !== 'normal') {
                setCursorType('normal')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${endX}px !important;
                  top: ${endY + (descendAmount * progress)}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: ${1 - releaseProgress} !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(${0.85 + (0.15 * releaseProgress)}) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              gsap.set(button, {
                scale: 0.96 + (0.04 * releaseProgress)
              })
            }
          },
          onLeaveBack: () => {
            setCursorType('normal')
            if (cursorRef.current) {
              cursorRef.current.style.cssText = `
                position: fixed !important;
                left: -10000px !important;
                top: -10000px !important;
                width: 36px !important;
                height: 36px !important;
                opacity: 0 !important;
                display: none !important;
                visibility: hidden !important;
                z-index: 999999 !important;
                pointer-events: none !important;
                background-color: transparent !important;
                border-radius: 0 !important;
              `
            }
          }
        })
      }
    }

    // STEP 2: Text Input Animation
    if (step2Ref.current && cursorRef.current && textRef.current) {
      const textBox = step2Ref.current.querySelector('.text-input')
      
      if (textBox) {
        ScrollTrigger.create({
          trigger: step2Ref.current,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: false, // No scrub for instant 60 FPS
          onUpdate: (self: any) => {
            const progress = self.progress
            const step2Rect = step2Ref.current!.getBoundingClientRect()
            const textBoxRect = textBox.getBoundingClientRect()
            
            const startX = step2Rect.left + 40
            const startY = step2Rect.top + 40
            const textStartX = textBoxRect.left + 16
            const textStartY = textBoxRect.top + 16
            const descendAmount = 30
            
            // Change to text cursor immediately
            if (progress > 0 && cursorType !== 'text') {
              setCursorType('text')
            }
            
            // Phase 1: Move to text box (0-20%)
            if (progress < 0.2) {
              const moveProgress = progress / 0.2
              const currentX = startX + (textStartX - startX) * moveProgress
              const currentY = startY + (textStartY - startY) * moveProgress + (descendAmount * progress)
              
              // Change to text cursor immediately when cursor appears
              if (progress > 0 && cursorType !== 'text') {
                setCursorType('text')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${currentX}px !important;
                  top: ${currentY}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: 1 !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(1) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
            }
            // Phase 2: Typing animation (20-90%)
            else if (progress < 0.9) {
              const typingProgress = (progress - 0.2) / 0.7
              const charCount = Math.floor(typingProgress * fullText.length)
              setTypedText(fullText.substring(0, charCount))
              
              if (textRef.current) {
                const textWidth = textRef.current.offsetWidth || 0
                if (cursorRef.current) {
                  cursorRef.current.style.cssText = `
                    position: fixed !important;
                    left: ${textStartX + textWidth + 2}px !important;
                    top: ${textStartY + (descendAmount * progress)}px !important;
                    width: 36px !important;
                    height: 36px !important;
                    opacity: 1 !important;
                    display: block !important;
                    visibility: visible !important;
                    z-index: 999999 !important;
                    pointer-events: none !important;
                    background-color: transparent !important;
                    border-radius: 0 !important;
                    transform: scale(1) !important;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                  `
                }
              }
            }
            // Phase 3: Fade out (90-100%)
            else {
              const fadeProgress = (progress - 0.9) / 0.1
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${textStartX}px !important;
                  top: ${textStartY}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: ${1 - fadeProgress} !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(1) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
            }
          },
          onLeaveBack: () => {
            setCursorType('normal')
            setTypedText('')
          }
        })
      }
    }

    // STEP 3: Interest Selection Animation
    if (step3Ref.current && cursorRef.current) {
      const musicCard = step3Ref.current.querySelector('[data-interest="music"]')
      
      if (musicCard) {
        ScrollTrigger.create({
          trigger: step3Ref.current,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: false, // No scrub for instant 60 FPS
          onUpdate: (self: any) => {
            const progress = self.progress
            const step3Rect = step3Ref.current!.getBoundingClientRect()
            const musicRect = musicCard.getBoundingClientRect()
            
            const startX = step3Rect.left + 40
            const startY = step3Rect.top + 40
            const musicX = musicRect.left + musicRect.width / 2
            const musicY = musicRect.top + musicRect.height / 2
            const descendAmount = 30
            
            // Reset to normal cursor at start
            if (progress === 0 && cursorType !== 'normal') {
              setCursorType('normal')
            }
            
            // Phase 1: Move directly to Music (0-40%)
            if (progress < 0.4) {
              const moveProgress = progress / 0.4
              const currentX = startX + (musicX - startX) * moveProgress
              const currentY = startY + (musicY - startY) * moveProgress + (descendAmount * progress)
              
              // Change to pointing cursor when over Music option (at 30%)
              if (progress > 0.3 && cursorType !== 'pointing') {
                setCursorType('pointing')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${currentX}px !important;
                  top: ${currentY}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: 1 !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(1) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              // Music glow starts at 25%
              if (progress > 0.25) {
                const glowProgress = (progress - 0.25) / 0.1
                gsap.set(musicCard, {
                  borderColor: `rgba(244, 238, 233, ${glowProgress})`,
                  boxShadow: `0 0 ${30 * glowProgress}px rgba(244, 238, 233, ${0.6 * glowProgress})`
                })
              }
            }
            // Phase 2: Select Music (40-70%)
            else if (progress < 0.7) {
              const pressProgress = (progress - 0.4) / 0.3
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${musicX}px !important;
                  top: ${musicY + (descendAmount * progress)}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: 1 !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(${1 - (0.1 * pressProgress)}) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              gsap.set(musicCard, {
                scale: 1 - (0.05 * pressProgress),
                backgroundColor: `rgba(244, 238, 233, ${0.15 * pressProgress})`,
                borderColor: '#F4EEE9',
                boxShadow: `0 0 30px rgba(244, 238, 233, ${0.6 + 0.3 * pressProgress})`
              })
            }
            // Phase 3: Release and fade (70-100%)
            else {
              const releaseProgress = (progress - 0.7) / 0.3
              
              if (releaseProgress > 0 && cursorType !== 'normal') {
                setCursorType('normal')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${musicX}px !important;
                  top: ${musicY + (descendAmount * progress)}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: ${1 - releaseProgress} !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(${0.9 + (0.1 * releaseProgress)}) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              gsap.set(musicCard, {
                scale: 0.95 + (0.05 * releaseProgress)
              })
            }
          },
          onLeave: () => setCursorType('normal'),
          onLeaveBack: () => setCursorType('normal')
        })
      }
    }

    // STEP 4: Processing Spinner Animation
    if (step4Ref.current) {
      const spinner = step4Ref.current.querySelector('.spinner')
      
      if (spinner) {
        gsap.to(spinner, {
          rotation: 720,
          ease: 'none',
          scrollTrigger: {
            trigger: step4Ref.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1, // Smoothly link animation to scroll position
          }
        })
      }
    }

    // STEP 5: Download and Confetti Animation
    if (step5Ref.current && cursorRef.current) {
      const downloadBtn = step5Ref.current.querySelector('[data-download]')
      const confettiContainer = step5Ref.current.querySelector('.confetti-container')
      
      if (downloadBtn && confettiContainer) {
        ScrollTrigger.create({
          trigger: step5Ref.current,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: false, // No scrub for instant 60 FPS
          onUpdate: (self: any) => {
            const progress = self.progress
            const step5Rect = step5Ref.current!.getBoundingClientRect()
            const btnRect = downloadBtn.getBoundingClientRect()
            
            const startX = step5Rect.left + 40
            const startY = step5Rect.top + 40
            const endX = btnRect.left + btnRect.width / 2 - 18 // Center cursor on button (36px/2)
            const endY = btnRect.top + btnRect.height / 2 - 18 // Center cursor on button (36px/2)
            const descendAmount = 30
            
            // Animate confetti
            const confettiElements = confettiContainer.querySelectorAll('.confetti-particle')
            confettiElements.forEach((particle: any, i: number) => {
              const particleProgress = Math.max(0, progress - (i * 0.01))
              gsap.set(particle, {
                y: particleProgress * 300,
                opacity: 1 - particleProgress,
                rotation: particleProgress * 360
              })
            })
            
            // Reset to normal cursor
            if (progress === 0 && cursorType !== 'normal') {
              setCursorType('normal')
            }
            
            // Phase 1: Move to download button (0-40%)
            if (progress < 0.4) {
              const moveProgress = progress / 0.4
              const currentX = startX + (endX - startX) * moveProgress
              const currentY = startY + (endY - startY) * moveProgress + (descendAmount * progress)
              
              // Change to pointing cursor when entering download button area (at 20%)
              if (progress > 0.2 && cursorType !== 'pointing') {
                setCursorType('pointing')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${currentX}px !important;
                  top: ${currentY}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: 1 !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(1) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              // Button glow starts at 15%
              if (progress > 0.15) {
                const glowProgress = (progress - 0.15) / 0.1
                gsap.set(downloadBtn, {
                  boxShadow: `0 0 ${20 * glowProgress}px rgba(244, 238, 233, ${0.5 * glowProgress})`
                })
              }
            }
            // Phase 2: Press download button (40-70%)
            else if (progress < 0.7) {
              const pressProgress = (progress - 0.5) / 0.2
              
              if (progress > 0.5 && cursorType !== 'pointing') {
                setCursorType('pointing')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${endX}px !important;
                  top: ${endY + (descendAmount * progress)}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: 1 !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(${1 - (0.15 * Math.max(0, pressProgress))}) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              gsap.set(downloadBtn, {
                scale: 1 - (0.04 * Math.max(0, pressProgress)),
                boxShadow: `0 0 30px rgba(244, 238, 233, ${0.5 + 0.4 * Math.max(0, pressProgress)})`
              })
            }
            // Phase 3: Release and celebrate (70-100%)
            else {
              const releaseProgress = (progress - 0.7) / 0.3
              
              if (releaseProgress > 0 && cursorType !== 'normal') {
                setCursorType('normal')
              }
              
              if (cursorRef.current) {
                cursorRef.current.style.cssText = `
                  position: fixed !important;
                  left: ${endX}px !important;
                  top: ${endY + (descendAmount * progress)}px !important;
                  width: 36px !important;
                  height: 36px !important;
                  opacity: ${1 - releaseProgress} !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999999 !important;
                  pointer-events: none !important;
                  background-color: transparent !important;
                  border-radius: 0 !important;
                  transform: scale(${0.85 + (0.15 * releaseProgress)}) !important;
                  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;
                `
              }
              
              gsap.set(downloadBtn, {
                scale: 0.96 + (0.04 * releaseProgress)
              })
            }
          },
          onLeave: () => setCursorType('normal'),
          onLeaveBack: () => setCursorType('normal')
        })
      }
    }

    // Fade in animations for all steps
    gsap.utils.toArray('.step-container').forEach((step: any) => {
      gsap.from(step, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          end: 'top 65%',
          scrub: false, // No scrub for instant 60 FPS
        }
      })
    })
  }

    loadGSAP()

    return () => {
      if ((window as any).ScrollTrigger) {
        (window as any).ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill())
      }
    }
  }, []) // Run once on mount

  // Separate effect to handle ScrollTrigger refresh when user scrolls before GSAP loads
  useEffect(() => {
    if (gsapLoaded && scrollPosition > 100) {
      const ScrollTrigger = (window as any).ScrollTrigger
      if (ScrollTrigger) {
        console.log('📜 User scrolled after GSAP loaded - refreshing triggers')
        ScrollTrigger.refresh()
      }
    }
  }, [gsapLoaded]) // Only run when GSAP loads, not on every scroll

  return (
      <div className="min-h-screen text-[#F4EEE9] font-sans selection:bg-[#cfaa32]/30 overflow-x-hidden relative">
      <BackgroundGrid />
      <div className="relative z-20 flex flex-col flex-grow min-h-screen">
        <div className="flex-grow pb-32">
      
      <div ref={containerRef} className="relative z-10">
      {/* Animated Cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none"
        style={{ 
          x: '-10000px', 
          y: '-10000px',
          width: '36px',
          height: '36px',
          willChange: 'x, y, opacity, transform, filter',
          opacity: 0,
          display: 'none',
          visibility: 'hidden',
          zIndex: 999999,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
          transition: 'filter 0.15s ease',
          backgroundColor: 'rgba(207, 170, 50, 0.8)',
          borderRadius: '50%'
        }}
      >
        <img 
          src={getCursorImage()}
          alt="cursor"
          style={{ 
            width: '36px', 
            height: '36px',
            objectFit: 'contain',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            imageRendering: 'crisp-edges'
          }}
          onError={(e) => {
            console.log('❌ Cursor image failed to load, using fallback')
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      </div>

      {/* Text Cursor - positioned by GSAP */}
      <div
        ref={textCursorRef}
        className="fixed w-0.5 h-5 bg-[#cfaa32] pointer-events-none z-[999999]"
        style={{ 
          x: '-1000px', 
          y: '-1000px',
          opacity: 0,
          boxShadow: '0 0 4px rgba(207, 170, 50, 0.5)'
        }}
      />

      {/* Hero Section */}
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#cfaa32]/10 border border-[#cfaa32]/20 text-[#cfaa32] text-xs font-bold tracking-widest uppercase mb-12">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cfaa32] animate-pulse" />
          AI-Powered Learning
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-8 text-[#F4EEE9] text-center text-balance leading-tight font-serif tracking-tight">
          Learn Through <span className="text-[#cfaa32]">Your Passion</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#F4EEE9]/70 mb-14 text-center max-w-2xl leading-relaxed font-light">
          Transform any learning material into personalized videos tailored to your interests
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#F4EEE9] text-[#1a0509] font-bold rounded-full hover:bg-white shadow-xl shadow-[#cfaa32]/5 cursor-pointer text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#cfaa32]/10"
        >
          Start Learning
          <ArrowRight size={20} />
        </button>
      </div>

      <section className="space-y-32 py-32">
        {/* Step 1: Click Start Button */}
        <div
          id="start-learning"
          ref={step1Ref}
          className="step-container max-w-2xl mx-auto w-full px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#F4EEE9] font-serif">Step 1: Click Start</h2>
            <p className="text-[#F4EEE9]/60 text-lg">Begin your learning journey</p>
          </div>
          <div className="animation-box bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-16 flex items-center justify-center min-h-64 relative overflow-hidden group hover:border-[#cfaa32]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#cfaa32]/5 blur-[80px] rounded-full pointer-events-none" />
            <button className="px-8 py-4 bg-[#F4EEE9] text-[#1a0509] font-semibold rounded-full text-lg cursor-pointer transition-all hover:bg-white shadow-xl">
              Start Learning
            </button>
          </div>
        </div>

        {/* Step 2: Type Text */}
        <div
          ref={step2Ref}
          className="step-container max-w-2xl mx-auto w-full px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#F4EEE9] font-serif">Step 2: Upload Your Content</h2>
            <p className="text-[#F4EEE9]/60 text-lg">Share the material you want to learn</p>
          </div>
          <div className="animation-box bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-12 relative overflow-hidden group hover:border-[#cfaa32]/30 transition-all duration-500">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#cfaa32]/5 to-transparent" />
            <div className="text-input relative w-full h-32 bg-[#1a0509]/50 border border-[#F4EEE9]/10 rounded-xl p-4 min-h-32 flex items-start overflow-hidden backdrop-blur-sm">
              <div ref={textRef} className="whitespace-pre-wrap text-[#F4EEE9] text-base leading-relaxed font-mono">{typedText}</div>
            </div>
            <div className="mt-6 text-sm text-[#F4EEE9]/40 flex items-center gap-2">
              <span className="text-[#cfaa32]">✓</span> {typedText.length} characters recognized
            </div>
          </div>
        </div>

        {/* Step 3: Select Music */}
        <div
          ref={step3Ref}
          className="step-container max-w-2xl mx-auto w-full px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#F4EEE9] font-serif">Step 3: Choose Your Interest</h2>
            <p className="text-[#F4EEE9]/60 text-lg">Select what excites you</p>
          </div>
          <div className="animation-box bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-12 relative overflow-hidden group hover:border-[#cfaa32]/30 transition-all duration-500">
            <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-[#cfaa32]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Music', icon: '🎵', dataAttr: 'music' },
                { label: 'Science', icon: '🔬', dataAttr: 'science' },
                { label: 'Sports', icon: '⚽', dataAttr: 'sports' },
                { label: 'Tech', icon: '💻', dataAttr: 'tech' },
              ].map((interest) => (
                <button
                  key={interest.label}
                  data-interest={interest.dataAttr}
                  className="p-6 rounded-xl border border-[#F4EEE9]/10 bg-[#1a0509]/30 backdrop-blur-sm transition-all cursor-pointer hover:border-[#cfaa32]/50 hover:bg-[#cfaa32]/10 hover:scale-105 group/item"
                >
                  <div className="text-3xl mb-3 group-hover/item:scale-110 transition-transform duration-300">{interest.icon}</div>
                  <div className="font-semibold text-[#F4EEE9]">{interest.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Video Generating */}
        <div
          ref={step4Ref}
          className="step-container max-w-2xl mx-auto w-full px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#F4EEE9] font-serif">Step 4: Generating Your Video</h2>
            <p className="text-[#F4EEE9]/60 text-lg">AI is creating your personalized video...</p>
          </div>
          <div className="bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-16 flex flex-col items-center justify-center min-h-64 relative overflow-hidden group hover:border-[#cfaa32]/30 transition-all duration-500">
            <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[#cfaa32]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative w-24 h-24 mb-8">
              <div className="spinner absolute inset-0 border-4 border-transparent border-t-[#cfaa32] border-r-[#cfaa32]/50 rounded-full" />
            </div>
            <p className="text-[#cfaa32] font-medium animate-pulse">Personalizing with Music theme...</p>
          </div>
        </div>

        {/* Step 5: Download */}
        <div
          ref={step5Ref}
          className="step-container max-w-2xl mx-auto w-full px-6 relative"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#F4EEE9] font-serif">Step 5: Your Video is Ready!</h2>
            <p className="text-[#F4EEE9]/60 text-lg">Download and start learning</p>
          </div>
          <div className="animation-box bg-[#F4EEE9]/5 border border-[#F4EEE9]/10 backdrop-blur-md rounded-3xl p-8 space-y-6 relative overflow-hidden group hover:border-[#cfaa32]/30 transition-all duration-500">
            {/* Confetti */}
            <div className="confetti-container absolute inset-0 pointer-events-none">
              {confettiParticles.map((particle, i) => (
                <div
                  key={i}
                  className="confetti-particle absolute w-3 h-3 rounded-full"
                  style={{
                    left: particle.left,
                    top: `0px`,
                    backgroundColor: particle.color,
                  }}
                />
              ))}
            </div>

            <div className="w-full h-48 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-[#F4EEE9]/5 group-hover:border-[#cfaa32]/20 transition-colors">
              <div className="text-6xl animate-bounce">🎬</div>
            </div>

            <div className="space-y-3 text-center">
              <h3 className="text-xl font-semibold text-[#F4EEE9] font-serif">Jazz Through the Ages</h3>
              <p className="text-[#F4EEE9]/60 text-sm">45 seconds • Music theme • Ready to learn</p>
            </div>

            <div className="flex gap-4 relative">
              <button 
                data-download
                className="flex-1 px-6 py-3 bg-[#F4EEE9] text-[#1a0509] font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-white shadow-lg hover:shadow-[#cfaa32]/20 hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              <button className="flex-1 px-6 py-3 bg-transparent text-[#F4EEE9] font-medium rounded-xl cursor-pointer transition-all hover:bg-[#F4EEE9]/10 backdrop-blur-sm border border-[#F4EEE9]/20 hover:border-[#F4EEE9]/40">
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-5xl font-bold mb-6 text-[#F4EEE9] font-serif">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-[#F4EEE9]/70 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of learners creating personalized videos and learning through their passions.
        </p>
        <button
          onClick={onStart}
          className="px-10 py-5 bg-[#cfaa32] text-[#1a0509] rounded-full font-bold text-lg hover:bg-[#deb63d] hover:shadow-lg hover:shadow-[#cfaa32]/25 transition-all flex items-center gap-3 mx-auto transform hover:-translate-y-1"
        >
          Start Creating Now
          <ArrowRight size={20} />
        </button>
      </div>
      </div>
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
      </div>
      <Footer />
    </div>
      </div>
  )
}
