'use client'

import { SyntheticEvent, useEffect, useState } from 'react'
import { api, VideoData } from '@/lib/api'
import { Download, Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { BackgroundGrid } from './background-grid'
import { Footer } from './footer'

export function Library() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const result = await api.getLibrary()
        setVideos(result.videos.reverse()) // Show newest first
      } catch (error) {
        toast.error('Failed to load library')
      } finally {
        setLoading(false)
      }
    }
    fetchLibrary()
  }, [])

  const handleDownload = (video: VideoData) => {
    const link = document.createElement('a')
    link.href = api.getVideoURL(video.filename)
    link.download = video.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started')
  }

  const handlePreviewEnded = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = event.currentTarget
    video.pause()
    video.currentTime = 0
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(
      timestamp.slice(0, 4) + '-' + 
      timestamp.slice(4, 6) + '-' + 
      timestamp.slice(6, 8)
    )
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-[#050A18] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <BackgroundGrid />
      <div className="relative z-10 pt-32 pb-20">
      {/* Library Header */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-foreground">Your Video Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All your created personalized videos in one place. Access, manage, and share your learning videos anytime.
          </p>
          <p className="text-lg text-primary font-semibold mt-4">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-muted-foreground mb-6">
              No videos yet. Create your first personalized video to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => {
              const videoKey = video.video_id || `video-${i}`
              return (
                <motion.div
                  key={videoKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                  <video
                    src={api.getVideoURL(video.filename)}
                    className="w-full h-full object-cover"
                    muted
                    onEnded={handlePreviewEnded}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{video.interest}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {video.duration}s • {video.word_count} words • {formatDate(video.timestamp)}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={`/videos/${video.filename}`}
                      className="flex-1 px-3 py-2 bg-primary/20 text-primary text-sm rounded-lg hover:bg-primary/30 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Watch
                    </a>
                    <button
                      onClick={() => handleDownload(video)}
                      className="flex-1 px-3 py-2 bg-secondary/20 text-sm rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
              )
            })}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  )
}
