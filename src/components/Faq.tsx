import { useI18n } from '../i18n'
import { PlusIcon } from './Icons'
import { Reveal, SectionHeading } from './Reveal'

export function Faq() {
  const { t } = useI18n()

  return (
    <section id="faq" data-formation="3" className="section-pad relative" aria-labelledby="faq-title">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-title" title={t.faq.title} />
        </div>
        <Reveal className="lg:col-span-8" delay={0.08}>
          <div className="panel divide-y divide-line rounded-[1.75rem] px-6 md:px-8">
            {t.faq.items.map((item) => (
              <details key={item.q} className="faq-item group">
                <summary className="flex items-center gap-4 py-6 text-start">
                  <span className="flex-1 text-[1.075rem] font-semibold text-bone transition-colors group-hover:text-accent-soft">
                    {item.q}
                  </span>
                  <PlusIcon className="faq-icon size-5 flex-none text-mist" />
                </summary>
                <p className="max-w-[44rem] pb-6 text-mist">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
