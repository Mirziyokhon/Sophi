'use client'

import { motion } from 'framer-motion'
import { BackgroundGrid } from './background-grid'

interface LandingProps {
  onStart: () => void
}

export function LandingNew({ onStart }: LandingProps) {
  return (
    <div className="min-h-[calc(100vh-200px)] pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Transform Learning with
            <span className="text-gradient block">AI-Powered Videos</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Convert your learning materials into engaging animated videos using advanced AI technology. 
            Perfect for educational content, presentations, and knowledge sharing.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={onStart}
              className="px-8 py-3 bg-[#cfaa32] text-[#2A0813] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#cfaa32]/25 transition-all transform hover:scale-105"
            >
              Start Creating
            </button>
            <button className="px-8 py-3 border border-[#F4EEE9]/20 text-[#F4EEE9] rounded-lg font-semibold hover:bg-[#F4EEE9]/10 transition-colors">
              View Demo
            </button>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-[#F4EEE9]/5 backdrop-blur-sm border border-[#F4EEE9]/10 rounded-xl p-6 hover:bg-[#F4EEE9]/10 transition-colors"
          >
            <div className="w-12 h-12 bg-[#cfaa32]/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#cfaa32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F4EEE9]">Smart Processing</h3>
            <p className="text-[#F4EEE9]/70">AI analyzes your content and creates optimized video sequences</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-[#F4EEE9]/5 backdrop-blur-sm border border-[#F4EEE9]/10 rounded-xl p-6 hover:bg-[#F4EEE9]/10 transition-colors"
          >
            <div className="w-12 h-12 bg-[#cfaa32]/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#cfaa32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F4EEE9]">Rich Animations</h3>
            <p className="text-[#F4EEE9]/70">Professional sketch animations and visual effects</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-[#F4EEE9]/5 backdrop-blur-sm border border-[#F4EEE9]/10 rounded-xl p-6 hover:bg-[#F4EEE9]/10 transition-colors"
          >
            <div className="w-12 h-12 bg-[#cfaa32]/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#cfaa32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F4EEE9]">Easy Customization</h3>
            <p className="text-[#F4EEE9]/70">Personalize styles, pacing, and output formats</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="max-w-4xl mx-auto text-center py-20 px-6"
      >
        <h2 className="text-5xl font-bold mb-6 text-[#F4EEE9]">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-[#F4EEE9]/70 mb-8 max-w-2xl mx-auto">
          Join thousands of learners creating personalized videos and learning through their passions.
        </p>
        <button
          onClick={onStart}
          className="px-10 py-4 bg-[#cfaa32] text-[#2A0813] rounded-full font-bold text-lg hover:shadow-lg hover:shadow-[#cfaa32]/25 transition-all flex items-center gap-2 mx-auto transform hover:-translate-y-1"
        >
          Start Creating Now
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </motion.div>

      <style jsx>{`
        .text-gradient {
          background: linear-gradient(135deg, #cfaa32 0%, #F4EEE9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}
