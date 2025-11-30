'use client'

import { useEffect, useRef, useState } from 'react'
import { TypingAnimation } from './typing-animation'

interface LandingProps {
  onStart: () => void
}

export function Landing({ onStart }: LandingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)
  const step4Ref = useRef<HTMLDivElement>(null)
  const step5Ref = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    // Wait for GSAP to load
    const initAnimations = () => {
      if (typeof window === 'undefined' || !(window as any).gsap) {
        setTimeout(initAnimations, 100)
        return
      }

      const gsap = (window as any).gsap
      const ScrollTrigger = (window as any).ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      // Step 1: Animated cursor moves to Start button
      if (step1Ref.current && cursorRef.current) {
        const button = step1Ref.current.querySelector('button')
        if (button) {
          const buttonRect = button.getBoundingClientRect()
          
          gsap.timeline({
            scrollTrigger: {
              trigger: step1Ref.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 1,
            }
          })
          .fromTo(cursorRef.current,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.3 }
          )
          .to(cursorRef.current, {
            x: buttonRect.left + buttonRect.width / 2 - 10,
            y: buttonRect.top + buttonRect.height / 2 - 10,
            duration: 1,
            ease: 'power2.inOut'
          })
          .to(button, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
          })
          .to(button, {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)',
            duration: 0.3
          })
        }
      }

      // Step 2: Text typing animation
      if (step2Ref.current) {
        gsap.timeline({
          scrollTrigger: {
            trigger: step2Ref.current,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 1,
          }
        })
        .from(step2Ref.current.querySelector('.typing-container'), {
          opacity: 0,
          y: 30,
          duration: 0.5
        })
      }

      // Step 3: Cursor clicks Music card
      if (step3Ref.current && cursorRef.current) {
        const musicCard = step3Ref.current.querySelector('[data-interest="music"]')
        if (musicCard) {
          const cardRect = musicCard.getBoundingClientRect()
          
          gsap.timeline({
            scrollTrigger: {
              trigger: step3Ref.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 1,
            }
          })
          .to(cursorRef.current, {
            x: cardRect.left + cardRect.width / 2 - 10,
            y: cardRect.top + cardRect.height / 2 - 10,
            duration: 1,
            ease: 'power2.inOut'
          })
          .to(musicCard, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
          })
          .to(musicCard, {
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
            duration: 0.3
          })
        }
      }

      // Step 4: Spinner animation (already smooth)
      if (step4Ref.current) {
        const spinner = step4Ref.current.querySelector('.spinner')
        if (spinner) {
          gsap.to(spinner, {
            rotation: 360,
            duration: 2,
            repeat: -1,
            ease: 'linear',
            scrollTrigger: {
              trigger: step4Ref.current,
              start: 'top 60%',
              end: 'bottom 40%',
              toggleActions: 'play pause resume pause'
            }
          })
        }
      }

      // Step 5: Download button click with particles
      if (step5Ref.current && cursorRef.current) {
        const downloadBtn = step5Ref.current.querySelector('[data-download]')
        if (downloadBtn) {
          const btnRect = downloadBtn.getBoundingClientRect()
          
          gsap.timeline({
            scrollTrigger: {
              trigger: step5Ref.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 1,
              onEnter: () => createDownloadParticles(),
              onEnterBack: () => createDownloadParticles(),
            }
          })
          .to(cursorRef.current, {
            x: btnRect.left + btnRect.width / 2 - 10,
            y: btnRect.top + btnRect.height / 2 - 10,
            duration: 1,
            ease: 'power2.inOut'
          })
          .to(downloadBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
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
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          }
        })
      })
    }

    initAnimations()

    return () => {
      if ((window as any).ScrollTrigger) {
        (window as any).ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill())
      }
    }
  }, [])

  const createDownloadParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: 0
    }))
    setParticles(newParticles)

    // Animate particles falling
    newParticles.forEach((particle, i) => {
      setTimeout(() => {
        const el = document.getElementById(`particle-${particle.id}`)
        if (el && (window as any).gsap) {
          (window as any).gsap.to(el, {
            y: 200,
            opacity: 0,
            duration: 2,
            ease: 'power2.in',
            onComplete: () => {
              setParticles(prev => prev.filter(p => p.id !== particle.id))
            }
          })
        }
      }, i * 50)
    })
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Animated Cursor */}
      <div
        ref={cursorRef}
        className="fixed w-5 h-5 pointer-events-none z-50 opacity-0"
        style={{ top: 0, left: 0 }}
      >
        <div className="w-full h-full bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse" />
      </div>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-32">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-foreground text-center text-balance leading-tight">
          Learn Through <span className="text-primary">Your Passion</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center max-w-3xl leading-relaxed">
          Transform any learning material into personalized videos tailored to your interests
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:shadow-xl shadow-lg cursor-pointer text-lg transition-shadow"
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
          className="step-container max-w-2xl mx-auto w-full px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Step 1: Click Start</h2>
            <p className="text-muted-foreground">Begin your learning journey</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-16 flex items-center justify-center min-h-64">
            <button className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full text-lg cursor-pointer hover:shadow-lg transition-shadow">
              Start Learning
            </button>
          </div>
        </div>

        {/* Step 2: Type Text */}
        <div
          ref={step2Ref}
          className="step-container max-w-2xl mx-auto w-full px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Step 2: Upload Your Content</h2>
            <p className="text-muted-foreground">Share the material you want to learn</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-12">
            <div className="typing-container w-full h-32 bg-input border border-border rounded-xl p-4 text-foreground min-h-32 flex items-start">
              <TypingAnimation text="Learn about the history of jazz music and its influence on modern culture..." delay={0} speed={20} />
            </div>
            <div className="mt-6 text-sm text-muted-foreground">✓ 156 characters recognized</div>
          </div>
        </div>

        {/* Step 3: Select Music */}
        <div
          ref={step3Ref}
          className="step-container max-w-2xl mx-auto w-full px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Step 3: Choose Your Interest</h2>
            <p className="text-muted-foreground">Select what excites you</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-12">
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
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    interest.label === 'Music'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="text-3xl mb-2">{interest.icon}</div>
                  <div className="font-semibold">{interest.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Video Generating */}
        <div
          ref={step4Ref}
          className="step-container max-w-2xl mx-auto w-full px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Step 4: Generating Your Video</h2>
            <p className="text-muted-foreground">AI is creating your personalized video...</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-16 flex flex-col items-center justify-center min-h-64">
            <div className="relative w-24 h-24 mb-8">
              <div className="spinner absolute inset-0 border-4 border-transparent border-t-primary border-r-accent rounded-full" />
            </div>
            <p className="text-muted-foreground">Personalizing with Music theme...</p>
          </div>
        </div>

        {/* Step 5: Download */}
        <div
          ref={step5Ref}
          className="step-container max-w-2xl mx-auto w-full px-4 relative"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Step 5: Your Video is Ready!</h2>
            <p className="text-muted-foreground">Download and start learning</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <div className="text-6xl">🎬</div>
            </div>

            <div className="space-y-3 text-center">
              <h3 className="text-xl font-semibold">Jazz Through the Ages</h3>
              <p className="text-muted-foreground text-sm">45 seconds • Music theme • Ready to learn</p>
            </div>

            <div className="flex gap-4 relative">
              <button 
                data-download
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl cursor-pointer hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              <button className="flex-1 px-6 py-3 bg-secondary/20 text-foreground font-medium rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
                Share
              </button>
            </div>

            {/* Download Particles */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                id={`particle-${particle.id}`}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  left: `calc(50% + ${particle.x}px)`,
                  top: '50%',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of learners creating personalized videos and learning through their passions.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-semibold rounded-full hover:shadow-xl shadow-lg cursor-pointer text-lg transition-shadow"
        >
          Get Started Now
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
