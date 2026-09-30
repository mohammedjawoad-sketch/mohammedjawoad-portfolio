import { MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { About } from './components/About'
import { Contact, type Prefill } from './components/Contact'
import { Engagements } from './components/Engagements'
import { Experience } from './components/Experience'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Ledger } from './components/Ledger'
import { Nav } from './components/Nav'
import { Process } from './components/Process'
import { Projects } from './components/Projects'
import { Services } from './components/Services'
import { WhatsAppFloat } from './components/WhatsAppFloat'
import type { ServiceId } from './content/types'
import { useI18n } from './i18n'
import { scrollToId } from './lib'
import { ParticleBackground } from './particles/ParticleBackground'

export default function App() {
  const { t } = useI18n()
  const [prefill, setPrefill] = useState<Prefill | null>(null)

  const discuss = useCallback((id: ServiceId) => {
    setPrefill({ ids: [id], nonce: Date.now() })
    scrollToId('contact')
  }, [])

  // The page renders after the browser's own jump to #hash, so links like
  // /#contact (handy on LinkedIn) need the jump repeated once content exists,
  // and again once the web fonts have loaded and shifted the layout. Stops as
  // soon as the visitor starts scrolling on their own.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    let done = false
    const jump = () => {
      if (!done) document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    const stop = () => {
      done = true
    }
    const frame = requestAnimationFrame(jump)
    void document.fonts?.ready.then(() => requestAnimationFrame(jump))
    const timer = window.setTimeout(stop, 4000)
    const events = ['wheel', 'touchstart', 'keydown'] as const
    events.forEach((type) => window.addEventListener(type, stop, { once: true, passive: true }))
    return () => {
      stop()
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      events.forEach((type) => window.removeEventListener(type, stop))
    }
  }, [])

  // Light on the glass: the panel under the pointer catches a soft glow where it is.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let hot: HTMLElement | null = null
    const onMove = (e: PointerEvent) => {
      const panel = e.target instanceof Element ? e.target.closest<HTMLElement>('.panel') : null
      if (hot && hot !== panel) delete hot.dataset.hot
      hot = panel
      if (!panel) return
      const rect = panel.getBoundingClientRect()
      panel.style.setProperty('--mx', `${Math.round(e.clientX - rect.left)}px`)
      panel.style.setProperty('--my', `${Math.round(e.clientY - rect.top)}px`)
      panel.dataset.hot = ''
    }
    const onLeave = () => {
      if (hot) delete hot.dataset.hot
      hot = null
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <ParticleBackground />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <Ledger />
        <Projects />
        <Experience />
        <Services onDiscuss={discuss} />
        <Engagements />
        <Process />
        <About />
        <Faq />
        <Contact prefill={prefill} />
      </main>
      <Footer />
      <WhatsAppFloat />
    </MotionConfig>
  )
}
