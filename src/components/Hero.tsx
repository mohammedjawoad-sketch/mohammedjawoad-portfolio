import { useI18n } from '../i18n'
import { vars } from '../lib'
import { site } from '../site.config'
import { DownloadIcon } from './Icons'

export function Hero() {
  const { t, lang } = useI18n()
  const hero = t.hero
  let index = 0

  return (
    <section id="top" data-formation="0" className="relative flex min-h-[100svh] items-center">
      <div className="container-x pb-28 pt-32 md:pt-36">
        <div className="relative max-w-[47rem]">
          {/* Soft shade behind the copy so it stays legible over the particles. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-5 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,rgb(5_7_15/0.5),transparent)] lg:hidden"
          />

          <p className="rise inline-flex items-center gap-3 text-[0.9rem] text-mist" style={vars({ '--d': '120ms' })}>
            <span className="status-dot" aria-hidden="true" />
            {hero.status}
          </p>

          <h1 className="t-display mt-7 text-[clamp(2.55rem,0.9rem+7.2vw,6.6rem)]" key={lang}>
            <span className="sr-only">{hero.nameLines.join(' ')}</span>
            <span aria-hidden="true">
              {hero.nameLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {lang === 'ar'
                    ? line.split(' ').map((word, i, words) => (
                        <span key={i} className="name-word" style={vars({ '--i': index++ })}>
                          {word}
                          {i < words.length - 1 ? ' ' : ''}
                        </span>
                      ))
                    : Array.from(line).map((char, i) => (
                        <span key={i} className="name-letter" style={vars({ '--i': index++ })}>
                          {char === ' ' ? ' ' : char}
                        </span>
                      ))}
                </span>
              ))}
            </span>
          </h1>

          <p
            className="rise mt-4 text-[1.05rem] text-mist/80"
            lang={lang === 'en' ? 'ar' : 'en'}
            style={vars({ '--d': '900ms' })}
          >
            {hero.altName}
          </p>

          <p className="rise t-h3 mt-8 text-bone" style={vars({ '--d': '1000ms' })}>
            {hero.role}
          </p>
          <p className="rise t-lead mt-4 max-w-[37rem]" style={vars({ '--d': '1120ms' })}>
            {hero.pitch}
          </p>

          <div className="og-hide rise mt-9 flex flex-wrap gap-3" style={vars({ '--d': '1250ms' })}>
            <a href={site.cvFile} download className="btn btn-primary">
              <DownloadIcon className="size-5" />
              {hero.ctaPrimary}
            </a>
            <a href="#projects" className="btn btn-ghost">
              {hero.ctaSecondary}
            </a>
          </div>

          <ul className="og-hide rise mt-10 flex flex-wrap gap-2" style={vars({ '--d': '1400ms' })}>
            {hero.platforms.map((platform) => (
              <li key={platform} className="chip" dir="ltr">
                {platform}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="og-hide rise absolute inset-x-0 bottom-8 hidden flex-col items-center gap-3 text-[0.75rem] text-mist/70 md:flex"
        style={vars({ '--d': '2000ms' })}
      >
        <span>{hero.scroll}</span>
        <span className="scroll-cue-line" />
      </div>
    </section>
  )
}
