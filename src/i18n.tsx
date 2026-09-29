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

function initialLang(): Lang {
  const param = new URLSearchParams(window.location.search).get('lang')
  if (param === 'ar' || param === 'en') return param
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'ar' || saved === 'en') return saved
  } catch {
    // storage can be blocked; fall through to the browser language
  }
  return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

interface I18n {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: Content
  toggle: () => void
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = dir
    document.title = dictionaries[lang].meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', dictionaries[lang].meta.description)
    try {
      localStorage.setItem('lang', lang)
    } catch {
      // not critical
    }
  }, [lang, dir])

  const toggle = useCallback(() => {
    setLang((current) => {
      const next = current === 'en' ? 'ar' : 'en'
      const url = new URL(window.location.href)
      if (next === 'ar') url.searchParams.set('lang', 'ar')
      else url.searchParams.delete('lang')
      window.history.replaceState(null, '', url)
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
