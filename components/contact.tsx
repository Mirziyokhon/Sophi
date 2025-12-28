'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Send, Phone, MapPin, Clock } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'support@sophi.com',
      description: 'Get help with your account or technical issues'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-5PM EST'
    },
    {
      icon: MapPin,
      label: 'Office',
      value: 'San Francisco, CA',
      description: '1234 Education Street'
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: 'Within 24 hours',
      description: 'We typically respond within one business day'
    }
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="text-[var(--foreground)]/60">We're here to help and answer any questions you might have.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="font-medium">{info.label}</p>
                      <p className="text-sm font-semibold">{info.value}</p>
                      <p className="text-xs text-[var(--foreground)]/60">{info.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm hover:text-[var(--accent)] transition-colors">
                  How do I reset my password?
                </summary>
                <p className="mt-2 text-sm text-[var(--foreground)]/60">
                  Click on "Forgot Password" on the login page and follow the instructions sent to your email.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm hover:text-[var(--accent)] transition-colors">
                  What file formats are supported?
                </summary>
                <p className="mt-2 text-sm text-[var(--foreground)]/60">
                  We support PDF, images (JPG, PNG), and text files. You can also paste text directly or provide URLs.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm hover:text-[var(--accent)] transition-colors">
                  How long does video generation take?
                </summary>
                <p className="mt-2 text-sm text-[var(--foreground)]/60">
                  Video generation typically takes 2-5 minutes depending on the content length and animation style.
                </p>
              </details>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-[var(--secondary)]/50 border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-[var(--foreground)]/60 mb-6">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-lg text-[var(--accent-foreground)] font-medium transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all resize-none"
                    placeholder="Tell us more about your question or issue..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent)]/80 rounded-lg text-[var(--accent-foreground)] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
