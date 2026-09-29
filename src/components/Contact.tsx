import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { NeedId, ServiceId } from '../content/types'
import { useI18n } from '../i18n'
import { site, whatsappLink } from '../site.config'
import { LinkedInIcon, MailIcon, PinIcon, WhatsAppIcon } from './Icons'
import { Reveal, SectionHeading } from './Reveal'

export interface Prefill {
  ids: ServiceId[]
  nonce: number
}

function DirectLink({
  icon,
  label,
  value,
  href,
  external,
  ltr,
}: {
  icon: ReactNode
  label: string
  value: string
  href?: string
  external?: boolean
  ltr?: boolean
}) {
  const body = (
    <>
      <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-ink/60 text-accent shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors group-hover:text-accent-soft">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.85rem] text-mist">{label}</span>
        <span dir={ltr ? 'ltr' : undefined} className="block truncate text-bone transition-colors group-hover:text-accent-soft">
          {value}
        </span>
      </span>
    </>
  )
  if (!href) return <div className="flex items-center gap-4">{body}</div>
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-xl"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {body}
    </a>
  )
}

export function Contact({ prefill }: { prefill: Prefill | null }) {
  const { t } = useI18n()
  const c = t.contact
  const f = c.form
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [needs, setNeeds] = useState<NeedId[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const uid = useId()

  useEffect(() => {
    if (prefill) setNeeds(prefill.ids)
  }, [prefill])

  const needOptions: { id: NeedId; label: string }[] = [
    ...t.services.items.map((s) => ({ id: s.id, label: s.short })),
    { id: 'other', label: f.needOther },
  ]
  const needLabels = needOptions.filter((o) => needs.includes(o.id)).map((o) => o.label)

  const toggleNeed = (id: NeedId) => {
    setError(false)
    setNeeds((current) => (current.includes(id) ? current.filter((n) => n !== id) : [...current, id]))
  }

  const compose = () =>
    [
      f.greeting,
      '',
      name.trim() && `${f.keys.name}: ${name.trim()}`,
      company.trim() && `${f.keys.company}: ${company.trim()}`,
      needLabels.length > 0 && `${f.keys.need}: ${needLabels.join(', ')}`,
      '',
      message.trim(),
    ]
      .filter((line) => line !== false && line !== undefined)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

  const valid = () => {
    if (message.trim() || needs.length > 0) return true
    setError(true)
    messageRef.current?.focus()
    return false
  }

  const sendWhatsapp = () => {
    if (!valid()) return
    window.open(whatsappLink(compose()), '_blank', 'noopener,noreferrer')
  }

  const sendEmail = () => {
    if (!valid()) return
    const subject = [f.subject, needLabels.join(', '), company.trim()].filter(Boolean).join(' | ')
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(compose())}`
  }

  return (
    <section id="contact" data-formation="4" className="section-pad relative" aria-labelledby="contact-title">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SectionHeading id="contact-title" title={c.title} intro={c.intro} />
          <Reveal className="mt-12" delay={0.1}>
            <h3 className="text-[0.95rem] font-semibold text-mist">{c.direct.title}</h3>
            <div className="mt-6 space-y-5">
              <DirectLink icon={<MailIcon className="size-5" />} label={c.direct.email} value={site.email} href={`mailto:${site.email}`} ltr />
              <DirectLink
                icon={<WhatsAppIcon className="size-5" />}
                label={c.direct.whatsapp}
                value={site.phoneDisplay}
                href={whatsappLink()}
                external
                ltr
              />
              <DirectLink
                icon={<LinkedInIcon className="size-[1.1rem]" />}
                label={c.direct.linkedin}
                value={c.direct.linkedinValue}
                href={site.linkedin}
                external
              />
              <DirectLink icon={<PinIcon className="size-5" />} label={c.direct.location} value={c.direct.locationValue} />
            </div>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7" delay={0.08}>
          <form
            className="panel rounded-[1.75rem] p-6 md:p-10"
            onSubmit={(e) => {
              e.preventDefault()
              sendWhatsapp()
            }}
            noValidate
          >
            <h3 className="t-h3">{f.title}</h3>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[0.9rem] text-mist">{f.nameLabel}</span>
                <input
                  className="field"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={f.namePlaceholder}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[0.9rem] text-mist">{f.companyLabel}</span>
                <input
                  className="field"
                  name="company"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={f.companyPlaceholder}
                />
              </label>
            </div>

            <fieldset className="mt-6">
              <legend className="mb-3 text-[0.9rem] text-mist">{f.needLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {needOptions.map((option) => (
                  <label key={option.id}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={needs.includes(option.id)}
                      onChange={() => toggleNeed(option.id)}
                    />
                    <span className="need-chip">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-6 block">
              <span className="mb-2 block text-[0.9rem] text-mist">{f.messageLabel}</span>
              <textarea
                ref={messageRef}
                className="field min-h-36 resize-y"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setError(false)
                }}
                placeholder={f.messagePlaceholder}
                aria-invalid={error || undefined}
                aria-describedby={error ? `${uid}-error` : undefined}
              />
            </label>

            <div aria-live="polite">
              <AnimatePresence>
                {error && (
                  <motion.p
                    id={`${uid}-error`}
                    className="mt-3 text-[0.9rem] text-accent"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {f.error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary">
                <WhatsAppIcon className="size-5" />
                {f.sendWhatsapp}
              </button>
              <button type="button" onClick={sendEmail} className="btn btn-ghost">
                <MailIcon className="size-5" />
                {f.sendEmail}
              </button>
            </div>
            <p className="mt-5 text-[0.85rem] text-mist/80">{f.note}</p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
