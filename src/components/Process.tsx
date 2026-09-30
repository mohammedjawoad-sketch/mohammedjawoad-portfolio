import { motion } from 'motion/react'
import { useI18n } from '../i18n'
import { SectionHeading } from './Reveal'

const ease = [0.16, 1, 0.3, 1] as const

export function Process() {
  const { t } = useI18n()
  const steps = t.process.steps

  return (
    <section id="process" data-formation="3" className="section-pad relative" aria-labelledby="process-title">
      <div className="container-x">
        <SectionHeading id="process-title" title={t.process.title} intro={t.process.intro} className="max-w-3xl" />

        <div className="relative mt-16">
          {/* The rail draws itself across the steps as the section comes into view. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-[1.375rem] hidden h-px origin-left bg-linear-to-r from-accent via-glow to-steel/40 lg:block rtl:origin-right rtl:bg-linear-to-l"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 1.6, ease }}
          />
          <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-8">
            {steps.map((step, i) => (
              <motion.li
                key={step.name}
                className="relative flex gap-5 lg:block"
                // Each step flips down from the rail on a hinge along its top edge.
                style={{ transformPerspective: 900, transformOrigin: '50% 0%' }}
                initial={{ opacity: 0, rotateX: -80, y: -6 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                transition={{ duration: 0.9, ease, delay: 0.25 + i * 0.14 }}
              >
                <span
                  aria-hidden="true"
                  className="num relative z-10 flex size-11 flex-none items-center justify-center rounded-full bg-ink text-[0.95rem] font-semibold text-accent shadow-[inset_0_0_0_1px_rgb(var(--accent-rgb)/0.55),0_0_24px_-6px_rgb(var(--glow-rgb)/0.5)]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {i < steps.length - 1 && (
                  <span aria-hidden="true" className="absolute start-[1.375rem] top-12 bottom-[-2.5rem] w-px bg-line lg:hidden" />
                )}
                <div className="lg:mt-6">
                  <h3 className="t-h3">{step.name}</h3>
                  <p className="mt-2 text-[0.975rem] text-mist">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
