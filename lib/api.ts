/**
 * API Client for Sophi Backend
 * Connects Next.js frontend to FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ExtractResponse {
  success: boolean
  text: string
  word_count: number
  content_type: string
}

export interface PDFPreview {
  page_number: number
  image_base64: string
  width: number
  height: number
  error?: boolean
}

export interface PDFInfo {
  page_count: number
  title: string
  author: string
}

export interface PDFInfoResponse {
  success: boolean
  pdf_info: PDFInfo
  previews: PDFPreview[]
  preview_count: number
}

export interface VideoGenerationRequest {
  extracted_text: string
  interest_description: string
  duration_seconds: number
}

export interface VideoData {
  video_id: string
  filename: string
  video_url: string
  timestamp: string
  duration: number
  interest: string
  word_count: number
  script?: string
  summary?: string
  key_points?: string[]
  takeaway?: string
  media_type?: 'html' | 'video'
  animation_html?: string
  subtitle_path?: string
  subtitle_url?: string
}

export interface VideoGenerationResponse {
  success: boolean
  video_data: VideoData
  processed_content: {
    summary: string
    key_points: string[]
    takeaway: string
    script: string
  }
}

export interface DurationRecommendationResponse {
  success: boolean
  recommendation: {
    recommended_duration: number
    recommended_label: string
    word_count: number
    complexity_score: number
    reasons: string[]
    speaking_rate_estimate: number
    all_options: number[]
  }
  quality_scores: Array<{
    duration: number
    quality_score: number
    rating: string
    color: string
    feedback: string
    is_recommended: boolean
  }>
}

export interface LibraryResponse {
  success: boolean
  videos: VideoData[]
  total_count: number
}

export interface HealthResponse {
  status: string
  openai_configured: boolean
  gemini_configured: boolean
  elevenlabs_configured: boolean
  stability_configured: boolean
}

export interface SettingsResponse {
  success: boolean
  api_keys: {
    openai: boolean
    gemini: boolean
    elevenlabs: boolean
    stability: boolean
  }
  preset_interests: string[]
  video_durations: Record<string, number>
  max_content_length: number
  stats: {
    total_videos: number
  }
}

class RusaldoAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseURL}/api/health`)
    if (!response.ok) throw new Error('Health check failed')
    return response.json()
  }

  /**
   * Get PDF info and previews
   */
  async getPDFInfo(file: File): Promise<PDFInfoResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/api/pdf/info`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get PDF info')
    }

    return response.json()
  }

  /**
   * Extract text from PDF with page selection
   */
  async extractPDF(file: File, pages: string | number = 'all'): Promise<ExtractResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('pages', pages.toString())

    const response = await fetch(`${this.baseURL}/api/extract/pdf`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to extract PDF')
    }

    return response.json()
  }

  /**
   * Extract text from image
   */
  async extractImage(file: File): Promise<ExtractResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/api/extract/image`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to extract image')
    }

    return response.json()
  }

  /**
   * Extract text from URL
   */
  async extractURL(url: string): Promise<ExtractResponse> {
    const formData = new FormData()
    formData.append('url', url)

    const response = await fetch(`${this.baseURL}/api/extract/url`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to extract URL')
    }

    return response.json()
  }

  /**
   * Process plain text
   */
  async extractText(text: string): Promise<ExtractResponse> {
    const response = await fetch(`${this.baseURL}/api/extract/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, content_type: 'text' }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to process text')
    }

    return response.json()
  }

  /**
   * Generate personalized video
   */
  async generateVideo(data: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutes timeout

    try {
      const response = await fetch(`${this.baseURL}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to generate video')
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Video generation timed out. Please try again with shorter content or duration.')
      }
      throw error
    }
  }

  /**
   * Get intelligent duration recommendation
   */
  async getDurationRecommendation(text: string): Promise<DurationRecommendationResponse> {
    const response = await fetch(`${this.baseURL}/api/recommend-duration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get duration recommendation')
    }

    return response.json()
  }

  /**
   * Generate personalized MP4 video with subtitles
   */
  async generateMP4Video(data: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutes timeout

    try {
      const response = await fetch(`${this.baseURL}/api/generate-mp4-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to generate MP4 video')
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Video generation timed out. Please try again with shorter content or duration.')
      }
      throw error
    }
  }

  /**
   * Get video library
   */
  async getLibrary(): Promise<LibraryResponse> {
    const response = await fetch(`${this.baseURL}/api/library`)
    if (!response.ok) throw new Error('Failed to fetch library')
    return response.json()
  }

  /**
   * Get specific video
   */
  async getVideo(videoId: string): Promise<{ success: boolean; video: VideoData }> {
    const response = await fetch(`${this.baseURL}/api/video/${videoId}`)
    if (!response.ok) throw new Error('Video not found')
    return response.json()
  }

  /**
   * Clear library
   */
  async clearLibrary(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/api/library/clear`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to clear library')
    return response.json()
  }

  /**
   * Get settings
   */
  async getSettings(): Promise<SettingsResponse> {
    const response = await fetch(`${this.baseURL}/api/settings`)
    if (!response.ok) throw new Error('Failed to fetch settings')
    return response.json()
  }

  /**
   * Get video URL
   */
  getVideoURL(filename: string): string {
    return `${this.baseURL}/videos/${filename}`
  }
}

// Export singleton instance
export const api = new RusaldoAPI()
export default api
