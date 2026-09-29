import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, type KeyboardEvent } from 'react'
import type { Service, ServiceId } from '../content/types'
import { useI18n } from '../i18n'
import { cn, useMediaQuery } from '../lib'
import { CheckIcon, PlusIcon } from './Icons'
import { Reveal, SectionHeading } from './Reveal'

const ease = [0.16, 1, 0.3, 1] as const

function ServiceDetail({ service, onDiscuss }: { service: Service; onDiscuss: (id: ServiceId) => void }) {
  const { t } = useI18n()
  return (
    <>
      <p className="text-[1.0625rem] leading-relaxed text-bone/90">{service.summary}</p>
      <h4 className="mt-7 text-[0.9rem] font-semibold text-mist">{t.services.whatYouGet}</h4>
      <ul className="mt-3 space-y-3">
        {service.outcomes.map((outcome) => (
          <li key={outcome} className="flex gap-3">
            <CheckIcon className="mt-1 size-[1.1rem] flex-none text-accent" />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
      <h4 className="mt-7 text-[0.9rem] font-semibold text-mist">{t.services.tools}</h4>
      <ul className="mt-3 flex flex-wrap gap-2">
        {service.tools.map((tool) => (
          <li key={tool} className="chip">
            {tool}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onDiscuss(service.id)} className="btn btn-ghost mt-8">
        {t.services.cta}
      </button>
    </>
  )
}

export function Services({ onDiscuss }: { onDiscuss: (id: ServiceId) => void }) {
  const { t } = useI18n()
  const items = t.services.items
  const [active, setActive] = useState<ServiceId>(items[0].id)
  const desktop = useMediaQuery('(min-width: 1024px)')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const hoverTimer = useRef<number | undefined>(undefined)
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === active))
  const current = items[activeIndex]

  const focusTab = (index: number) => {
    const next = (index + items.length) % items.length
    setActive(items[next].id)
    tabRefs.current[next]?.focus()
  }

  const onTabKey = (event: KeyboardEvent, index: number) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => focusTab(index + 1),
      ArrowUp: () => focusTab(index - 1),
      Home: () => focusTab(0),
      End: () => focusTab(items.length - 1),
    }
    const action = keys[event.key]
    if (action) {
      event.preventDefault()
      action()
    }
  }

  const hoverTo = (id: ServiceId) => {
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => setActive(id), 110)
  }

  return (
    <section id="services" data-formation="1" className="section-pad relative" aria-labelledby="services-title">
      <div className="container-x">
        <SectionHeading id="services-title" title={t.services.title} intro={t.services.intro} className="max-w-3xl" />

        {desktop ? (
          <div className="mt-16 grid grid-cols-12 gap-10">
            <Reveal className="col-span-5">
              <div role="tablist" aria-orientation="vertical" aria-labelledby="services-title" className="space-y-1">
                {items.map((item, i) => {
                  const selected = item.id === active
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        tabRefs.current[i] = el
                      }}
                      id={`service-tab-${item.id}`}
                      role="tab"
                      type="button"
                      aria-selected={selected}
                      aria-controls="service-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActive(item.id)}
                      onKeyDown={(e) => onTabKey(e, i)}
                      onMouseEnter={() => hoverTo(item.id)}
                      onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
                      className={cn(
                        'relative block w-full rounded-xl py-4 ps-6 pe-4 text-start transition-colors duration-300',
                        selected ? 'text-bone' : 'text-mist/75 hover:text-bone',
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId="service-indicator"
                          aria-hidden="true"
                          className="absolute inset-y-3 start-0 w-[3px] rounded-full bg-accent shadow-[0_0_14px_rgb(69_220_255/0.8)]"
                          transition={{ duration: 0.45, ease }}
                        />
                      )}
                      <span className="t-h3 block">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </Reveal>

            <div className="col-span-7">
              <Reveal delay={0.1}>
                <div
                  id="service-panel"
                  role="tabpanel"
                  aria-labelledby={`service-tab-${current.id}`}
                  className="panel min-h-[27rem] rounded-[1.75rem] p-10"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <h3 className="t-h3 mb-5 text-accent">{current.name}</h3>
                      <ServiceDetail service={current} onDiscuss={onDiscuss} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Reveal>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-3">
            {items.map((item) => {
              const open = item.id === active
              return (
                <Reveal key={item.id} y={16}>
                  <div className={cn('panel rounded-2xl transition-shadow', open && 'shadow-[inset_0_0_0_1px_rgb(122_162_255/0.45)]')}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`service-body-${item.id}`}
                        onClick={() => setActive(item.id)}
                        className="flex w-full items-center gap-4 px-5 py-5 text-start"
                      >
                        <span className={cn('t-h3 flex-1', open ? 'text-accent' : 'text-bone')}>{item.name}</span>
                        <PlusIcon
                          className={cn('size-5 flex-none text-mist transition-transform duration-300', open && 'rotate-45')}
                        />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={`service-body-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-6">
                            <ServiceDetail service={item} onDiscuss={onDiscuss} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
