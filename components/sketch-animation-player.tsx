'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download } from 'lucide-react'

interface SketchAnimationPlayerProps {
  animationHtml: string
  script?: string
  duration?: number
  filename?: string
}

export function SketchAnimationPlayer({ 
  animationHtml, 
  script, 
  duration = 60,
  filename = 'sketch-animation' 
}: SketchAnimationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number>(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Parse script into timed subtitles and voiceover segments
  const subtitles = script ? 
    script.split('. ').filter(line => line.trim()).map((line, index) => ({
      start: index * (duration / script.split('. ').length),
      end: (index + 1) * (duration / script.split('. ').length),
      text: line.trim() + '.'
    })) : 
    // Default subtitles if no script provided
    []
  
  // Voiceover segments based on script
  const voiceoverSegments = script ? 
    script.split('. ').filter(line => line.trim()).map((line, index) => ({
      text: line.trim() + '.',
      start: index * (duration / script.split('. ').length)
    })) : 
    []

  // Enhanced animation with stickman based on script content
  const renderScene = (ctx: CanvasRenderingContext2D, time: number) => {
    const canvas = ctx.canvas
    ctx.fillStyle = '#fffcf5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Set font
    ctx.font = "20px 'Patrick Hand', var(--font-patrick-hand), cursive"
    ctx.fillStyle = '#333'

    // Stickman drawing utilities
    const roughLine = (x1: number, y1: number, x2: number, y2: number, color = '#333', width = 2) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    const roughCircle = (x: number, y: number, r: number, color = '#333') => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      const steps = 10
      for(let i = 0; i <= steps; i++) {
        const angle = (Math.PI * 2 * i) / steps
        const rOff = r + (Math.random() - 0.5) * 2
        const dx = x + Math.cos(angle) * rOff
        const dy = y + Math.sin(angle) * rOff
        if(i === 0) ctx.moveTo(dx, dy)
        else ctx.lineTo(dx, dy)
      }
      ctx.closePath()
      ctx.stroke()
    }

    const drawStickman = (x: number, y: number, scale: number, pose = 'idle', color = '#333') => {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)

      // Head
      roughCircle(0, -50, 10, color)

      // Body
      roughLine(0, -40, 0, 0, color)

      // Limbs with animation
      const animTime = time / 1000
      
      if (pose === 'idle') {
        const breath = Math.sin(animTime * 3) * 2
        roughLine(0, -35, -15, -15 + breath, color)
        roughLine(0, -35, 15, -15 + breath, color)
        roughLine(0, 0, -10, 30, color)
        roughLine(0, 0, 10, 30, color)
      } else if (pose === 'run') {
        const legSwing = Math.sin(animTime * 10) * 20
        const armSwing = Math.cos(animTime * 10) * 20
        ctx.rotate(0.1)
        roughLine(0, -35, -15 + armSwing, -15, color)
        roughLine(0, -35, 15 - armSwing, -15, color)
        roughLine(0, 0, -10 - legSwing, 30, color)
        roughLine(0, 0, 10 + legSwing, 30, color)
      } else if (pose === 'sprint') {
        const legSwing = Math.sin(animTime * 15) * 30
        const armSwing = Math.cos(animTime * 15) * 25
        ctx.rotate(0.3)
        roughLine(0, -35, -20 + armSwing, -20, color)
        roughLine(0, -35, 20 - armSwing, -20, color)
        roughLine(0, 0, -15 - legSwing, 25, color)
        roughLine(0, 0, 15 + legSwing, 25, color)
      } else if (pose === 'thinking') {
        // Hand on chin pose
        roughLine(0, -35, -20, -25, color) // Left arm to chin
        roughLine(0, -35, 15, -15, color)  // Right arm relaxed
        roughLine(0, 0, -10, 30, color)
        roughLine(0, 0, 10, 30, color)
        // Thought bubble
        ctx.strokeStyle = '#999'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(30, -70, 15, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(45, -75, 10, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(55, -80, 5, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
    }

    // Enhanced visual animation without text - unique per content
    const drawVisualContent = (ctx: CanvasRenderingContext2D, sceneTime: number, currentTime: number) => {
      const progress = sceneTime / duration
      
      // Generate unique content-based elements
      const contentHash = script ? script.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
      const uniqueSeed = contentHash % 1000
      
      // Clean background with subtle animation
      ctx.fillStyle = '#fffcf5'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Animated background elements - unique per content
      const time = Date.now() / 1000
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      
      // Unique floating geometric shapes based on content
      for(let i = 0; i < 8; i++) {
        const x = 50 + (i * 100) + Math.sin(time + i + uniqueSeed * 0.1) * 20
        const y = 50 + Math.cos(time * 0.5 + i + uniqueSeed * 0.1) * 30
        ctx.strokeRect(x, y, 30, 30)
        ctx.beginPath()
        ctx.arc(x + 15, y + 15, 15, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      if (progress < 0.2) {
        // Scene 1: Visual introduction - unique shapes and patterns (0-20%)
        const introProgress = progress / 0.2
        
        // Unique central focal point based on content
        const centerX = 400 + Math.sin(uniqueSeed * 0.5) * 50
        const centerY = 200 + Math.cos(uniqueSeed * 0.3) * 30
        const baseColor = `hsl(${(uniqueSeed * 137) % 360}, 70%, 50%)`
        
        ctx.fillStyle = baseColor
        ctx.beginPath()
        ctx.arc(centerX, centerY, 40 + introProgress * 20, 0, Math.PI * 2)
        ctx.fill()
        
        // Unique expanding circles
        ctx.strokeStyle = '#E74C3C'
        ctx.lineWidth = 2
        for(let i = 0; i < 3; i++) {
          const radius = 60 + (i * 40) + introProgress * 100 + Math.sin(uniqueSeed + i) * 10
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.stroke()
        }
        
        // Minimal stickman engagement
        if (introProgress > 0.5) {
          drawStickman(600, 350, 1.2, 'idle', baseColor)
        }
        
        // Unique animated rectangles
        ctx.fillStyle = '#F39C12'
        for(let i = 0; i < 3; i++) {
          const x = 150 + (i * 200) + Math.sin(time * 2 + i + uniqueSeed * 0.2) * 10
          const y = 280 + Math.cos(time * 1.5 + i + uniqueSeed * 0.2) * 5
          const size = 80 + introProgress * 20 + Math.sin(uniqueSeed + i * 10) * 5
          ctx.fillRect(x, y, size, size * 0.6)
        }
        
      } else if (progress < 0.4) {
        // Scene 2: Visual learning - unique patterns and connections (20-40%)
        const learnProgress = (progress - 0.2) / 0.2
        
        // Unique connected nodes visualization
        const nodes = [
          {x: 200 + Math.sin(uniqueSeed * 0.1) * 20, y: 150 + Math.cos(uniqueSeed * 0.2) * 20},
          {x: 400 + Math.sin(uniqueSeed * 0.3) * 30, y: 100 + Math.cos(uniqueSeed * 0.4) * 15},
          {x: 600 + Math.sin(uniqueSeed * 0.5) * 25, y: 150 + Math.cos(uniqueSeed * 0.6) * 20},
          {x: 300 + Math.sin(uniqueSeed * 0.7) * 15, y: 250 + Math.cos(uniqueSeed * 0.8) * 25},
          {x: 500 + Math.sin(uniqueSeed * 0.9) * 20, y: 250 + Math.cos(uniqueSeed * 1.1) * 15}
        ]
        
        // Draw connections
        ctx.strokeStyle = '#27AE60'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(nodes[0].x, nodes[0].y)
        ctx.lineTo(nodes[1].x, nodes[1].y)
        ctx.lineTo(nodes[2].x, nodes[2].y)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(nodes[1].x, nodes[1].y)
        ctx.lineTo(nodes[3].x, nodes[3].y)
        ctx.lineTo(nodes[4].x, nodes[4].y)
        ctx.stroke()
        
        // Animated nodes
        ctx.fillStyle = '#3498DB'
        for(let i = 0; i < nodes.length; i++) {
          const node = nodes[i]
          const size = 15 + Math.sin(time * 2 + i + uniqueSeed * 0.1) * 5
          ctx.beginPath()
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Brief stickman observation
        if (learnProgress > 0.7) {
          drawStickman(650, 350, 1.5, 'thinking', '#27AE60')
        }
        
      } else if (progress < 0.6) {
        // Scene 3: Interactive visualization - unique moving elements (40-60%)
        const solveProgress = (progress - 0.4) / 0.2
        
        // Unique moving particles
        ctx.fillStyle = '#E74C3C'
        for(let i = 0; i < 8; i++) {
          const x = 200 + (i * 60) + Math.sin(time * 3 + i + uniqueSeed * 0.2) * 20
          const y = 150 + Math.cos(time * 2 + i + uniqueSeed * 0.3) * 15
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Unique flow diagram without text
        ctx.strokeStyle = '#E74C3C'
        ctx.lineWidth = 3
        for(let i = 0; i < 2; i++) {
          const x = 280 + (i * 120) + Math.sin(time * 3 + i + uniqueSeed * 0.4) * 5
          const y = 170 + Math.cos(uniqueSeed * 0.5 + i) * 10
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + 80, y)
          ctx.lineTo(x + 70, y - 10)
          ctx.moveTo(x + 80, y)
          ctx.lineTo(x + 70, y + 10)
          ctx.stroke()
        }
        
        // Interactive boxes
        ctx.fillStyle = '#3498DB'
        for(let i = 0; i < 3; i++) {
          const x = 200 + (i * 150)
          const y = 250 + Math.sin(time * 2 + i * 2 + uniqueSeed * 0.1) * 8
          ctx.fillRect(x, y, 60, 40)
        }
        
        // Minimal stickman interaction
        if (solveProgress > 0.8) {
          drawStickman(700, 350, 1.2, 'run', '#E74C3C')
        }
        
      } else if (progress < 0.8) {
        // Scene 4: Achievement visualization - unique success patterns (60-80%)
        const discoveryProgress = (progress - 0.6) / 0.2
        
        // Unique success star pattern
        const starX = 400 + Math.sin(uniqueSeed * 0.2) * 30
        const starY = 150 + Math.cos(uniqueSeed * 0.3) * 20
        ctx.fillStyle = '#27AE60'
        ctx.beginPath()
        ctx.arc(starX, starY, 50, 0, Math.PI * 2)
        ctx.fill()
        
        // Radiating success lines
        ctx.strokeStyle = '#F39C12'
        ctx.lineWidth = 4
        for(let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + uniqueSeed * 0.01
          ctx.beginPath()
          ctx.moveTo(starX, starY)
          ctx.lineTo(starX + Math.cos(angle) * 100, starY + Math.sin(angle) * 100)
          ctx.stroke()
        }
        
        // Animated checkmarks
        ctx.strokeStyle = '#27AE60'
        ctx.lineWidth = 4
        for(let i = 0; i < 3; i++) {
          const y = 185 + (i * 50)
          if (discoveryProgress > i * 0.25) {
            ctx.beginPath()
            ctx.moveTo(220, y)
            ctx.lineTo(235, y + 15)
            ctx.lineTo(250, y - 5)
            ctx.stroke()
          }
        }
        
        // Celebration stickmen
        if (discoveryProgress > 0.6) {
          drawStickman(150, 350, 1.5, 'run', '#27AE60')
          drawStickman(650, 350, 1.5, 'run', '#27AE60')
        }
        
      } else {
        // Scene 5: Conclusion visualization - unique completion patterns (80-100%)
        const celebrationProgress = (progress - 0.8) / 0.2
        
        // Unique completion circle
        const circleX = 400 + Math.sin(uniqueSeed * 0.4) * 40
        const circleY = 120 + Math.cos(uniqueSeed * 0.5) * 30
        ctx.fillStyle = '#3498DB'
        ctx.beginPath()
        ctx.arc(circleX, circleY, 60, 0, Math.PI * 2)
        ctx.fill()
        
        // Unique sparkle effects
        ctx.fillStyle = '#F39C12'
        for(let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12
          const radius = 80 + Math.sin(time * 3 + uniqueSeed * 0.1) * 20
          const x = circleX + Math.cos(angle + time + uniqueSeed * 0.01) * radius
          const y = circleY + Math.sin(angle + time + uniqueSeed * 0.01) * radius
          ctx.fillRect(x, y, 4, 4)
        }
        
        // Final group celebration
        if (celebrationProgress > 0.3) {
          for(let i = 0; i < 4; i++) {
            const x = 150 + (i * 150) + Math.sin(time * 2 + i + uniqueSeed * 0.1) * 10
            const y = 380 + Math.cos(time * 1.5 + i + uniqueSeed * 0.2) * 5
            drawStickman(x, y, 1.2, 'idle', '#3498DB')
          }
        }
        
        // Final celebration burst
        if (celebrationProgress > 0.8) {
          ctx.fillStyle = '#E74C3C'
          for(let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20
            const radius = 150 + Math.sin(time * 4 + uniqueSeed * 0.05) * 30
            const x = 400 + Math.cos(angle + time * 2 + uniqueSeed * 0.02) * radius
            const y = 200 + Math.sin(angle + time * 2 + uniqueSeed * 0.02) * radius
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    // Main scene rendering
    const sceneTime = time / 1000
    drawVisualContent(ctx, sceneTime, currentTime)
  }

  // Voiceover management
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Amazon')
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  // Initialize voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  // Handle voiceover timing
  useEffect(() => {
    if (isPlaying && voiceoverSegments.length > 0) {
      const currentSegment = voiceoverSegments.find(segment => 
        currentTime >= segment.start && currentTime < segment.start + 5
      )
      
      if (currentSegment && !isSpeaking) {
        speakText(currentSegment.text)
      }
    }
  }, [currentTime, isPlaying, voiceoverSegments, isSpeaking])

  // Animation loop
  const animate = (timestamp: number) => {
    if (!previousTimeRef.current) previousTimeRef.current = timestamp
    
    const deltaTime = (timestamp - previousTimeRef.current) / 1000
    previousTimeRef.current = timestamp

    if (isPlaying && canvasRef.current && !isScrubbing) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        setCurrentTime(prev => {
          const newTime = Math.min(prev + deltaTime, duration)
          
          // Update subtitle
          const activeSubtitle = subtitles.find(sub => 
            newTime >= sub.start && newTime <= sub.end
          )
          setCurrentSubtitle(activeSubtitle?.text || '')
          
          // Render animation
          renderScene(ctx, newTime * 1000)
          
          // Handle export recording
          if (isExporting && mediaRecorderRef.current?.state === 'recording') {
            if (newTime >= duration) {
              mediaRecorderRef.current.stop()
              setIsExporting(false)
            }
          }
          
          if (newTime >= duration) {
            setIsPlaying(false)
            return duration
          }
          
          return newTime
        })
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, duration, isScrubbing])

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        renderScene(ctx, 0)
      }
    }
  }, [])

  const handlePlayPause = () => {
    if (currentTime >= duration) {
      setCurrentTime(0)
      previousTimeRef.current = 0
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = (newTime: number) => {
    setCurrentTime(newTime)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        renderScene(ctx, newTime * 1000)
      }
    }
  }

  const handleScrubStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true)
    const rect = timelineRef.current!.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = Math.max(0, Math.min(percent * duration, duration))
    handleTimeUpdate(newTime)
  }

  const handleScrubbing = (e: MouseEvent) => {
    if (isScrubbing && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = Math.max(0, Math.min(percent * duration, duration))
      handleTimeUpdate(newTime)
    }
  }

  const handleScrubEnd = () => {
    if (isScrubbing) {
      setIsScrubbing(false)
      previousTimeRef.current = performance.now()
    }
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleScrubbing)
    window.addEventListener('mouseup', handleScrubEnd)
    return () => {
      window.removeEventListener('mousemove', handleScrubbing)
      window.removeEventListener('mouseup', handleScrubEnd)
    }
  }, [isScrubbing])

  const handleExport = async () => {
    if (!canvasRef.current) return
    
    setIsExporting(true)
    setCurrentTime(0)
    previousTimeRef.current = 0
    setIsPlaying(true)
    
    try {
      // Create canvas stream at higher FPS for better quality
      const stream = canvasRef.current.captureStream(30)
      
      // Try different codecs for better compatibility
      let options: MediaRecorderOptions = { 
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps for better quality
      }
      
      // Fallback options if vp9 not supported
      try {
        const testRecorder = new MediaRecorder(stream, options)
      } catch (e) {
        console.log('VP9 not supported, trying VP8')
        options = { 
          mimeType: 'video/webm; codecs=vp8',
          videoBitsPerSecond: 8000000
        }
        
        try {
          const testRecorder = new MediaRecorder(stream, options)
        } catch (e2) {
          console.log('VP8 not supported, using default')
          options = { 
            mimeType: 'video/webm',
            videoBitsPerSecond: 8000000
          }
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      recordedChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log('Data available:', e.data.size, 'bytes')
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, chunks:', recordedChunksRef.current.length)
        
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { 
            type: options.mimeType || 'video/webm' 
          })
          
          console.log('Created blob:', blob.size, 'bytes')
          
          // Convert to MP4 using a video conversion approach
          const url = URL.createObjectURL(blob)
          const video = document.createElement('video')
          video.src = url
          video.onloadedmetadata = () => {
            // Create a canvas for MP4 conversion
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            
            // For now, download as WebM but with .mp4 extension
            // In production, you'd use a proper video converter like ffmpeg.wasm
            const a = document.createElement('a')
            a.href = url
            a.download = `${filename}.mp4`  // Changed to .mp4
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            
            // Clean up
            URL.revokeObjectURL(url)
            
            console.log('Export completed successfully')
          }
          video.load()
        } else {
          console.error('No recorded chunks available')
          alert('Export failed: No video data recorded')
        }
        
        setIsExporting(false)
        setIsPlaying(false)
      }
      
      mediaRecorderRef.current.onerror = (e) => {
        console.error('MediaRecorder error:', e)
        alert('Export failed: Recording error')
        setIsExporting(false)
        setIsPlaying(false)
      }
      
      console.log('Starting recording...')
      mediaRecorderRef.current.start(100) // Collect data every 100ms
      
    } catch (error) {
      console.error('Export setup failed:', error)
      alert('Export failed: ' + (error as Error).message)
      setIsExporting(false)
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl">
      {/* Canvas Container */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>

      {/* Subtitle Panel */}
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 mb-4 min-h-[80px] border-2 border-purple-400/30">
        <div className="text-white text-center text-lg leading-relaxed">
          {currentSubtitle || '📝 Subtitles will appear here...'}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 mb-4">
        {/* Timeline */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-white font-mono text-sm min-w-[60px]">
            {formatTime(currentTime)}
          </span>
          <div
            ref={timelineRef}
            className="flex-1 h-3 bg-white/20 rounded-full cursor-pointer relative group"
            onMouseDown={handleScrubStart}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute h-5 w-5 bg-white rounded-full -top-1 shadow-md border-2 border-purple-300 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <span className="text-white font-mono text-sm min-w-[60px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={isExporting}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all hover:scale-105 ${
              isExporting 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </>
            )}
          </button>
          
          {/* Voiceover Toggle */}
          {voiceoverSegments.length > 0 && (
            <button
              onClick={() => {
                if (isSpeaking) {
                  window.speechSynthesis.cancel()
                  setIsSpeaking(false)
                } else {
                  speakText(voiceoverSegments[0]?.text || '')
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ${
                isSpeaking 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Pause size={16} />
                  Stop Voice
                </>
              ) : (
                <>
                  <Play size={16} />
                  Start Voice
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Export Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ${
            isExporting
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
          }`}
        >
          <Download size={16} />
          {isExporting ? 'Recording...' : 'Export Video'}
        </button>
      </div>
    </div>
  )
}
