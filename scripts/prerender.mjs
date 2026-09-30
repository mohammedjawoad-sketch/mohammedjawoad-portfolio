// Runs after `vite build` and the SSR build (see "build" in package.json).
// Renders the page to static HTML for each language, so search engines, ATS
// crawlers and link previews read the full content without running JavaScript,
// and writes each page's search tags and structured data (schema.org ProfilePage).
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { render, content, site } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)

const origin = site.url.replace(/\/+$/, '')
const template = readFileSync('dist/index.html', 'utf8')
if (!template.includes('<!--app-head-->') || !template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html is missing the prerender markers')
}

const assets = readdirSync('dist/assets')
const font = (prefix) => {
  const file = assets.find((name) => name.startsWith(prefix) && name.endsWith('.woff2'))
  if (!file) throw new Error(`No font asset starting with ${prefix}`)
  return `/assets/${file}`
}

const attr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const PAGES = {
  en: {
    path: '/',
    file: 'dist/index.html',
    dir: 'ltr',
    locale: 'en_US',
    fonts: [font('mona-sans-latin-wdth-normal')],
    jobTitles: ['SAP Consultant', 'Full-Stack Developer', 'System Administrator', 'IT Consultant'],
  },
  ar: {
    path: '/ar/',
    file: 'dist/ar/index.html',
    dir: 'rtl',
    locale: 'ar_IQ',
    fonts: [font('readex-pro-arabic-wght-normal')],
    jobTitles: ['استشاري SAP', 'مطوّر Full-Stack', 'مدير أنظمة', 'استشاري تقنية معلومات'],
  },
}

const KNOWS_ABOUT = [
  'SAP Business One',
  'SAP S/4HANA',
  'SAP HANA',
  'SAP Business One Service Layer',
  'ERP consulting',
  'ERP implementation',
  'Full-stack software development',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'System administration',
  'Windows Server',
  'Linux',
  'IT consulting',
  'Financial reporting',
  'Multi-company consolidation',
  'Crystal Reports',
  'Odoo',
  'ERPNext',
]

function structuredData(lang, page, c) {
  const url = origin + page.path
  const person = {
    '@type': 'Person',
    '@id': `${origin}/#person`,
    name: 'Mohammed Jawoad',
    alternateName: ['محمد جواد', 'Mohamed Jawoad', 'Mohammad Jawoad'],
    jobTitle: page.jobTitles,
    description: c.meta.description,
    url: `${origin}/`,
    image: `${origin}/og-image.png`,
    email: `mailto:${site.email}`,
    telephone: `+${site.whatsapp}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Baghdad', addressCountry: 'IQ' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Mustansiriyah University' },
    knowsLanguage: [
      { '@type': 'Language', name: 'Arabic', alternateName: 'ar' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
    ],
    knowsAbout: KNOWS_ABOUT,
    hasOccupation: [
      {
        '@type': 'Occupation',
        name: 'SAP Consultant',
        skills: 'SAP Business One, SAP HANA, SAP S/4HANA, Service Layer, Crystal Reports, ERP implementation',
        occupationLocation: { '@type': 'City', name: 'Baghdad' },
      },
      { '@type': 'Occupation', name: 'Full-Stack Developer', skills: 'TypeScript, React, Node.js, SQL, REST APIs' },
      {
        '@type': 'Occupation',
        name: 'System Administrator',
        skills: 'Windows Server, Linux, networking, virtualization, security, backup and disaster recovery',
      },
      { '@type': 'Occupation', name: 'IT Consultant' },
    ],
    sameAs: [site.linkedin, site.github],
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profile`,
    url,
    name: c.meta.title,
    description: c.meta.description,
    inLanguage: lang,
    dateModified: new Date().toISOString(),
    isPartOf: { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Mohammed Jawoad' },
    mainEntity: person,
  }
}

for (const [lang, page] of Object.entries(PAGES)) {
  const c = content[lang]
  const other = lang === 'en' ? 'ar' : 'en'
  const url = origin + page.path
  const image = `${origin}/og-image.png`
  const imageAlt = `${c.nav.brand}, ${c.hero.role}`
  const jsonLd = JSON.stringify(structuredData(lang, page, c)).replace(/</g, '\\u003c')

  const head = [
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="en" href="${origin}/" />`,
    `<link rel="alternate" hreflang="ar" href="${origin}/ar/" />`,
    `<link rel="alternate" hreflang="x-default" href="${origin}/" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    `<meta name="author" content="Mohammed Jawoad" />`,
    ...page.fonts.map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`),
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="Mohammed Jawoad" />`,
    `<meta property="og:title" content="${attr(c.meta.title)}" />`,
    `<meta property="og:description" content="${attr(c.meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${attr(imageAlt)}" />`,
    `<meta property="og:locale" content="${page.locale}" />`,
    `<meta property="og:locale:alternate" content="${PAGES[other].locale}" />`,
    `<meta property="profile:first_name" content="Mohammed" />`,
    `<meta property="profile:last_name" content="Jawoad" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(c.meta.title)}" />`,
    `<meta name="twitter:description" content="${attr(c.meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')

  const html = template
    .replace(/<html lang="[^"]*" dir="[^"]*">/, `<html lang="${lang}" dir="${page.dir}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${attr(c.meta.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${attr(c.meta.description)}" />`)
    .replace('<!--app-head-->', head)
    .replace('<div id="root"></div>', `<div id="root">${render(lang)}</div>`)

  mkdirSync(resolve(page.file, '..'), { recursive: true })
  writeFileSync(page.file, html)
  console.log(`Prerendered ${page.file} (${Math.round(html.length / 1024)} KB)`)
}

rmSync('dist-ssr', { recursive: true, force: true })
