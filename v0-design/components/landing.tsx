'use client'

import { useEffect, useRef, useState } from 'react'
import { BackgroundGrid } from './background-grid'
import { Footer } from './footer'

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
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
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

      // STEP 1: Animated cursor moves to Start button
      if (step1Ref.current && cursorRef.current) {
        const button = step1Ref.current.querySelector('button')
        console.log('🎯 Setting up Step 1 cursor animation...', { 
          step1Ref: !!step1Ref.current, 
          cursorRef: !!cursorRef.current,
          button: !!button
        })
        
        // Test: Make cursor visible briefly to verify it's working
        if (cursorRef.current) {
          gsap.set(cursorRef.current, {
            left: 200,
            top: 200,
            opacity: 1,
            display: 'block',
            visibility: 'visible',
            zIndex: 99999
          })
          setTimeout(() => {
            if (cursorRef.current) {
              gsap.set(cursorRef.current, {
                left: -10000,
                top: -10000,
                opacity: 0,
                display: 'none',
                visibility: 'hidden'
              })
            }
          }, 3000)
        }
        
        if (button) {
          const buttonRect = button.getBoundingClientRect()
          const descendAmount = 30 // Pixels to descend
                
          const tl1 = gsap.timeline({
            scrollTrigger: {
              trigger: step1Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.8,
              onUpdate: (self: any) => {
                const progress = self.progress
                const step1Rect = step1Ref.current!.getBoundingClientRect()
                
                // Start from outside Step 1 box (top-left area)
                const startX = step1Rect.left + 100
                const startY = step1Rect.top + 100
                
                // End at button center
                const endX = buttonRect.left + buttonRect.width / 2 - 18
                const endY = buttonRect.top + buttonRect.height / 2 - 18
                
                console.log('🎯 Cursor positioning setup:', {
                  step1Rect: {
                    left: Math.round(step1Rect.left),
                    top: Math.round(step1Rect.top),
                    width: Math.round(step1Rect.width),
                    height: Math.round(step1Rect.height)
                  },
                  buttonRect: {
                    left: Math.round(buttonRect.left),
                    top: Math.round(buttonRect.top),
                    width: Math.round(buttonRect.width),
                    height: Math.round(buttonRect.height)
                  },
                  startPosition: { x: Math.round(startX), y: Math.round(startY) },
                  endPosition: { x: Math.round(endX), y: Math.round(endY) }
                })
                
                // Reset to normal cursor
                if (progress === 0 && cursorType !== 'normal') {
                  setCursorType('normal')
                }
                
                if (progress < 0.4) {
                  // Cursor moves to button with motion blur
                  const moveProgress = progress / 0.4
                  const currentX = startX + (endX - startX) * moveProgress
                  const currentY = startY + (endY - startY) * moveProgress + (descendAmount * progress)
                  
                  const blurAmount = moveProgress > 0.1 && moveProgress < 0.9 ? 2 : 0
                  
                  gsap.set(cursorRef.current, {
                    left: currentX,
                    top: currentY,
                    opacity: 1,
                    scale: 1,
                    filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(${blurAmount}px)`
                  })
                  
                  // Glow starts at 30%
                  if (progress > 0.3) {
                    const glowProgress = (progress - 0.3) / 0.1
                    gsap.set(button, {
                      boxShadow: `0 0 ${20 * glowProgress}px rgba(59, 130, 246, ${0.5 * glowProgress})`
                    })
                  }
                } else if (progress < 0.7) {
                  // Pressing phase (starts at 50% - EARLIER!)
                  const pressProgress = (progress - 0.5) / 0.2
                  
                  // Change to pointing cursor at start
                  if (progress > 0.5 && cursorType !== 'pointing') {
                    setCursorType('pointing')
                  }
                  
                  gsap.set(cursorRef.current, {
                    left: endX,
                    top: endY + (descendAmount * progress),
                    opacity: 1,
                    scale: 1 - (0.15 * Math.max(0, pressProgress)),
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(0px)'
                  })
                  gsap.set(button, {
                    scale: 1 - (0.04 * Math.max(0, pressProgress)),
                    boxShadow: `0 0 30px rgba(59, 130, 246, ${0.5 + 0.4 * Math.max(0, pressProgress)})`
                  })
                } else {
                  // Release and fade
                  const releaseProgress = (progress - 0.7) / 0.3
                  
                  if (releaseProgress > 0 && cursorType !== 'normal') {
                    setCursorType('normal')
                  }
                  
                  gsap.set(cursorRef.current, {
                    left: endX,
                    top: endY + (descendAmount * progress),
                    opacity: 1 - releaseProgress,
                    scale: 0.85 + (0.15 * releaseProgress),
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(0px)'
                  })
                  gsap.set(button, {
                    scale: 0.96 + (0.04 * releaseProgress)
                  })
                }
              },
              onLeave: () => setCursorType('normal'),
              onLeaveBack: () => {
                setCursorType('normal')
                // Hide cursor when scrolling back up past Step 1
                if (cursorRef.current) {
                  gsap.set(cursorRef.current, {
                    left: -1000,
                    top: -1000,
                    opacity: 0,
                    display: 'none',
                    visibility: 'hidden'
                  })
                }
              }
            }
          })

          tl1.to({}, { duration: 1 })
        }
      }

      // STEP 2: Cursor moves to text box, changes to text cursor, and types
      if (step2Ref.current && cursorRef.current && textRef.current) {
        const box = step2Ref.current.querySelector('.animation-box')
        const textBox = step2Ref.current.querySelector('.text-input')
        
        if (box && textBox) {
          const tl2 = gsap.timeline({
            scrollTrigger: {
              trigger: step2Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.8,
              onUpdate: (self: any) => {
                const boxRect = box.getBoundingClientRect()
                const textBoxRect = textBox.getBoundingClientRect()
                const progress = self.progress
                
                // Calculate positions with descending
                const startX = boxRect.left + 40
                const startY = boxRect.top + 40
                const textStartX = textBoxRect.left + 16
                const textStartY = textBoxRect.top + 16
                const descendAmount = 30
                
                // Change to text cursor at start
                if (progress > 0 && cursorType !== 'text') {
                  setCursorType('text')
                }
                
                if (progress < 0.2) {
                  // Cursor appears and moves to text box
                  const moveProgress = progress / 0.2
                  const currentX = startX + (textStartX - startX) * moveProgress
                  const currentY = startY + (textStartY - startY) * moveProgress + (descendAmount * progress)
                  
                  gsap.set(cursorRef.current, {
                    left: currentX,
                    top: currentY,
                    opacity: 1,
                    scale: 1
                  })
                } else if (progress < 0.9) {
                  // Typing phase
                  const typingProgress = (progress - 0.2) / 0.7
                  const charCount = Math.floor(typingProgress * fullText.length)
                  setTypedText(fullText.substring(0, charCount))
                  
                  // Move cursor with text and add descending
                  if (textRef.current) {
                    const textWidth = textRef.current.offsetWidth || 0
                    gsap.set(cursorRef.current, {
                      left: textStartX + textWidth + 2,
                      top: textStartY + (descendAmount * progress),
                      opacity: 1,
                      scale: 1
                    })
                  }
                } else {
                  // Fade out but keep text cursor
                  const fadeProgress = (progress - 0.9) / 0.1
                  gsap.set(cursorRef.current, {
                    opacity: 1 - fadeProgress
                  })
                }
              },
              onLeave: () => {
                // Don't change cursor type
              },
              onLeaveBack: () => {
                setCursorType('normal')
                setTypedText('')
              }
            }
          })
          
          tl2.to({}, { duration: 1 })
        }
      }

      // STEP 3: Cursor moves between options and selects Music
      if (step3Ref.current && cursorRef.current) {
        const box = step3Ref.current.querySelector('.animation-box')
        const scienceCard = step3Ref.current.querySelector('[data-interest="science"]')
        const musicCard = step3Ref.current.querySelector('[data-interest="music"]')
        
        if (box && scienceCard && musicCard) {
          const tl3 = gsap.timeline({
            scrollTrigger: {
              trigger: step3Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.8,
              onUpdate: (self: any) => {
                const boxRect = box.getBoundingClientRect()
                const scienceRect = scienceCard.getBoundingClientRect()
                const musicRect = musicCard.getBoundingClientRect()
                const progress = self.progress
                
                const startX = boxRect.left + 40
                const startY = boxRect.top + 40
                const scienceX = scienceRect.left + scienceRect.width / 2 - 14
                const scienceY = scienceRect.top + scienceRect.height / 2 - 14
                const musicX = musicRect.left + musicRect.width / 2 - 14
                const musicY = musicRect.top + musicRect.height / 2 - 14
                const descendAmount = 30
                
                // Reset to normal cursor at start
                if (progress === 0 && cursorType !== 'normal') {
                  setCursorType('normal')
                }
                
                if (progress < 0.3) {
                  // Move toward Science with motion blur
                  const moveProgress = progress / 0.3
                  const currentX = startX + (scienceX - startX) * moveProgress
                  const currentY = startY + (scienceY - startY) * moveProgress + (descendAmount * progress)
                  
                  const blurAmount = moveProgress > 0.1 && moveProgress < 0.9 ? 2 : 0
                  
                  gsap.set(cursorRef.current, {
                    left: currentX,
                    top: currentY,
                    opacity: 1,
                    scale: 1,
                    filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(${blurAmount}px)`
                  })
                } else if (progress < 0.5) {
                  // Move from Science to Music with motion blur
                  const moveProgress = (progress - 0.3) / 0.2
                  const currentX = scienceX + (musicX - scienceX) * moveProgress
                  const currentY = scienceY + (musicY - scienceY) * moveProgress + (descendAmount * progress)
                  
                  const blurAmount = 2
                  
                  gsap.set(cursorRef.current, {
                    left: currentX,
                    top: currentY,
                    opacity: 1,
                    scale: 1,
                    filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(${blurAmount}px)`
                  })
                  
                  // Start glow at 40%
                  if (progress > 0.4) {
                    const glowProgress = (progress - 0.4) / 0.1
                    gsap.set(musicCard, {
                      borderColor: `rgba(59, 130, 246, ${glowProgress})`,
                      boxShadow: `0 0 ${30 * glowProgress}px rgba(59, 130, 246, ${0.6 * glowProgress})`
                    })
                  }
                } else if (progress < 0.7) {
                  // Pressing phase (starts at 50% - EARLIER!)
                  const pressProgress = (progress - 0.5) / 0.2
                  
                  // Change to pointing cursor at start
                  if (pressProgress > 0 && cursorType !== 'pointing') {
                    setCursorType('pointing')
                  }
                  
                  gsap.set(cursorRef.current, {
                    left: musicX,
                    top: musicY + (descendAmount * progress),
                    opacity: 1,
                    scale: 1 - (0.1 * pressProgress),
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(0px)'
                  })
                  gsap.set(musicCard, {
                    scale: 1 - (0.05 * pressProgress),
                    backgroundColor: `rgba(59, 130, 246, ${0.15 * pressProgress})`,
                    borderColor: '#3b82f6',
                    boxShadow: `0 0 30px rgba(59, 130, 246, ${0.6 + 0.3 * pressProgress})`
                  })
                } else {
                  // Release and fade
                  const releaseProgress = (progress - 0.7) / 0.3
                  
                  if (releaseProgress > 0 && cursorType !== 'normal') {
                    setCursorType('normal')
                  }
                  
                  gsap.set(cursorRef.current, {
                    left: musicX,
                    top: musicY + (descendAmount * progress),
                    opacity: 1 - releaseProgress,
                    scale: 0.9 + (0.1 * releaseProgress),
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(0px)'
                  })
                  gsap.set(musicCard, {
                    scale: 0.95 + (0.05 * releaseProgress)
                  })
                }
              },
              onLeave: () => setCursorType('normal'),
              onLeaveBack: () => setCursorType('normal')
            }
          })
          
          tl3.to({}, { duration: 1 })
        }
      }

      // STEP 4: Spinner animation (same as processing component)
      if (step4Ref.current) {
        const spinner = step4Ref.current.querySelector('.spinner')
        
        if (spinner) {
          gsap.timeline({
            scrollTrigger: {
              trigger: step4Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 2,
            }
          })
          .to(spinner, {
            rotation: 720, // Two full rotations
            duration: 3,
            ease: 'none'
          })
        }
      }

      // STEP 5: Confetti + cursor clicks download
      if (step5Ref.current && cursorRef.current) {
        const box = step5Ref.current.querySelector('.animation-box')
        const downloadBtn = step5Ref.current.querySelector('[data-download]')
        const confettiContainer = step5Ref.current.querySelector('.confetti-container')
        
        if (box && downloadBtn && confettiContainer) {
          const tl5 = gsap.timeline({
            scrollTrigger: {
              trigger: step5Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.8,
              onUpdate: (self: any) => {
                const boxRect = box.getBoundingClientRect()
                const btnRect = downloadBtn.getBoundingClientRect()
                const progress = self.progress
                
                const startX = boxRect.left + 40
                const startY = boxRect.top + 40
                const endX = btnRect.left + btnRect.width / 2 - 14
                const endY = btnRect.top + btnRect.height / 2 - 14
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
                
                if (progress < 0.4) {
                  // Cursor moves to button with motion blur
                  const moveProgress = progress / 0.4
                  const currentX = startX + (endX - startX) * moveProgress
                  const currentY = startY + (endY - startY) * moveProgress + (descendAmount * progress)
                  
                  const blurAmount = moveProgress > 0.1 && moveProgress < 0.9 ? 2 : 0
                  
                  gsap.set(cursorRef.current, {
                    left: currentX,
                    top: currentY,
                    opacity: 1,
                    scale: 1,
                    filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(${blurAmount}px)`
                  })
                  
                  // Glow starts at 30%
                  if (progress > 0.3) {
                    const glowProgress = (progress - 0.3) / 0.1
                    gsap.set(downloadBtn, {
                      boxShadow: `0 0 ${20 * glowProgress}px rgba(59, 130, 246, ${0.5 * glowProgress})`
                    })
                  }
                } else if (progress < 0.7) {
                  // Pressing phase (starts at 50% - EARLIER!)
                  const pressProgress = (progress - 0.5) / 0.2
                  
                  // Change to pointing cursor at start
                  if (progress > 0.5 && cursorType !== 'pointing') {
                    setCursorType('pointing')
                  }
                  
                  gsap.set(cursorRef.current, {
                    left: endX,
                    top: endY + (descendAmount * progress),
                    opacity: 1,
                    scale: 1 - (0.15 * Math.max(0, pressProgress)),
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(0px)'
                  })
                  gsap.set(downloadBtn, {
                    scale: 1 - (0.04 * Math.max(0, pressProgress)),
                    boxShadow: `0 0 30px rgba(59, 130, 246, ${0.5 + 0.4 * Math.max(0, pressProgress)})`
                  })
                } else {
                  // Release and fade
                  const releaseProgress = (progress - 0.7) / 0.3
                  
                  if (releaseProgress > 0 && cursorType !== 'normal') {
                    setCursorType('normal')
                  }
                  
                  gsap.set(cursorRef.current, {
                    left: endX,
                    top: endY + (descendAmount * progress),
                    opacity: 1 - releaseProgress,
                    scale: 0.85 + (0.15 * releaseProgress),
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) blur(0px)'
                  })
                  gsap.set(downloadBtn, {
                    scale: 0.96 + (0.04 * releaseProgress)
                  })
                }
              },
              onLeave: () => setCursorType('normal'),
              onLeaveBack: () => setCursorType('normal')
            }
          })
          
          tl5.to({}, { duration: 1 })
        }
      }

      // Fade in animations for steps
      gsap.utils.toArray('.step-container').forEach((step: any) => {
        gsap.from(step, {
          opacity: 0,
          y: 50,
          duration: 1,
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            end: 'top 65%',
            scrub: 1,
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
      <div className="min-h-screen bg-[#050A18] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <BackgroundGrid />
      <div className="relative z-10 flex flex-col flex-grow min-h-screen">
        <div className="flex-grow pb-32">
      
      <div ref={containerRef} className="relative z-10">
      {/* Animated Cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none"
        style={{ 
          top: '-10000px', 
          left: '-10000px',
          width: '36px',
          height: '36px',
          willChange: 'left, top, opacity, transform, filter',
          opacity: 0,
          display: 'none',
          visibility: 'hidden',
          zIndex: 9999,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
          transition: 'filter 0.15s ease'
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
        />
      </div>

      {/* Text Cursor - positioned by GSAP */}
      <div
        ref={textCursorRef}
        className="fixed w-0.5 h-5 bg-primary pointer-events-none z-[9999]"
        style={{ 
          top: '-1000px', 
          left: '-1000px',
          opacity: 0,
          boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
        }}
      />

      {/* Hero Section */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          AI-POWERED LEARNING
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white text-center text-balance leading-tight drop-shadow-2xl">
          Learn Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Your Passion</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 text-center max-w-3xl leading-relaxed">
          Transform any learning material into personalized videos tailored to your interests
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#050A18] font-semibold rounded-full hover:bg-blue-50 shadow-xl shadow-white/5 cursor-pointer text-lg transition-all hover:shadow-white/10 hover:-translate-y-1"
        >
          Start Learning
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <section className="space-y-32 py-32">
        {/* Step 1: Click Start Button */}
        <div
          ref={step1Ref}
          className="step-container max-w-2xl mx-auto w-full px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-white">Step 1: Click Start</h2>
            <p className="text-gray-400">Begin your learning journey</p>
          </div>
          <div className="animation-box bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-3xl p-16 flex items-center justify-center min-h-64 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
            <button className="px-8 py-4 bg-white text-[#050A18] font-semibold rounded-full text-lg cursor-pointer transition-all hover:bg-blue-50 shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-1">
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
            <h2 className="text-4xl font-bold mb-2 text-white">Step 2: Upload Your Content</h2>
            <p className="text-gray-400">Share the material you want to learn</p>
          </div>
          <div className="animation-box bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-3xl p-12 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent" />
            <div className="text-input relative w-full h-32 bg-[#050A18]/50 border border-white/10 rounded-xl p-4 min-h-32 flex items-start overflow-hidden backdrop-blur-sm">
              <div ref={textRef} className="whitespace-pre-wrap text-white text-base leading-relaxed">{typedText}</div>
            </div>
            <div className="mt-6 text-sm text-gray-400">✓ {typedText.length} characters recognized</div>
          </div>
        </div>

        {/* Step 3: Select Music */}
        <div
          ref={step3Ref}
          className="step-container max-w-2xl mx-auto w-full px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-white">Step 3: Choose Your Interest</h2>
            <p className="text-gray-400">Select what excites you</p>
          </div>
          <div className="animation-box bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-3xl p-12 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
            <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
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
                  className="p-6 rounded-xl border-2 border-white/10 bg-[#050A18]/50 backdrop-blur-sm transition-all cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10 hover:scale-105"
                >
                  <div className="text-3xl mb-2">{interest.icon}</div>
                  <div className="font-semibold text-white">{interest.label}</div>
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
            <h2 className="text-4xl font-bold mb-2 text-white">Step 4: Generating Your Video</h2>
            <p className="text-gray-400">AI is creating your personalized video...</p>
          </div>
          <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-3xl p-16 flex flex-col items-center justify-center min-h-64 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
            <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative w-24 h-24 mb-8">
              <div className="spinner absolute inset-0 border-4 border-transparent border-t-blue-400 border-r-indigo-400 rounded-full" />
            </div>
            <p className="text-gray-400">Personalizing with Music theme...</p>
          </div>
        </div>

        {/* Step 5: Download */}
        <div
          ref={step5Ref}
          className="step-container max-w-2xl mx-auto w-full px-6 relative"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-white">Step 5: Your Video is Ready!</h2>
            <p className="text-gray-400">Download and start learning</p>
          </div>
          <div className="animation-box bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-3xl p-8 space-y-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
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

            <div className="w-full h-48 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/5">
              <div className="text-6xl">🎬</div>
            </div>

            <div className="space-y-3 text-center">
              <h3 className="text-xl font-semibold text-white">Jazz Through the Ages</h3>
              <p className="text-gray-400 text-sm">45 seconds • Music theme • Ready to learn</p>
            </div>

            <div className="flex gap-4 relative">
              <button 
                data-download
                className="flex-1 px-6 py-3 bg-white text-[#050A18] font-medium rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-blue-50 shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              <button className="flex-1 px-6 py-3 bg-white/10 text-white font-medium rounded-xl cursor-pointer transition-all hover:bg-white/20 backdrop-blur-sm border border-white/10">
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-5xl font-bold mb-6 text-white">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of learners creating personalized videos and learning through their passions.
        </p>
        <button
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 mx-auto transform hover:-translate-y-1"
        >
          Start Creating Now
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
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
