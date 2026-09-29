import { useI18n } from '../i18n'
import { Reveal, SectionHeading } from './Reveal'

/** A small clay tablet with rows of wedge marks, for the Mesopotamia line. */
function Tablet() {
  const rows = [
    [8, 5, 11, 7, 9],
    [6, 10, 7, 12],
    [9, 7, 5, 10, 6],
    [11, 6, 9],
  ]
  return (
    <svg viewBox="0 0 120 150" className="h-auto w-24 flex-none text-accent/70" aria-hidden="true">
      <rect x="4" y="4" width="112" height="142" rx="16" fill="rgb(122 162 255 / 0.08)" stroke="currentColor" strokeOpacity="0.45" />
      {rows.map((row, r) => {
        let x = 20
        return row.map((w, i) => {
          const y = 30 + r * 28
          const path = `M${x} ${y - 5} L${x + w} ${y} L${x} ${y + 5} Z`
          x += w + 8
          return <path key={`${r}-${i}`} d={path} fill="currentColor" opacity={0.55 + ((r + i) % 3) * 0.15} />
        })
      })}
    </svg>
  )
}

export function About() {
  const { t } = useI18n()
  const a = t.about
  const [first, second, story] = a.paragraphs

  return (
    <section id="about" data-formation="3" className="section-pad relative" aria-labelledby="about-title">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading id="about-title" title={a.title} />
            <Reveal className="mt-8 max-w-[40rem] space-y-5 text-[1.075rem] text-bone/90" delay={0.05}>
              <p>{first}</p>
              <p>{second}</p>
            </Reveal>
            <Reveal className="mt-10 flex max-w-[40rem] items-center gap-6" delay={0.1}>
              <Tablet />
              <p className="text-[1.075rem] leading-relaxed text-mist">{story}</p>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-5" delay={0.12}>
            <dl className="panel divide-y divide-line rounded-[1.75rem] px-7 py-2">
              {a.facts.map((fact) => (
                <div key={fact.label} className="py-5">
                  <dt className="text-[0.85rem] text-mist">{fact.label}</dt>
                  <dd className="mt-1 text-bone">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="mt-20">
          <h3 className="t-h3">{a.toolsTitle}</h3>
        </Reveal>
        <div className="mt-8 grid gap-x-10 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {a.toolGroups.map((group, i) => (
            <Reveal key={group.name} delay={(i % 3) * 0.06} y={18}>
              <h4 className="text-[0.95rem] font-semibold text-accent">{group.name}</h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
