import type { Engagement } from '../content/types'
import { useI18n } from '../i18n'
import { CodeIcon, LayersIcon, LifebuoyIcon } from './Icons'
import { Reveal, SectionHeading } from './Reveal'

const icons: Record<Engagement['icon'], typeof LayersIcon> = {
  implement: LayersIcon,
  build: CodeIcon,
  support: LifebuoyIcon,
}

export function Engagements() {
  const { t } = useI18n()
  const e = t.engagements

  return (
    <section id="engagements" data-formation="1" className="relative pb-[clamp(5.5rem,4rem+6vw,9.5rem)]" aria-labelledby="engagements-title">
      <div className="container-x">
        <SectionHeading id="engagements-title" title={e.title} intro={e.intro} className="max-w-3xl" />
        <div className="panel mt-12 grid overflow-hidden rounded-[1.75rem] md:grid-cols-3">
          {e.items.map((item, i) => {
            const Icon = icons[item.icon]
            return (
              <Reveal
                key={item.name}
                delay={i * 0.08}
                className="flex flex-col border-line p-7 md:p-9 [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-t-0 md:[&:not(:first-child)]:border-s"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-ink/60 text-accent shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                  <Icon className="size-5" />
                </span>
                <h3 className="t-h3 mt-6">{item.name}</h3>
                <p className="mt-3 text-mist">{item.body}</p>
                <p className="mt-auto pt-6 text-[0.9rem]">
                  <span className="text-mist/80">{e.bestFor}: </span>
                  <span className="text-bone">{item.fit}</span>
                </p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
