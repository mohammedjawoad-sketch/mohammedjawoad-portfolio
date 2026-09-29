import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

/**
 * Content settles into place the first time it scrolls into view.
 * No filter here on purpose: a filtered ancestor becomes a backdrop root and
 * would stop the glass panels inside from blurring the particles behind them.
 */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({
  title,
  intro,
  className,
  id,
}: {
  title: string
  intro?: string
  className?: string
  id?: string
}) {
  return (
    <Reveal className={className}>
      <h2 id={id} className="t-h2">
        {title}
      </h2>
      {intro && <p className="t-lead mt-5 max-w-2xl">{intro}</p>}
    </Reveal>
  )
}
