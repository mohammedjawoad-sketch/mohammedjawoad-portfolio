import { useI18n } from '../i18n'
import { site, whatsappLink } from '../site.config'
import { Logo } from './Icons'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  const fullName = t.hero.nameLines.join(' ')

  return (
    <footer className="relative z-10 border-t border-line bg-ink/60 backdrop-blur-xl">
      <div className="container-x flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Logo className="size-9 text-bone" />
          <div>
            <p className="font-semibold text-bone">{fullName}</p>
            <p className="text-[0.9rem] text-mist">{t.footer.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.9rem] text-mist">
          <a className="transition-colors hover:text-bone" href={`mailto:${site.email}`} dir="ltr">
            {site.email}
          </a>
          <a className="transition-colors hover:text-bone" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            {t.contact.direct.whatsapp}
          </a>
          <a className="transition-colors hover:text-bone" href={site.linkedin} target="_blank" rel="noopener noreferrer">
            {t.contact.direct.linkedin}
          </a>
          <a className="transition-colors hover:text-bone" href="#top">
            {t.footer.top}
          </a>
        </div>
      </div>
      <div className="container-x pb-8 text-[0.8rem] text-mist/60">
        © <span className="num">{year}</span> {fullName}
      </div>
    </footer>
  )
}
