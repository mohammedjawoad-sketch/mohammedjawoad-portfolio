import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { useI18n } from '../i18n'
import { cn, useHydrated, usePrefersReducedMotion, vars } from '../lib'
import type { LedgerRow } from '../content/types'
import { CheckIcon } from './Icons'
import { SectionHeading } from './Reveal'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Each digit is a wheel of 0-9 that rolls to its figure, like a mechanical
 * counter. The prerendered page shows the real figure (for search engines and
 * first paint); in the browser the wheels start at zero and roll when the
 * ledger scrolls into view. The digit itself stays in the text, the wheel is
 * drawn by CSS.
 */
function Odometer({ value, run, delay }: { value: number; run: boolean; delay: number }) {
  const hydrated = useHydrated()
  const reduced = usePrefersReducedMotion()
  const settled = !hydrated || reduced || run
  const digits = String(value).split('')

  return (
    <span className={cn('odometer', !settled && 'odometer-idle')}>
      {digits.map((digit, i) => (
        <span
          key={i}
          className="odometer-digit"
          // Two full turns before landing, the leftmost wheel a beat behind.
          style={vars({ '--n': settled ? 20 + Number(digit) : 0, '--delay': `${delay + i * 0.09}s` })}
        >
          <span className="odometer-glyph">{digit}</span>
        </span>
      ))}
    </span>
  )
}

function Figure({ row, run, delay }: { row: LedgerRow; run: boolean; delay: number }) {
  return (
    <span dir="ltr" className="num whitespace-nowrap">
      <span className="sr-only">
        {row.value}
        {row.suffix}
      </span>
      <span aria-hidden="true">
        <Odometer value={row.value} run={run} delay={delay} />
        {row.suffix}
      </span>
    </span>
  )
}

// Rows flip down into place from a hinge along their top edge, like a departures board.
const flip = { transformPerspective: 900, transformOrigin: '50% 0%' }

export function Ledger() {
  const { t } = useI18n()
  const ledger = t.ledger
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const stagger = 0.12
  const stampDelay = ledger.rows.length * stagger + 1.7

  return (
    <section id="record" data-formation="0" className="section-pad relative" aria-labelledby="record-title">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="record-title" title={ledger.title} intro={ledger.intro} />

          <div ref={ref} className="panel panel-energy relative mt-12 rounded-[1.75rem] px-6 pb-10 pt-4 md:px-10 md:pb-12 md:pt-6">
            <dl>
              {ledger.rows.map((row, i) => (
                <motion.div
                  key={row.label}
                  className="ledger-row"
                  style={flip}
                  initial={{ opacity: 0, rotateX: -75 }}
                  animate={inView ? { opacity: 1, rotateX: 0 } : undefined}
                  transition={{ duration: 0.8, delay: i * stagger, ease }}
                >
                  <dt className="ledger-label text-mist">{row.label}</dt>
                  <dd className="text-[1.2rem] font-semibold text-bone">
                    <Figure row={row} run={inView} delay={i * stagger + 0.2} />
                  </dd>
                </motion.div>
              ))}
              <motion.div
                className="ledger-row ledger-total mt-3 pt-5"
                style={flip}
                initial={{ opacity: 0, rotateX: -75 }}
                animate={inView ? { opacity: 1, rotateX: 0 } : undefined}
                transition={{ duration: 0.8, delay: ledger.rows.length * stagger, ease }}
              >
                <dt className="ledger-label font-semibold text-bone">{ledger.total.label}</dt>
                <dd className="text-[1.45rem] font-bold text-accent">
                  <Figure row={ledger.total} run={inView} delay={ledger.rows.length * stagger + 0.2} />
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
