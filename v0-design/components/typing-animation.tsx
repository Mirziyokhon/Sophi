import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface TypingAnimationProps {
  text: string
  delay?: number
  speed?: number
}

export function TypingAnimation({ text, delay = 0, speed = 50 }: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let index = 0

    const animate = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        timeout = setTimeout(animate, speed)
      }
    }

    timeout = setTimeout(animate, delay)
    return () => clearTimeout(timeout)
  }, [text, delay, speed])

  return <>{displayedText}</>
}
