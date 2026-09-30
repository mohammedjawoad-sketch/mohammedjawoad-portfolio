import { AnimatePresence, motion, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { cn, useScrollSpy } from '../lib'
import { whatsappLink } from '../site.config'
import { useTheme } from '../theme'
import { CloseIcon, Logo, MenuIcon, MoonIcon, SunIcon, WhatsAppIcon } from './Icons'

const ease = [0.16, 1, 0.3, 1] as const

export function Nav() {
  const { t, lang, toggle } = useI18n()
  const { theme, toggle: toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const active = useScrollSpy(['top', ...t.nav.links.map((link) => link.id)])
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      menuButton.current?.focus()
    }
  }, [open])

  const otherLang = lang === 'en' ? 'ar' : 'en'
  const themeLabel = theme === 'dark' ? t.nav.themeToLight : t.nav.themeToDark

  return (
    <>
      <header
        className={cn(
          'og-hide fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500',
          scrolled && 'bg-ink/70 shadow-[inset_0_-1px_0_var(--color-line)] backdrop-blur-xl',
        )}
      >
        {/* How far down the page the reader is: a beam of light along the bar's lower edge. */}
        <motion.span
          aria-hidden="true"
          className={cn('scroll-beam', scrolled && 'is-on')}
          style={{ scaleX: scrollYProgress }}
        />
        <div className="container-x flex h-[4.5rem] items-center gap-4">
          <a href="#top" aria-label={t.nav.home} className="group flex items-center gap-3 rounded-lg">
            <Logo className="size-8 text-bone transition-transform duration-700 ease-out group-hover:rotate-[51.4deg]" />
            <span className="hidden text-[0.95rem] font-semibold tracking-tight [font-stretch:112%] sm:block rtl:tracking-normal rtl:[font-stretch:100%]">
              {t.nav.brand}
            </span>
          </a>

          <nav aria-label={t.nav.primary} className="ms-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {t.nav.links.map((link) => {
                const current = active === link.id
                return (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      aria-current={current ? 'true' : undefined}
                      className={cn(
                        'relative block rounded-lg px-3.5 py-2 text-[0.925rem] transition-colors duration-200',
                        current ? 'text-bone' : 'text-mist hover:text-bone',
                      )}
                    >
                      {link.label}
                      {current && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute inset-x-3.5 -bottom-px h-px bg-accent"
                          transition={{ duration: 0.5, ease }}
                        />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-2 lg:ms-3">
            <button
              type="button"
              onClick={toggle}
              aria-label={t.nav.langSwitchAria}
              className="rounded-lg px-3 py-2 text-[0.925rem] text-mist transition-colors hover:text-bone"
            >
              <span lang={otherLang}>{t.nav.langSwitch}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
              }}
              aria-label={themeLabel}
              title={themeLabel}
              className="flex size-11 items-center justify-center rounded-lg text-mist transition-colors hover:text-bone lg:size-10"
            >
              {theme === 'dark' ? (
                <SunIcon key="sun" className="theme-icon size-[1.2rem]" />
              ) : (
                <MoonIcon key="moon" className="theme-icon size-[1.1rem]" />
              )}
            </button>
            <a href="#contact" className="btn btn-primary hidden min-h-10 px-4 text-[0.9rem] sm:inline-flex">
              {t.nav.cta}
            </a>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="flex size-11 items-center justify-center rounded-xl text-bone shadow-[inset_0_0_0_1px_var(--color-line-strong)] lg:hidden"
            >
              <MenuIcon className="size-5" />
              <span className="sr-only">{t.nav.menu}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside the header: its backdrop-filter would trap a fixed overlay inside it. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-x flex h-[4.5rem] items-center justify-between">
              <Logo className="size-8 text-bone" />
              <button
                ref={closeButton}
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-11 items-center justify-center rounded-xl text-bone shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
              >
                <CloseIcon className="size-5" />
                <span className="sr-only">{t.nav.close}</span>
              </button>
            </div>
            <nav aria-label={t.nav.primary} className="container-x mt-6 flex-1">
              <ul className="space-y-1">
                {t.nav.links.map((link, i) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease, delay: 0.05 + i * 0.05 }}
                  >
                    <a href={`#${link.id}`} onClick={() => setOpen(false)} className="t-h2 block py-2 text-bone">
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="container-x flex flex-wrap gap-3 pb-10">
              <a href="#contact" onClick={() => setOpen(false)} className="btn btn-primary">
                {t.nav.cta}
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <WhatsAppIcon className="size-5" />
                {t.contact.direct.whatsapp}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
