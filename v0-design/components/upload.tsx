'use client'

import { UploadIcon, FileText, LinkIcon, Loader2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'
import { api } from '../lib/api'
import { toast } from 'sonner'

interface UploadProps {
  onNext: () => void
}

type TabType = 'file' | 'link' | 'text'

export function Upload({ onNext }: UploadProps) {
  const { setExtractedContent } = useApp()
  const [tab, setTab] = useState<TabType>('file')
  const [uploaded, setUploaded] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setText(content)
    const words = content.trim().split(/\s+/).filter(w => w.length > 0)
    setWordCount(words.length)
    setUploaded(content.trim().length > 0)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setFileName(file.name)
    
    try {
      let result
      if (file.type === 'application/pdf') {
        result = await api.extractPDF(file)
        toast.success(`Extracted ${result.word_count} words from PDF`)
      } else if (file.type.startsWith('image/')) {
        result = await api.extractImage(file)
        toast.success(`Extracted ${result.word_count} words from image`)
      } else {
        throw new Error('Unsupported file type')
      }
      
      setExtractedContent(result)
      setWordCount(result.word_count)
      setUploaded(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process file')
      setUploaded(false)
    } finally {
      setLoading(false)
    }
  }

  const handleURLExtract = async () => {
    if (!url.trim()) return

    setLoading(true)
    try {
      const result = await api.extractURL(url)
      setExtractedContent(result)
      setWordCount(result.word_count)
      setUploaded(true)
      toast.success(`Extracted ${result.word_count} words from URL`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to extract URL')
      setUploaded(false)
    } finally {
      setLoading(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!text.trim()) return

    setLoading(true)
    try {
      const result = await api.extractText(text)
      setExtractedContent(result)
      setWordCount(result.word_count)
      setUploaded(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process text')
      setUploaded(false)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (tab === 'text' && text.trim()) {
      await handleTextSubmit()
    }
    if (uploaded) {
      onNext()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 pt-32"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">Upload Content</h1>
          <p className="text-lg text-muted-foreground">Choose how you'd like to share your learning material</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-2 mb-8 bg-card rounded-lg p-1 border border-border"
        >
          {[
            { id: 'file' as TabType, label: 'PDF', icon: FileText },
            { id: 'link' as TabType, label: 'Link', icon: LinkIcon },
            { id: 'text' as TabType, label: 'Paste Text', icon: UploadIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-smooth font-medium ${
                tab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          key={tab}
        >
          {tab === 'file' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-2xl p-12 text-center transition-smooth cursor-pointer hover:bg-primary/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  {loading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <UploadIcon className="w-8 h-8 text-primary" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {fileName || 'Drag and drop your PDF or Image'}
              </h3>
              <p className="text-muted-foreground mb-4">Max 3,000 words</p>
              {uploaded && (
                <p className="text-primary font-medium">✓ {wordCount} words extracted</p>
              )}
              {!uploaded && (
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover-lift">
                  Choose File
                </button>
              )}
            </div>
          )}

          {tab === 'link' && (
            <div className="space-y-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleURLExtract()}
                placeholder="Paste article or lecture link..."
                className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Enter a URL to any article or lecture</p>
                <button
                  onClick={handleURLExtract}
                  disabled={!url.trim() || loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    'Extract'
                  )}
                </button>
              </div>
              {uploaded && (
                <p className="text-primary font-medium">✓ {wordCount} words extracted</p>
              )}
            </div>
          )}

          {tab === 'text' && (
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your text here... (max 3,000 words)"
                className="w-full h-48 px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth text-foreground placeholder:text-muted-foreground resize-none"
              />
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${wordCount > 3000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {wordCount} / 3,000 words
                </span>
                {uploaded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-primary font-medium"
                  >
                    ✓ Ready
                  </motion.span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Next Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={handleNext}
          disabled={!uploaded || loading}
          className="w-full mt-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Next'
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
