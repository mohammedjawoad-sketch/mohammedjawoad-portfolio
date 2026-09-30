import { motion, useScroll, useSpring } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { SectionHeading } from './Reveal'

const ease = [0.16, 1, 0.3, 1] as const

/** Each entry swings open from the timeline rail, like a door on its hinge. */
function Swing({ children }: { children: ReactNode }) {
  const { dir } = useI18n()
  const rtl = dir === 'rtl'
  return (
    <motion.div
      style={{ transformPerspective: 1200, transformOrigin: rtl ? '100% 50%' : '0% 50%' }}
      initial={{ opacity: 0, rotateY: rtl ? -32 : 32, z: -40 }}
      whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ duration: 1.1, ease }}
    >
      {children}
    </motion.div>
  )
}

export function Experience() {
  const { t, lang } = useI18n()
  const x = t.experience
  const comma = lang === 'ar' ? '، ' : ', '
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <section id="experience" data-formation="3" className="section-pad relative" aria-labelledby="experience-title">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading id="experience-title" title={x.title} intro={x.intro} />
          </div>
        </div>

        <div className="relative lg:col-span-8">
          {/* Timeline rail, filled as you read down it. */}
          <div aria-hidden="true" className="absolute inset-y-2 start-[0.4375rem] w-px bg-line" />
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-2 start-[0.4375rem] w-px origin-top bg-linear-to-b from-accent via-glow to-steel"
            style={{ scaleY: fill }}
          />

          <ol ref={listRef} className="space-y-14">
            {x.roles.map((role) => (
              <li key={role.company} className="relative ps-10">
                <motion.span
                  aria-hidden="true"
                  className="absolute start-0 top-1.5 size-[0.9375rem] rounded-full bg-ink shadow-[inset_0_0_0_2px_var(--color-accent)]"
                  initial={{ scale: 0.4, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '0px 0px -30% 0px' }}
                  transition={{ duration: 0.5, ease }}
                />
                <Swing>
                  <p className="num text-[0.9rem] text-accent">{role.period}</p>
                  <h3 className="t-h3 mt-2">{role.title}</h3>
                  <p className="mt-1 text-bone/85">
                    {role.company}
                    <span className="text-mist">
                      {comma}
                      {role.place}
                    </span>
                  </p>
                  {role.context && <p className="mt-4 max-w-[42rem] text-[0.975rem] text-mist">{role.context}</p>}
                  <ul className="mt-5 max-w-[44rem] space-y-3">
                    {role.points.map((point) => (
                      <li key={point} className="relative ps-5 text-[0.975rem] text-bone/85">
                        <span aria-hidden="true" className="absolute start-0 top-[0.7em] size-1.5 rounded-full bg-glow/80" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Swing>
              </li>
            ))}

            <li className="relative ps-10">
              <motion.span
                aria-hidden="true"
                className="absolute start-0 top-1.5 size-[0.9375rem] rounded-full bg-ink shadow-[inset_0_0_0_2px_var(--color-glow)]"
                initial={{ scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '0px 0px -30% 0px' }}
                transition={{ duration: 0.5, ease }}
              />
              <Swing>
                <p className="text-[0.9rem] text-glow">
                  {x.educationLabel}
                  {comma}
                  <span className="num">{x.education.year}</span>
                </p>
                <h3 className="t-h3 mt-2">{x.education.degree}</h3>
                <p className="mt-1 text-mist">{x.education.school}</p>
              </Swing>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
