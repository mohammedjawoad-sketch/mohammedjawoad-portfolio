import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { whatsappLink } from '../site.config'
import { WhatsAppIcon } from './Icons'

/** Quick WhatsApp button once the visitor is past the hero, hidden again at the contact section. */
export function WhatsAppFloat() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const contact = document.getElementById('contact')
    let pastHero = false
    let atContact = false
    const sync = () => setVisible(pastHero && !atContact)
    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.8
      sync()
    }
    const observer = new IntersectionObserver(([entry]) => {
      atContact = entry.isIntersecting
      sync()
    })
    if (contact) observer.observe(contact)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.float.whatsapp}
          className="og-hide group fixed bottom-5 end-5 z-30 flex items-center rounded-full bg-accent p-3.5 text-ink shadow-[0_0_36px_-6px_rgb(var(--glow-rgb)/0.55)] md:bottom-7 md:end-7"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        >
          <WhatsAppIcon className="size-6" />
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-[0.9rem] font-semibold transition-[max-width,margin] duration-500 group-hover:ms-2.5 group-hover:max-w-56 group-focus-visible:ms-2.5 group-focus-visible:max-w-56 md:inline">
            {t.float.whatsapp}
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
