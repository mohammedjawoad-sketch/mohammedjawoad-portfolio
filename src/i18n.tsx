import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ar } from './content/ar'
import { en } from './content/en'
import type { Content, Lang } from './content/types'

// Product names should never break across lines, which matters most when
// Latin names sit inside right-to-left Arabic sentences.
const UNBREAKABLE = [
  'SAP Business One',
  'SAP S/4HANA',
  'SAP Customer Checkout',
  'SAP HANA',
  'SAP B1',
  'Service Layer',
  'Customer Checkout',
  'Crystal Reports',
  'Transaction Notification',
  'Windows Server',
  'Cloudflare Tunnel',
  'GitHub Actions',
  'Odoo Community',
  'Odoo Enterprise',
]

function keepTogether<T>(value: T): T {
  if (typeof value === 'string') {
    return UNBREAKABLE.reduce((text, phrase) => text.replaceAll(phrase, phrase.replaceAll(' ', ' ')), value) as T
  }
  if (Array.isArray(value)) return value.map(keepTogether) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, keepTogether(v)])) as T
  }
  return value
}

const dictionaries: Record<Lang, Content> = { en: keepTogether(en), ar: keepTogether(ar) }

// Each language has its own address, so search engines index both and a link
// always opens in the language it was shared in: English at /, Arabic at /ar/.
export const langFromPath = (pathname: string): Lang => (/^\/ar(\/|$)/.test(pathname) ? 'ar' : 'en')
export const pathForLang = (lang: Lang) => (lang === 'ar' ? '/ar/' : '/')

interface I18n {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: Content
  toggle: () => void
}

const I18nContext = createContext<I18n | null>(null)

/** `initialLang` is for prerendering; in the browser the address decides. */
export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(
    () => initialLang ?? (typeof window === 'undefined' ? 'en' : langFromPath(window.location.pathname)),
  )
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = dir
    document.title = dictionaries[lang].meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', dictionaries[lang].meta.description)
  }, [lang, dir])

  const toggle = useCallback(() => {
    setLang((current) => {
      const next = current === 'en' ? 'ar' : 'en'
      window.history.replaceState(null, '', pathForLang(next) + window.location.hash)
      return next
    })
  }, [])

  const value = useMemo(() => ({ lang, dir, t: dictionaries[lang], toggle }), [lang, dir, toggle]) satisfies I18n
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
