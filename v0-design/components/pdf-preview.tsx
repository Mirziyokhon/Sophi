'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Eye, FileText, Loader2 } from 'lucide-react'
import { PDFPreview, PDFInfo, api } from '../lib/api'

interface PDFPreviewComponentProps {
  file: File
  onPagesSelected: (pages: string) => void
  onExtractComplete: (result: any) => void
}

export function PDFPreviewComponent({ file, onPagesSelected, onExtractComplete }: PDFPreviewComponentProps) {
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null)
  const [previews, setPreviews] = useState<PDFPreview[]>([])
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [showPreviews, setShowPreviews] = useState(false)

  const loadPDFInfo = async () => {
    setLoading(true)
    try {
      const pdfInfoResponse = await api.getPDFInfo(file)
      setPdfInfo(pdfInfoResponse.pdf_info)
      setPreviews(pdfInfoResponse.previews)
      setSelectedPages(Array.from({ length: pdfInfoResponse.pdf_info.page_count }, (_, i) => i + 1))
      setShowPreviews(true)
    } catch (error) {
      console.error('Failed to load PDF info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageToggle = (pageNumber: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber)
      } else {
        return [...prev, pageNumber]
      }
    })
  }

  const handleSelectAll = () => {
    if (pdfInfo) {
      setSelectedPages(Array.from({ length: pdfInfo.page_count }, (_, i) => i + 1))
    }
  }

  const handleSelectNone = () => {
    setSelectedPages([])
  }

  const handleExtract = async () => {
    if (selectedPages.length === 0) return
    
    setExtracting(true)
    try {
      const pagesParam = selectedPages.length === pdfInfo?.page_count 
        ? 'all' 
        : selectedPages.join(',')
      
      onPagesSelected(pagesParam)
      
      const result = await api.extractPDF(file, pagesParam)
      onExtractComplete(result)
      
    } catch (error) {
      console.error('Failed to extract:', error)
      setExtracting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* PDF Info */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{file.name}</h3>
          </div>
          <button
            onClick={loadPDFInfo}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPreviews ? 'Hide' : 'Show'} Preview
          </button>
        </div>

        {pdfInfo && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pages:</span>
              <span className="ml-2 font-medium">{pdfInfo.page_count}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Title:</span>
              <span className="ml-2 font-medium truncate">{pdfInfo.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Author:</span>
              <span className="ml-2 font-medium truncate">{pdfInfo.author}</span>
            </div>
          </div>
        )}
      </div>

      {/* Page Selection */}
      {pdfInfo && showPreviews && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Select Pages to Extract</h4>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleSelectNone}
                className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: pdfInfo.page_count }, (_, i) => i + 1).map(pageNum => {
              const preview = previews.find(p => p.page_number === pageNum)
              const aspectRatio = preview ? preview.width / preview.height : 3 / 4
              const isLandscape = aspectRatio > 1
              
              return (
                <motion.div
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => handlePageToggle(pageNum)}
                    style={{ aspectRatio: aspectRatio.toString() }}
                    className={`relative w-full rounded-lg border-2 transition-all overflow-hidden ${
                      selectedPages.includes(pageNum)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Page Preview Image */}
                    {preview && preview.image_base64 && !preview.error ? (
                      <img 
                        src={`data:image/png;base64,${preview.image_base64}`}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Page Number */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {pageNum}
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedPages.includes(pageNum) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    
                    {/* Page Label */}
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-xs bg-background/80 px-2 py-1 rounded backdrop-blur-sm">
                        Page {pageNum}
                      </span>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Extract Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleExtract}
              disabled={selectedPages.length === 0 || extracting}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  Extract {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
