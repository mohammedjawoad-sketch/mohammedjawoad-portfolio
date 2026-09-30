import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import type { Project } from '../content/types'
import { useTilt } from '../depth'
import { useI18n } from '../i18n'
import { useMediaQuery, usePrefersReducedMotion, vars } from '../lib'
import { site } from '../site.config'
import { CheckIcon, GitHubIcon } from './Icons'
import { Reveal, SectionHeading } from './Reveal'

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
  const reduced = usePrefersReducedMotion()
  const covered = index < total - 1
  const span = [index / total, (index + 1) / total]
  // As the next card slides over it, a card shrinks, tips back into the stack and dims.
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - 1 - index) * 0.025])
  const rotateX = useTransform(progress, span, [0, covered ? -8 : 0])
  const shade = useTransform(progress, span, [0, covered ? 0.5 : 0])
  const deck = stacked && !reduced

  return (
    <div className="project-slot" style={vars({ '--i': index })}>
      <motion.article
        // The prerendered page starts in the list layout; switching to the deck
        // mounts a fresh card, since a card that started hidden for the list
        // entrance would otherwise stay hidden once whileInView is gone.
        key={stacked ? 'deck' : 'list'}
        style={
          stacked
            ? { scale, rotateX: deck ? rotateX : 0, transformPerspective: 1600, transformOrigin: 'top center' }
            : { transformPerspective: 1200, transformOrigin: '50% 100%' }
        }
        initial={stacked ? undefined : { opacity: 0, y: 36, rotateX: 12 }}
        whileInView={stacked ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="panel project-card group relative grid gap-8 overflow-hidden rounded-[1.75rem] p-6 md:p-10 lg:grid-cols-12 lg:gap-10"
      >
        {deck && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-ink"
            style={{ opacity: shade }}
          />
        )}
        <div className="relative lg:col-span-7">
          <p className="flex flex-wrap items-center gap-3 text-[0.9rem] text-mist">
            {project.client}
            {project.status && (
              <span className="rounded-full bg-glow/10 px-2.5 py-0.5 text-[0.8rem] text-glow shadow-[inset_0_0_0_1px_rgb(var(--glow-rgb)/0.35)]">
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

          {project.caseStudy && (
            <p className="mt-7">
              <a
                href={`${site.caseStudies}#${project.caseStudy}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-lg text-[0.95rem] text-accent-soft underline decoration-accent/40 underline-offset-4 transition-colors hover:text-bone hover:decoration-bone/60"
              >
                <GitHubIcon className="size-[1.05rem] flex-none" />
                {labels.caseStudyLink}
              </a>
            </p>
          )}
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
        <Reveal delay={0.1}>
          <a
            href={site.caseStudies}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-2.5 rounded-lg text-[0.95rem] text-accent-soft transition-colors hover:text-bone"
          >
            <GitHubIcon className="size-[1.1rem]" />
            <span className="underline decoration-accent/40 underline-offset-4 transition-colors group-hover:decoration-bone/60">
              {t.projects.caseStudies}
            </span>
          </a>
        </Reveal>
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
        <GitHubProjects />
      </div>
    </section>
  )
}

/** A tile that leans toward the pointer. */
function TiltTile({ href, className, style, children }: { href: string; className: string; style?: CSSProperties; children: ReactNode }) {
  const tilt = useTilt(7)
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ ...style, ...tilt.style }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      {children}
    </motion.a>
  )
}

/** The seven applications, each linked to its write-up on GitHub; the code itself stays private. */
function GitHubProjects() {
  const { t } = useI18n()
  const g = t.projects.github
  return (
    <div className="mt-24 md:mt-32">
      <Reveal>
        <h3 className="t-h3 flex items-center gap-3">
          <GitHubIcon className="size-6 flex-none text-bone" />
          {g.title}
        </h3>
        <p className="mt-3 max-w-2xl text-mist">{g.intro}</p>
      </Reveal>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {g.items.map((item, i) => (
          <li key={item.caseStudy}>
            <Reveal className="h-full" delay={0.05 * (i % 4)}>
              <TiltTile
                href={`${site.caseStudies}#${item.caseStudy}`}
                className="panel project-card group flex h-full flex-col rounded-2xl p-6 transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_rgb(var(--accent-rgb)/0.5)]"
              >
                <span className="block text-[0.85rem] text-mist">{item.client}</span>
                <span className="mt-2 block text-balance text-[1.1rem] font-semibold leading-snug text-bone [font-stretch:106%] rtl:[font-stretch:100%]">
                  {item.name}
                </span>
                <span className="mt-3 block text-[0.95rem] text-mist">{item.summary}</span>
                <span className="mt-auto flex items-center gap-2 pt-6 text-[0.9rem] text-accent-soft transition-colors group-hover:text-bone">
                  <GitHubIcon className="size-4 flex-none" />
                  {g.readLink}
                </span>
              </TiltTile>
            </Reveal>
          </li>
        ))}
        <li>
          <Reveal className="h-full" delay={0.15}>
            <TiltTile
              href={site.caseStudies}
              className="panel project-card group flex h-full flex-col justify-between gap-6 rounded-2xl p-6 shadow-[inset_0_0_0_1px_rgb(var(--accent-rgb)/0.55)]"
              style={{
                background:
                  'linear-gradient(160deg, rgb(var(--accent-rgb) / 0.16), transparent 65%), linear-gradient(180deg, var(--card-from), var(--card-to))',
              }}
            >
              <GitHubIcon className="size-8 text-accent" />
              <span>
                <span className="block text-[1.1rem] font-semibold leading-snug text-bone">{g.all}</span>
                <span dir="ltr" className="mt-1 block text-[0.85rem] text-mist rtl:text-end">
                  erp-case-studies
                </span>
              </span>
              <span className="btn btn-primary min-h-11 self-start px-4 text-[0.925rem]">{g.allAction}</span>
            </TiltTile>
          </Reveal>
        </li>
      </ul>
    </div>
  )
}
