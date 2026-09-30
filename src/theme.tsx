import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'dark' | 'light'

const THEME_COLOR: Record<Theme, string> = { dark: '#05070f', light: '#f4f6fb' }

// index.html sets data-theme before the first paint (from ?theme= or the saved choice).
const pageTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

interface ThemeState {
  theme: Theme
  /** Switches theme; with an origin, the new theme spreads in a circle from that point. */
  toggle: (origin?: { x: number; y: number }) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start dark to match the prerendered HTML, then adopt the page's theme before
  // the first paint, so hydration never sees a different tree.
  const [theme, setTheme] = useState<Theme>('dark')
  const adopted = useRef(false)

  useLayoutEffect(() => {
    if (!adopted.current) {
      adopted.current = true
      const actual = pageTheme()
      if (actual !== theme) {
        setTheme(actual)
        return
      }
    }
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  }, [theme])

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', next)
      } catch {
        // storage can be blocked; the switch still works for this visit
      }
      const apply = () => {
        document.documentElement.dataset.theme = next
        flushSync(() => setTheme(next))
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!origin || reduced || typeof document.startViewTransition !== 'function') {
        apply()
        return
      }
      const transition = document.startViewTransition(apply)
      transition.ready
        .then(() => {
          const { x, y } = origin
          const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
          )
        })
        .catch(() => {
          // the switch already happened; only the animation was skipped
        })
    },
    [theme],
  )

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]) satisfies ThemeState
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}
