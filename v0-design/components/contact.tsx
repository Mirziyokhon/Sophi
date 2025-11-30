'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { BackgroundGrid } from './background-grid'
import { Footer } from './footer'

export function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setFormState({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-[#050A18] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative flex flex-col">
      <BackgroundGrid />
      <div className="relative z-10 flex flex-col flex-grow min-h-screen">
        <div className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <a href="mailto:hello@rusaldo.com" className="text-primary hover:underline cursor-pointer">
                  hello@rusaldo.com
                </a>
                <p className="text-gray-400 text-sm mt-1">For general inquiries</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Support</h3>
                <a href="mailto:support@rusaldo.com" className="text-primary hover:underline cursor-pointer">
                  support@rusaldo.com
                </a>
                <p className="text-gray-400 text-sm mt-1">We'll help you get unstuck</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Business</h3>
                <a href="mailto:business@rusaldo.com" className="text-primary hover:underline cursor-pointer">
                  business@rusaldo.com
                </a>
                <p className="text-gray-400 text-sm mt-1">For partnerships and sales</p>
              </div>

              <div className="bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-lg p-6 mt-8">
                <h3 className="font-semibold mb-3">Follow Us</h3>
                <div className="flex gap-4">
                  {['Twitter', 'LinkedIn', 'Discord'].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-gray-400 hover:text-primary transition-colors cursor-pointer text-sm"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6 bg-[#0F172A]/50 border border-white/10 backdrop-blur-sm rounded-lg p-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border-white/10 text-white rounded-lg focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border-white/10 text-white rounded-lg focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border-white/10 text-white rounded-lg focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 bg-white/5 border-white/10 text-white rounded-lg focus:outline-none focus:border-primary transition-colors resize-none cursor-pointer"
                    placeholder="Your message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {submitted ? 'Message Sent!' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}
