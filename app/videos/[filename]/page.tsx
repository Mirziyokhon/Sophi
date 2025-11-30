'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Share2, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { api, VideoData } from '@/lib/api'
import { toast } from 'sonner'

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const filename = params.filename as string
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const result = await api.getLibrary()
        const foundVideo = result.videos.find(v => v.filename === filename)
        if (foundVideo) {
          setVideo(foundVideo)
        } else {
          toast.error('Video not found')
        }
      } catch (error) {
        toast.error('Failed to load video')
      } finally {
        setLoading(false)
      }
    }
    fetchVideo()
  }, [filename])

  const handleDownload = () => {
    if (!video) return
    const link = document.createElement('a')
    link.href = api.getVideoURL(video.filename)
    link.download = video.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied!')
  }

  const handleBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Video not found</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const videoUrl = api.getVideoURL(video.filename)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Library</span>
        </button>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative w-full aspect-video bg-card border border-border rounded-2xl overflow-hidden">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>

        {/* Video Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">{video.interest}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
            <span>Duration: {video.duration}s</span>
            <span>•</span>
            <span>Words: {video.word_count}</span>
            <span>•</span>
            <span>Created: {new Date(
              video.timestamp.slice(0, 4) + '-' + 
              video.timestamp.slice(4, 6) + '-' + 
              video.timestamp.slice(6, 8)
            ).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-secondary/20 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-primary" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`
                window.open(shareUrl, '_blank')
              }}
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-secondary/20 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
