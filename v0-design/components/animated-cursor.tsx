import { motion } from 'framer-motion'

interface AnimatedCursorProps {
  targetX: number
  targetY: number
  delay?: number
  duration?: number
  onClick?: () => void
}

export function AnimatedCursor({
  targetX,
  targetY,
  delay = 0,
  duration = 1.5,
  onClick,
}: AnimatedCursorProps) {
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: targetX,
        y: targetY,
        opacity: 1,
      }}
      transition={{
        delay,
        duration,
        ease: 'easeInOut',
      }}
      className="fixed pointer-events-none z-40"
    >
      <motion.div
        animate={{ scale: 1 }}
        transition={{
          delay: delay + duration,
          duration: 0.4,
        }}
      >
        {/* Cursor icon with shadow */}
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none"
          className="drop-shadow-lg"
        >
          {/* Cursor arrow with gradient fill */}
          <defs>
            <linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            d="M4 4L4 20L12 12L19 18.5L20.5 17L13 11L20 4H4Z"
            fill="url(#cursorGradient)"
            stroke="rgba(10, 17, 40, 0.3)"
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{
          scale: [1, 0.85, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          delay: delay + duration + 0.1,
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className="absolute -inset-2"
      />

      {/* Click ripple effect */}
      <motion.div
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: [1, 1.5],
          opacity: [0.6, 0],
        }}
        transition={{
          delay: delay + duration + 0.15,
          duration: 0.4,
          ease: 'easeOut',
        }}
        className="absolute inset-0 w-6 h-6 bg-primary rounded-full"
      />
    </motion.div>
  )
}
