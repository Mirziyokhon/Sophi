'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2, Download, FileAudio, FileImage, FileText } from 'lucide-react'

interface CustomVideoPlayerProps {
  videoUrl: string
  subtitleUrl?: string
  filename: string
  onDownload?: () => void
}

export function CustomVideoPlayer({ videoUrl, subtitleUrl, filename, onDownload }: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  const [subtitles, setSubtitles] = useState<Array<{ start: number; end: number; text: string }>>([])
  const [videoError, setVideoError] = useState<string | null>(null)
  
  const [isScrubbing, setIsScrubbing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Debug video URL
  useEffect(() => {
    console.log('Video URL:', videoUrl)
    console.log('Subtitle URL:', subtitleUrl)
  }, [videoUrl, subtitleUrl])

  // Load subtitles
  useEffect(() => {
    if (subtitleUrl) {
      fetch(subtitleUrl)
        .then(response => response.text())
        .then(text => parseSRT(text))
        .catch(console.error)
    }
  }, [subtitleUrl])

  // Parse SRT subtitles
  const parseSRT = (srtText: string) => {
    const entries = []
    const blocks = srtText.trim().split('\n\n')
    
    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length >= 3) {
        const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/)
        
        if (timeMatch) {
          const startTime = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4])
          const endTime = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8])
          const text = lines.slice(2).join(' ').trim()
          
          entries.push({ start: startTime, end: endTime, text })
        }
      }
    }
    setSubtitles(entries)
  }

  const parseTime = (hours: string, minutes: string, seconds: string, milliseconds: string) => {
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000
  }

  // Update subtitles
  useEffect(() => {
    if (!subtitles.length) return
    
    const current = subtitles.find(entry => currentTime >= entry.start && currentTime <= entry.end)
    setCurrentSubtitle(current?.text || '')
  }, [currentTime, subtitles])

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setVideoError(null)
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    let errorMessage = 'Unknown error'
    
    switch (video.error?.code) {
      case 1:
        errorMessage = 'Video loading aborted'
        break
      case 2:
        errorMessage = 'Network error'
        break
      case 3:
        errorMessage = 'Video decoding failed'
        break
      case 4:
        errorMessage = 'Video format not supported'
        break
    }
    
    console.error('Video error:', errorMessage, video.error)
    setVideoError(errorMessage)
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdateFromScrub = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleScrubStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true)
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration
      handleTimeUpdateFromScrub(newTime)
    }
  }

  const handleScrubbing = (e: MouseEvent) => {
    if (isScrubbing && progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration
      handleTimeUpdateFromScrub(newTime)
    }
  }

  const handleScrubEnd = () => {
    setIsScrubbing(false)
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleScrubbing)
    window.addEventListener('mouseup', handleScrubEnd)
    return () => {
      window.removeEventListener('mousemove', handleScrubbing)
      window.removeEventListener('mouseup', handleScrubEnd)
    }
  }, [isScrubbing])

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(e.target.value)
    setPlaybackRate(newRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownloadVideo = () => {
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = filename
    a.click()
  }

  const handleDownloadSubtitles = () => {
    if (subtitleUrl) {
      const a = document.createElement('a')
      a.href = subtitleUrl
      a.download = filename.replace('.mp4', '.srt')
      a.click()
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl">
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video">
        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 text-white p-4">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">❌ Video Error</p>
              <p className="text-sm opacity-80">{videoError}</p>
              <p className="text-xs opacity-60 mt-2">URL: {videoUrl}</p>
              <button 
                onClick={() => window.open(videoUrl, '_blank')}
                className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Try Opening Directly
              </button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleVideoError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={false}
            preload="metadata"
          />
        )}
      </div>

      {/* Controls Panel */}
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 mb-4">
        {/* Timeline */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-white font-mono text-sm min-w-[60px]">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressBarRef}
            className="flex-1 h-2 bg-white/30 rounded-full cursor-pointer relative"
            onMouseDown={handleScrubStart}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div
                className="absolute h-4 w-4 bg-white rounded-full -top-1 shadow-md border-2 border-purple-300 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          {/* Skip Buttons */}
          <button
            onClick={() => handleSkip(-10)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            <SkipBack size={16} />
            -10s
          </button>

          <button
            onClick={() => handleSkip(10)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            <SkipForward size={16} />
            +10s
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-white" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {/* Speed Control */}
          <select
            value={playbackRate}
            onChange={handleSpeedChange}
            className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 focus:outline-none"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>

      {/* Subtitle Panel */}
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 mb-4 min-h-[100px] max-h-[200px] overflow-y-auto border-2 border-purple-400/30">
        <div className="text-white text-center text-lg leading-relaxed">
          {currentSubtitle || '📝 Subtitles will appear here...'}
        </div>
      </div>

      {/* Export Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleDownloadVideo}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
        >
          <Download size={16} />
          Download MP4
        </button>

        <button
          onClick={() => alert('Audio extraction coming soon! 🎵')}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
        >
          <FileAudio size={16} />
          Extract Audio
        </button>

        <button
          onClick={() => alert('GIF creation coming soon! 🖼️')}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
        >
          <FileImage size={16} />
          Create GIF
        </button>

        {subtitleUrl && (
          <button
            onClick={handleDownloadSubtitles}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            <FileText size={16} />
            Download Subtitles
          </button>
        )}
      </div>
    </div>
  )
}
