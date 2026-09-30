import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { usePointerDepth } from '../depth'
import { useI18n } from '../i18n'
import { usePrefersReducedMotion, vars } from '../lib'
import { site } from '../site.config'
import { DownloadIcon } from './Icons'

export function Hero() {
  const { t, lang } = useI18n()
  const hero = t.hero
  const sectionRef = useRef<HTMLElement>(null)
  const depthRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  let index = 0

  // The copy sits in layers at different depths that turn toward the pointer,
  // and the whole block tips back into the distance as the page scrolls on.
  usePointerDepth(depthRef)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 18])
  const z = useTransform(scrollYProgress, [0, 1], [0, -260])
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.05])
  const exit = reduced ? undefined : { rotateX, z, y, opacity, transformPerspective: 1200, transformOrigin: '50% 0%' }

  return (
    <section ref={sectionRef} id="top" data-formation="0" className="relative flex min-h-[100svh] items-center">
      <div className="container-x pb-28 pt-32 md:pt-36">
        <motion.div style={exit}>
          <div ref={depthRef} className="hero-depth relative max-w-[47rem]">
            {/* Soft shade behind the copy so it stays legible over the particles. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-5 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,rgb(var(--ink-rgb)/0.5),transparent)] lg:hidden"
            />

            <p
              className="depth-layer rise inline-flex items-center gap-3 text-[0.9rem] text-mist"
              style={vars({ '--d': '120ms', '--depth': 10 })}
            >
              <span className="status-dot" aria-hidden="true" />
              {hero.status}
            </p>

            <h1
              className="depth-layer t-display mt-7 text-[clamp(2.55rem,0.9rem+7.2vw,6.6rem)]"
              style={vars({ '--depth': 26 })}
              key={lang}
            >
              <span className="sr-only">{hero.nameLines.join(' ')}</span>
              <span aria-hidden="true">
                {hero.nameLines.map((line) => (
                  <span key={line} className="block whitespace-nowrap">
                    {lang === 'ar'
                      ? line.split(' ').map((word, i, words) => (
                          <span key={i} className="name-word" style={vars({ '--i': index++ })}>
                            {word}
                            {i < words.length - 1 ? ' ' : ''}
                          </span>
                        ))
                      : Array.from(line).map((char, i) => (
                          <span key={i} className="name-letter" style={vars({ '--i': index++ })}>
                            {char === ' ' ? ' ' : char}
                          </span>
                        ))}
                  </span>
                ))}
              </span>
            </h1>

            <p
              className="depth-layer rise mt-4 text-[1.05rem] text-mist/80"
              lang={lang === 'en' ? 'ar' : 'en'}
              style={vars({ '--d': '900ms', '--depth': 16 })}
            >
              {hero.altName}
            </p>

            <p className="depth-layer rise t-h3 mt-8 text-bone" style={vars({ '--d': '1000ms', '--depth': 20 })}>
              {hero.role}
            </p>
            <p className="depth-layer rise t-lead mt-4 max-w-[37rem]" style={vars({ '--d': '1120ms', '--depth': 12 })}>
              {hero.pitch}
            </p>

            <div
              className="depth-layer og-hide rise mt-9 flex flex-wrap gap-3"
              style={vars({ '--d': '1250ms', '--depth': 22 })}
            >
              <a href={site.cvFile} download className="btn btn-primary">
                <DownloadIcon className="size-5" />
                {hero.ctaPrimary}
              </a>
              <a href="#projects" className="btn btn-ghost">
                {hero.ctaSecondary}
              </a>
            </div>

            <ul
              className="depth-layer og-hide rise mt-10 flex flex-wrap gap-2"
              style={vars({ '--d': '1400ms', '--depth': 30 })}
            >
              {hero.platforms.map((platform) => (
                <li key={platform} className="chip" dir="ltr">
                  {platform}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="og-hide rise absolute inset-x-0 bottom-8 hidden flex-col items-center gap-3 text-[0.75rem] text-mist/70 md:flex"
        style={vars({ '--d': '2000ms' })}
      >
        <span>{hero.scroll}</span>
        <span className="scroll-cue-line" />
      </div>
    </section>
  )
}
