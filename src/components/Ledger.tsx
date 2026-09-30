import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useHydrated, usePrefersReducedMotion } from '../lib'
import type { LedgerRow } from '../content/types'
import { CheckIcon } from './Icons'
import { SectionHeading } from './Reveal'

function Counter({ to, run, delay }: { to: number; run: boolean; delay: number }) {
  const reduced = usePrefersReducedMotion()
  // The prerendered page shows the real figure (for search engines and first paint);
  // in the browser it counts up from zero when the ledger scrolls into view.
  const hydrated = useHydrated()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!run) return
    if (reduced) {
      setValue(to)
      return
    }
    let frame = 0
    const start = performance.now() + delay * 1000
    const duration = 1400
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration))
      setValue(Math.round(to * (1 - Math.pow(1 - p, 4))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [run, to, delay, reduced])

  return <>{hydrated ? value : to}</>
}

function Figure({ row, run, delay }: { row: LedgerRow; run: boolean; delay: number }) {
  return (
    <span dir="ltr" className="num whitespace-nowrap">
      <span className="sr-only">
        {row.value}
        {row.suffix}
      </span>
      <span aria-hidden="true">
        <Counter to={row.value} run={run} delay={delay} />
        {row.suffix}
      </span>
    </span>
  )
}

export function Ledger() {
  const { t, dir } = useI18n()
  const ledger = t.ledger
  const fromX = dir === 'rtl' ? 12 : -12
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const stagger = 0.12
  const stampDelay = ledger.rows.length * stagger + 1.5

  return (
    <section id="record" data-formation="0" className="section-pad relative" aria-labelledby="record-title">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="record-title" title={ledger.title} intro={ledger.intro} />

          <div ref={ref} className="panel relative mt-12 rounded-[1.75rem] px-6 pb-10 pt-4 md:px-10 md:pb-12 md:pt-6">
            <dl>
              {ledger.rows.map((row, i) => (
                <motion.div
                  key={row.label}
                  className="ledger-row"
                  initial={{ opacity: 0, x: fromX }}
                  animate={inView ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.6, delay: i * stagger, ease: [0.16, 1, 0.3, 1] }}
                >
                  <dt className="ledger-label text-mist">{row.label}</dt>
                  <dd className="text-[1.2rem] font-semibold text-bone">
                    <Figure row={row} run={inView} delay={i * stagger} />
                  </dd>
                </motion.div>
              ))}
              <motion.div
                className="ledger-row ledger-total mt-3 pt-5"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : undefined}
                transition={{ duration: 0.6, delay: ledger.rows.length * stagger }}
              >
                <dt className="ledger-label font-semibold text-bone">{ledger.total.label}</dt>
                <dd className="text-[1.45rem] font-bold text-accent">
                  <Figure row={ledger.total} run={inView} delay={ledger.rows.length * stagger} />
                </dd>
              </motion.div>
            </dl>

            <motion.div
              className="absolute -bottom-6 end-6 md:end-10"
              initial={{ opacity: 0, scale: 1.35, rotate: -14 }}
              animate={inView ? { opacity: 1, scale: 1, rotate: -7 } : undefined}
              transition={{ type: 'spring', stiffness: 420, damping: 18, delay: stampDelay }}
            >
              <span className="stamp">
                <CheckIcon className="size-5" />
                {ledger.stamp}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
