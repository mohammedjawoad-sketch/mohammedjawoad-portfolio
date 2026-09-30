import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useTheme } from '../theme'
import { FORMATIONS, ParticleField } from './ParticleField'

const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="tab"]'

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * Sections declare the formation they want with data-formation. Near the end
 * of a section the weight slides toward the next section's formation.
 */
function weightsForScroll() {
  const weights = new Array<number>(FORMATIONS).fill(0)
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-formation]'))
  if (sections.length === 0) {
    weights[0] = 1
    return weights
  }
  const line = window.innerHeight * 0.5
  const formationOf = (el: HTMLElement) => Number(el.dataset.formation) || 0

  for (let i = 0; i < sections.length; i++) {
    const rect = sections[i].getBoundingClientRect()
    if (line >= rect.top && line < rect.bottom) {
      const current = formationOf(sections[i])
      const next = sections[i + 1]
      const zone = Math.min(window.innerHeight * 0.45, rect.height * 0.5)
      const t = next ? smoothstep(rect.bottom - zone, rect.bottom, line) : 0
      weights[current] += 1 - t
      if (next) weights[formationOf(next)] += t
      return weights
    }
  }
  const first = sections[0].getBoundingClientRect()
  weights[formationOf(line < first.top ? sections[0] : sections[sections.length - 1])] = 1
  return weights
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<ParticleField | null>(null)
  const [failed, setFailed] = useState(false)
  const { dir } = useI18n()
  const dirRef = useRef(dir)
  dirRef.current = dir
  const { theme } = useTheme()
  const themeRef = useRef(theme)
  themeRef.current = theme

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = Math.min(window.innerWidth, window.innerHeight) < 640
    const cores = navigator.hardwareConcurrency || 4
    const count = small ? 7000 : cores <= 4 ? 11000 : 16000
    const og = document.documentElement.classList.contains('og')

    let field: ParticleField
    try {
      field = new ParticleField(canvas, {
        count,
        reducedMotion: reduced,
        maxDpr: small ? 1.75 : 2,
        skipIntro: og,
        rtl: dirRef.current === 'rtl',
        light: themeRef.current === 'light',
      })
    } catch (error) {
      console.warn('[particles] falling back to static background:', error)
      setFailed(true)
      return
    }
    fieldRef.current = field
    // Dev only: lets the console pin one formation, e.g. __field.setTarget([0, 0, 0, 0, 1]).
    if (import.meta.env.DEV) Object.assign(window, { __field: field })

    let queued = false
    const update = () => {
      queued = false
      field.setTarget(weightsForScroll())
      field.setScroll(window.scrollY / Math.max(1, window.innerHeight))
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    }
    let lastWidth = window.innerWidth
    let lastHeight = window.innerHeight
    const onResize = () => {
      // Mobile browsers resize the viewport while the URL bar hides; ignore small height changes.
      if (window.innerWidth !== lastWidth || Math.abs(window.innerHeight - lastHeight) > 140) {
        lastWidth = window.innerWidth
        lastHeight = window.innerHeight
        field.resize()
      }
      onScroll()
    }
    const toNdc = (e: PointerEvent) =>
      [(e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1)] as const
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const [x, y] = toNdc(e)
      field.setPointer(x, y)
    }
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return
      const [x, y] = toNdc(e)
      field.pulseAt(x, y)
    }
    const onLeave = () => field.pointerOut()
    const onVisibility = () => (document.hidden ? field.stop() : field.start())

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    update()
    field.start()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      field.destroy()
      fieldRef.current = null
    }
  }, [])

  // Switch palette in the same commit as the page colours, so the theme
  // transition never shows glowing light on the light page.
  useLayoutEffect(() => {
    fieldRef.current?.setTheme(theme === 'light')
  }, [theme])

  // Formations move to the other side of the screen when the layout flips to RTL,
  // and section heights change with the language, so recompute both.
  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.setDirection(dir === 'rtl')
    const id = requestAnimationFrame(() => field.setTarget(weightsForScroll()))
    return () => cancelAnimationFrame(id)
  }, [dir])

  if (failed) return <div className="particles-fallback" aria-hidden="true" />
  return <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />
}
