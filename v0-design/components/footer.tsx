'use client'

import { motion } from 'framer-motion'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-[#050A18] border-t border-white/10 relative z-20 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sophi
            </h3>
            <p className="text-muted-foreground text-sm">
              Transform dense content into personalized animated videos. Learn through what you love.
            </p>
          </div>

          {/* Empty div for spacing */}
          <div></div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:contact@sophi.com"
                  className="text-muted-foreground hover:text-primary transition-smooth cursor-pointer"
                >
                  contact@sophi.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@sophi.com"
                  className="text-muted-foreground hover:text-primary transition-smooth cursor-pointer"
                >
                  support@sophi.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>© {currentYear} Sophi. All rights reserved.</p>
          <p className="mt-2">Crafted with care for better learning.</p>
        </div>
      </div>
    </motion.footer>
  )
}