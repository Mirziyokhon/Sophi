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

  // Generate confetti on client side only - ALL #F4EEE9
  useEffect(() => {
    const colors = ['#F4EEE9', '#F4EEE9', '#F4EEE9', '#F4EEE9', '#F4EEE9']
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
    let ctx: any

    const loadGSAP = async () => {
      try {
        const gsapModule = await import('gsap')
        const ScrollTriggerModule = await import('gsap/ScrollTrigger')
        
        const gsap = gsapModule.default || gsapModule.gsap
        const ScrollTrigger = ScrollTriggerModule.default || ScrollTriggerModule.ScrollTrigger
        
        gsap.registerPlugin(ScrollTrigger)
        ;(window as any).ScrollTrigger = ScrollTrigger
        
        console.log('✅ GSAP loaded successfully')
        setGsapLoaded(true)
        
        setTimeout(() => {
          initAnimations(gsap, ScrollTrigger)
        }, 100)
      } catch (error) {
        console.error('❌ Failed to load GSAP:', error)
      }
    }

    const initAnimations = (gsap: any, ScrollTrigger: any) => {
      if (!containerRef.current) {
        console.warn('⚠️ Container ref not ready')
        return
      }

      console.log('🎬 Initializing GSAP animations...')
      
      ctx = gsap.context(() => {
      
      // STEP 1: Cursor moves to button and clicks
      if (step1Ref.current && cursorRef.current) {
        const box = step1Ref.current.querySelector('.animation-box')
        const button = step1Ref.current.querySelector('button')
        
        if (box && button) {
          const tl1 = gsap.timeline({
            scrollTrigger: {
              trigger: step1Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.8,
              onUpdate: (self: any) => {
                const boxRect = box.getBoundingClientRect()
                const btnRect = button.getBoundingClientRect()
                const progress = self.progress
                
                const startX = boxRect.left + 40
                const startY = boxRect.top + 40
                const endX = btnRect.left + btnRect.width / 2 - 14
                const endY = btnRect.top + btnRect.height / 2 - 14
                const descendAmount = 30
                
                if (progress === 0 && cursorType !== 'normal') {
                  setCursorType('normal')
                }
                
                if (progress < 0.4) {
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
                  
                  if (progress > 0.3) {
                    const glowProgress = (progress - 0.3) / 0.1
                    gsap.set(button, {
                      borderColor: `rgba(244, 238, 233, ${glowProgress})`,
                      boxShadow: `0 0 ${30 * glowProgress}px rgba(244, 238, 233, ${0.6 * glowProgress})`
                    })
                  }
                } else if (progress < 0.7) {
                  const pressProgress = (progress - 0.5) / 0.2
                  
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
                    backgroundColor: `rgba(244, 238, 233, ${0.15 * pressProgress})`,
                    borderColor: '#F4EEE9',
                    boxShadow: `0 0 30px rgba(244, 238, 233, ${0.6 + 0.3 * pressProgress})`
                  })
                } else {
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
              onLeaveBack: () => setCursorType('normal')
            }
          })
          
          tl1.to({}, { duration: 1 })
        }
      }

      // STEP 2: Text typing animation
      if (step2Ref.current && textCursorRef.current && textRef.current) {
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: step2Ref.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 0.8,
            onUpdate: (self: any) => {
              const progress = self.progress
              const charCount = Math.floor(progress * fullText.length)
              setTypedText(fullText.slice(0, charCount))
              
              if (textRef.current) {
                const textRect = textRef.current.getBoundingClientRect()
                const textWidth = textRef.current.offsetWidth
                const lineHeight = 24
                const charsPerLine = Math.floor(textWidth / 9)
                const currentLine = Math.floor(charCount / charsPerLine)
                const charInLine = charCount % charsPerLine
                
                const cursorX = textRect.left + (charInLine * 9)
                const cursorY = textRect.top + (currentLine * lineHeight) + 4
                
                gsap.set(textCursorRef.current, {
                  left: cursorX,
                  top: cursorY,
                  opacity: progress > 0 && progress < 0.95 ? 1 : 0
                })
              }
            }
          }
        })
        
        tl2.to({}, { duration: 1 })
      }

      // STEP 3: Cursor selects interest
      if (step3Ref.current && cursorRef.current) {
        const box = step3Ref.current.querySelector('.animation-box')
        const musicBtn = step3Ref.current.querySelector('[data-interest="music"]')
        
        if (box && musicBtn) {
          const tl3 = gsap.timeline({
            scrollTrigger: {
              trigger: step3Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.8,
              onUpdate: (self: any) => {
                const boxRect = box.getBoundingClientRect()
                const btnRect = musicBtn.getBoundingClientRect()
                const progress = self.progress
                
                const startX = boxRect.left + 40
                const startY = boxRect.top + 40
                const endX = btnRect.left + btnRect.width / 2 - 14
                const endY = btnRect.top + btnRect.height / 2 - 14
                const descendAmount = 30
                
                if (progress === 0 && cursorType !== 'normal') {
                  setCursorType('normal')
                }
                
                if (progress < 0.4) {
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
                  
                  if (progress > 0.3) {
                    const glowProgress = (progress - 0.3) / 0.1
                    gsap.set(musicBtn, {
                      borderColor: `rgba(244, 238, 233, ${glowProgress})`,
                      boxShadow: `0 0 ${30 * glowProgress}px rgba(244, 238, 233, ${0.6 * glowProgress})`
                    })
                  }
                } else if (progress < 0.7) {
                  const pressProgress = (progress - 0.5) / 0.2
                  
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
                  gsap.set(musicBtn, {
                    scale: 1 - (0.04 * Math.max(0, pressProgress)),
                    backgroundColor: `rgba(244, 238, 233, ${0.15 * pressProgress})`,
                    borderColor: '#F4EEE9',
                    boxShadow: `0 0 30px rgba(244, 238, 233, ${0.6 + 0.3 * pressProgress})`
                  })
                } else {
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
                  gsap.set(musicBtn, {
                    scale: 0.96 + (0.04 * releaseProgress)
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

      // STEP 4: Spinner rotation
      if (step4Ref.current) {
        const spinner = step4Ref.current.querySelector('.spinner')
        
        if (spinner) {
          gsap.to(spinner, {
            rotation: 720,
            duration: 3,
            ease: 'none',
            scrollTrigger: {
              trigger: step4Ref.current,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.8
            }
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
                
                const confettiElements = confettiContainer.querySelectorAll('.confetti-particle')
                confettiElements.forEach((particle: any, i: number) => {
                  const particleProgress = Math.max(0, progress - (i * 0.01))
                  gsap.set(particle, {
                    y: particleProgress * 300,
                    opacity: 1 - particleProgress,
                    rotation: particleProgress * 360
                  })
                })
                
                if (progress === 0 && cursorType !== 'normal') {
                  setCursorType('normal')
                }
                
                if (progress < 0.4) {
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
                  
                  if (progress > 0.3) {
                    const glowProgress = (progress - 0.3) / 0.1
                    gsap.set(downloadBtn, {
                      boxShadow: `0 0 ${20 * glowProgress}px rgba(244, 238, 233, ${0.5 * glowProgress})`
                    })
                  }
                } else if (progress < 0.7) {
                  const pressProgress = (progress - 0.5) / 0.2
                  
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
                    boxShadow: `0 0 30px rgba(244, 238, 233, ${0.5 + 0.4 * Math.max(0, pressProgress)})`
                  })
                } else {
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
      })
    }

    loadGSAP()

    return () => {
      if (ctx) ctx.revert()
      if ((window as any).ScrollTrigger) {
        (window as any).ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill())
      }
    }
  }, [])

  useEffect(() => {
    if (gsapLoaded && scrollPosition > 100) {
      const ScrollTrigger = (window as any).ScrollTrigger
      if (ScrollTrigger) {
        console.log('📜 User scrolled after GSAP loaded - refreshing triggers')
        ScrollTrigger.refresh()
      }
    }
  }, [gsapLoaded])

  return (
      <div className="min-h-screen bg-background text-[#F4EEE9] font-sans selection:bg-[#F4EEE9]/30 overflow-x-hidden relative">
      <BackgroundGrid />
      <div className="relative z-10 flex flex-col flex-grow min-h-screen">
        <div className="flex-grow pb-32">
      
      <div ref={containerRef} className="relative z-10">
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

      <div
        ref={textCursorRef}
        className="fixed w-0.5 h-5 bg-[#F4EEE9] pointer-events-none z-[9999]"
        style={{ 
          top: '-1000px', 
          left: '-1000px',
          opacity: 0,
          boxShadow: '0 0 4px rgba(244, 238, 233, 0.5)'
        }}
      />

      {/* Hero Section - ALL #F4EEE9 */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-32">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4EEE9]/10 border border-[#F4EEE9]/20 text-[#F4EEE9] text-xs font-semibold tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-[#F4EEE9] animate-pulse" />
          AI-POWERED LEARNING
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#F4EEE9] text-center text-balance leading-tight drop-shadow-2xl">
          Learn Through <span className="text-[#F4EEE9]">Your Passion</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#F4EEE9] mb-12 text-center max-w-3xl leading-relaxed">
          Transform any learning material into personalized videos tailored to your interests
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#F4EEE9]/10 text-[#F4EEE9] border border-[#F4EEE9]/30 font-semibold rounded-full hover:bg-[#F4EEE9]/20 shadow-xl cursor-pointer text-lg transition-all hover:shadow-lg hover:-translate-y-1"
        >
          Start Learning
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <section className="space-y-32 py-32">
        {/* Step 1 - ALL #F4EEE9 */}
        <div ref={step1Ref} className="step-container max-w-2xl mx-auto w-full px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-[#F4EEE9]">Step 1: Click Start</h2>
            <p className="text-[#F4EEE9]">Begin your learning journey</p>
          </div>
          <div className="animation-box bg-background/50 border border-[#F4EEE9]/10 backdrop-blur-sm rounded-3xl p-16 flex items-center justify-center min-h-64 relative overflow-hidden group hover:border-[#F4EEE9]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4EEE9]/10 blur-[80px] rounded-full pointer-events-none" />
            <button className="px-8 py-4 bg-[#F4EEE9]/10 text-[#F4EEE9] border border-[#F4EEE9]/30 font-semibold rounded-full text-lg cursor-pointer transition-all hover:bg-[#F4EEE9]/20 shadow-xl hover:shadow-lg hover:-translate-y-1">
              Start Learning
            </button>
          </div>
        </div>

        {/* Step 2 - ALL #F4EEE9 */}
        <div ref={step2Ref} className="step-container max-w-2xl mx-auto w-full px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-[#F4EEE9]">Step 2: Upload Your Content</h2>
            <p className="text-[#F4EEE9]">Share the material you want to learn</p>
          </div>
          <div className="animation-box bg-background/50 border border-[#F4EEE9]/10 backdrop-blur-sm rounded-3xl p-12 relative overflow-hidden group hover:border-[#F4EEE9]/30 transition-all duration-500">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#F4EEE9]/20 to-transparent" />
            <div className="text-input relative w-full h-32 bg-background/50 border border-[#F4EEE9]/10 rounded-xl p-4 min-h-32 flex items-start overflow-hidden backdrop-blur-sm">
              <div ref={textRef} className="whitespace-pre-wrap text-[#F4EEE9] text-base leading-relaxed">{typedText}</div>
            </div>
            <div className="mt-6 text-sm text-[#F4EEE9]">✓ {typedText.length} characters recognized</div>
          </div>
        </div>

        {/* Step 3 - ALL #F4EEE9 */}
        <div ref={step3Ref} className="step-container max-w-2xl mx-auto w-full px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-[#F4EEE9]">Step 3: Choose Your Interest</h2>
            <p className="text-[#F4EEE9]">Select what excites you</p>
          </div>
          <div className="animation-box bg-background/50 border border-[#F4EEE9]/10 backdrop-blur-sm rounded-3xl p-12 relative overflow-hidden group hover:border-[#F4EEE9]/30 transition-all duration-500">
            <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-[#F4EEE9]/20 rounded-full blur-[80px] pointer-events-none" />
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
                  className="p-6 rounded-xl border-2 border-[#F4EEE9]/10 bg-background/50 backdrop-blur-sm transition-all cursor-pointer hover:border-[#F4EEE9]/50 hover:bg-[#F4EEE9]/10 hover:scale-105"
                >
                  <div className="text-3xl mb-2">{interest.icon}</div>
                  <div className="font-semibold text-[#F4EEE9]">{interest.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4 - ALL #F4EEE9 */}
        <div ref={step4Ref} className="step-container max-w-2xl mx-auto w-full px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-[#F4EEE9]">Step 4: Generating Your Video</h2>
            <p className="text-[#F4EEE9]">AI is creating your personalized video...</p>
          </div>
          <div className="bg-background/50 border border-[#F4EEE9]/10 backdrop-blur-sm rounded-3xl p-16 flex flex-col items-center justify-center min-h-64 relative overflow-hidden group hover:border-[#F4EEE9]/30 transition-all duration-500">
            <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[#F4EEE9]/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative w-24 h-24 mb-8">
              <div className="spinner absolute inset-0 border-4 border-transparent border-t-[#F4EEE9] border-r-[#F4EEE9] rounded-full" />
            </div>
            <p className="text-[#F4EEE9]">Personalizing with Music theme...</p>
          </div>
        </div>

        {/* Step 5 - ALL #F4EEE9 */}
        <div ref={step5Ref} className="step-container max-w-2xl mx-auto w-full px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2 text-[#F4EEE9]">Step 5: Your Video is Ready!</h2>
            <p className="text-[#F4EEE9]">Download and start learning</p>
          </div>
          <div className="animation-box bg-background/50 border border-[#F4EEE9]/10 backdrop-blur-sm rounded-3xl p-8 space-y-6 relative overflow-hidden group hover:border-[#F4EEE9]/30 transition-all duration-500">
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

            <div className="w-full h-48 bg-gradient-to-br from-[#F4EEE9]/20 to-[#F4EEE9]/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-[#F4EEE9]/5">
              <div className="text-6xl">🎬</div>
            </div>

            <div className="space-y-3 text-center">
              <h3 className="text-xl font-semibold text-[#F4EEE9]">Jazz Through the Ages</h3>
              <p className="text-[#F4EEE9] text-sm">45 seconds • Music theme • Ready to learn</p>
            </div>

            <div className="flex gap-4 relative">
              <button 
                data-download
                className="flex-1 px-6 py-3 bg-[#F4EEE9]/10 text-[#F4EEE9] border border-[#F4EEE9]/30 font-medium rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-[#F4EEE9]/20 shadow-xl hover:shadow-lg hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              <button className="flex-1 px-6 py-3 bg-[#F4EEE9]/10 text-[#F4EEE9] border border-[#F4EEE9]/30 font-medium rounded-xl cursor-pointer transition-all hover:bg-[#F4EEE9]/20 backdrop-blur-sm">
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - ALL #F4EEE9 */}
      <div className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-5xl font-bold mb-6 text-[#F4EEE9]">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-[#F4EEE9] mb-8 max-w-2xl mx-auto">
          Join thousands of learners creating personalized videos and learning through their passions.
        </p>
        <button
          onClick={onStart}
          className="px-10 py-4 bg-[#F4EEE9]/10 text-[#F4EEE9] border border-[#F4EEE9]/30 rounded-full font-bold text-lg hover:bg-[#F4EEE9]/20 hover:shadow-lg transition-all flex items-center gap-2 mx-auto transform hover:-translate-y-1"
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
