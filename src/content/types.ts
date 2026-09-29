export type Lang = 'en' | 'ar'

export type ServiceId = 'sap' | 'odoo' | 'erpnext' | 'apps' | 'reporting' | 'infra'
export type NeedId = ServiceId | 'other'
export type NavId = 'services' | 'projects' | 'process' | 'experience' | 'contact'

export interface Service {
  id: ServiceId
  name: string
  /** Short label used on the contact form chips. */
  short: string
  summary: string
  outcomes: string[]
  tools: string[]
}

export interface LedgerRow {
  label: string
  value: number
  suffix?: string
}

export interface Engagement {
  icon: 'implement' | 'build' | 'support'
  name: string
  body: string
  fit: string
}

export interface Project {
  name: string
  client: string
  status?: string
  summary: string
  results: string[]
  stack: string[]
  flow: string[]
}

export interface Role {
  company: string
  place: string
  period: string
  title: string
  context?: string
  points: string[]
}

export interface Content {
  meta: { title: string; description: string }
  nav: {
    brand: string
    home: string
    skip: string
    primary: string
    links: { id: NavId; label: string }[]
    cta: string
    langSwitch: string
    langSwitchAria: string
    menu: string
    close: string
  }
  hero: {
    status: string
    nameLines: string[]
    altName: string
    role: string
    pitch: string
    ctaPrimary: string
    ctaSecondary: string
    platforms: string[]
    scroll: string
  }
  ledger: {
    title: string
    intro: string
    rows: LedgerRow[]
    total: LedgerRow
    stamp: string
  }
  services: {
    title: string
    intro: string
    whatYouGet: string
    tools: string
    cta: string
    items: Service[]
  }
  engagements: {
    title: string
    intro: string
    bestFor: string
    items: Engagement[]
  }
  projects: {
    title: string
    intro: string
    resultsLabel: string
    stackLabel: string
    flowLabel: string
    items: Project[]
  }
  process: {
    title: string
    intro: string
    steps: { name: string; body: string }[]
  }
  experience: {
    title: string
    intro: string
    roles: Role[]
    educationLabel: string
    education: { degree: string; school: string; year: string }
  }
  about: {
    title: string
    paragraphs: string[]
    facts: { label: string; value: string }[]
    toolsTitle: string
    toolGroups: { name: string; items: string[] }[]
  }
  faq: {
    title: string
    items: { q: string; a: string }[]
  }
  contact: {
    title: string
    intro: string
    form: {
      title: string
      nameLabel: string
      namePlaceholder: string
      companyLabel: string
      companyPlaceholder: string
      needLabel: string
      needOther: string
      messageLabel: string
      messagePlaceholder: string
      sendWhatsapp: string
      sendEmail: string
      note: string
      error: string
      greeting: string
      subject: string
      keys: { name: string; company: string; need: string }
    }
    direct: {
      title: string
      email: string
      whatsapp: string
      linkedin: string
      linkedinValue: string
      location: string
      locationValue: string
    }
  }
  footer: {
    tagline: string
    top: string
  }
  float: {
    whatsapp: string
  }
}
