import { motion, type Variants } from 'motion/react'
import { Fragment, type ReactNode } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

/**
 * Content stands up into place, like a screen lifting from a desk, the first
 * time it scrolls into view. No filter here on purpose: a filtered ancestor
 * becomes a backdrop root and would stop the glass panels inside from blurring
 * the particles behind them.
 */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1200, transformOrigin: '50% 100%' }}
      initial={{ opacity: 0, y, rotateX: 14, z: -60 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

const heading: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.055 } },
}

// Each word flips up on its baseline, one after another.
const word: Variants = {
  hidden: { opacity: 0, rotateX: -80, y: '0.35em' },
  shown: { opacity: 1, rotateX: 0, y: '0em', transition: { duration: 0.95, ease } },
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
    <div className={className}>
      <motion.h2
        id={id}
        className="t-h2 heading-3d"
        variants={heading}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      >
        {title.split(' ').map((text, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <motion.span className="heading-word" variants={word}>
              {text}
            </motion.span>
          </Fragment>
        ))}
      </motion.h2>
      {intro && (
        <Reveal delay={0.2}>
          <p className="t-lead mt-5 max-w-2xl">{intro}</p>
        </Reveal>
      )}
    </div>
  )
}
