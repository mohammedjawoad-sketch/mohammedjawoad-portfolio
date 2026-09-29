import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import type { Project } from '../content/types'
import { useI18n } from '../i18n'
import { useMediaQuery, vars } from '../lib'
import { CheckIcon } from './Icons'
import { SectionHeading } from './Reveal'

function FlowDiagram({ steps, label }: { steps: string[]; label: string }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl bg-ink/40 p-5 shadow-[inset_0_0_0_1px_var(--color-line)] md:p-6">
      <figcaption className="text-[0.85rem] text-mist">{label}</figcaption>
      <ol className="mt-5 flex flex-1 flex-col justify-center">
        {steps.map((step, i) => (
          <li key={step} className="flow-step">
            <div className="flow-box">
              <span className="flow-node" aria-hidden="true" />
              <span>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <span className="flow-link" aria-hidden="true">
                <span className="flow-packet" style={vars({ '--i': i })} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </figure>
  )
}

interface CardProps {
  project: Project
  index: number
  total: number
  progress: MotionValue<number>
  stacked: boolean
}

function ProjectCard({ project, index, total, progress, stacked }: CardProps) {
  const { t } = useI18n()
  const labels = t.projects
  // Earlier cards shrink a little as later ones slide over them.
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - 1 - index) * 0.025])

  // Soft light that follows the pointer across the card.
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div className="project-slot" style={vars({ '--i': index })}>
      <motion.article
        onPointerMove={onPointerMove}
        style={stacked ? { scale, transformOrigin: 'top center' } : undefined}
        initial={stacked ? undefined : { opacity: 0, y: 28 }}
        whileInView={stacked ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="panel project-card group relative grid gap-8 overflow-hidden rounded-[1.75rem] p-6 md:p-10 lg:grid-cols-12 lg:gap-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(28rem circle at var(--mx, 50%) var(--my, 50%), rgb(122 162 255 / 0.12), transparent 70%)',
          }}
        />
        <div className="relative lg:col-span-7">
          <p className="flex flex-wrap items-center gap-3 text-[0.9rem] text-mist">
            {project.client}
            {project.status && (
              <span className="rounded-full bg-glow/10 px-2.5 py-0.5 text-[0.8rem] text-glow shadow-[inset_0_0_0_1px_rgb(69_220_255/0.35)]">
                {project.status}
              </span>
            )}
          </p>
          <h3 className="mt-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.02em] [font-stretch:115%] text-balance rtl:leading-[1.4] rtl:tracking-normal rtl:[font-stretch:100%]">
            {project.name}
          </h3>
          <p className="mt-4 max-w-[38rem] text-mist">{project.summary}</p>

          <h4 className="sr-only">{labels.resultsLabel}</h4>
          <ul className="mt-6 space-y-3">
            {project.results.map((result) => (
              <li key={result} className="flex gap-3 text-bone">
                <CheckIcon className="mt-1 size-[1.1rem] flex-none text-accent" />
                <span>{result}</span>
              </li>
            ))}
          </ul>

          <h4 className="mt-7 text-[0.85rem] text-mist">{labels.stackLabel}</h4>
          <ul className="mt-3 flex flex-wrap gap-2" dir="ltr">
            {project.stack.map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative lg:col-span-5">
          <FlowDiagram steps={project.flow} label={labels.flowLabel} />
        </div>
      </motion.article>
    </div>
  )
}

export function Projects() {
  const { t } = useI18n()
  const listRef = useRef<HTMLDivElement>(null)
  const stacked = useMediaQuery('(min-width: 1024px) and (min-height: 720px)')
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start start', 'end end'] })
  const items = t.projects.items

  return (
    <section id="projects" data-formation="2" className="section-pad relative" aria-labelledby="projects-title">
      <div className="container-x">
        <SectionHeading id="projects-title" title={t.projects.title} intro={t.projects.intro} className="max-w-3xl" />
        <div ref={listRef} className="mt-14 space-y-6">
          {items.map((project, i) => (
            <ProjectCard
              key={project.name}
              project={project}
              index={i}
              total={items.length}
              progress={scrollYProgress}
              stacked={stacked}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
