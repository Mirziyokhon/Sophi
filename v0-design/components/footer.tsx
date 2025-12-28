'use client'

import { motion } from 'framer-motion'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      id="contact"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-[#1a0509] border-t border-[#F4EEE9]/10 relative z-20 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-2 text-[#F4EEE9] font-serif">
              Sophi
            </h3>
            <p className="text-[#F4EEE9]/60 text-sm">
              Transform dense content into personalized animated videos. Learn through what you love.
            </p>
          </div>

          {/* Empty div for spacing */}
          <div></div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[#F4EEE9]">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:contact@sophi.com"
                  className="text-[#F4EEE9]/60 hover:text-[#cfaa32] transition-colors cursor-pointer"
                >
                  contact@sophi.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@sophi.com"
                  className="text-[#F4EEE9]/60 hover:text-[#cfaa32] transition-colors cursor-pointer"
                >
                  support@sophi.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#F4EEE9]/10 pt-8 text-center text-[#F4EEE9]/40 text-sm">
          <p>© {currentYear} Sophi. All rights reserved.</p>
          <p className="mt-2">Crafted with care for better learning.</p>
        </div>
      </div>
    </motion.footer>
  )
}