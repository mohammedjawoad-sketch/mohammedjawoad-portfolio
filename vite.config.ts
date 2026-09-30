import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// robots.txt and sitemap.xml are generated from VITE_SITE_URL in .env,
// so changing the domain only needs one edit.
function seoFiles(siteUrl: string): Plugin {
  const url = siteUrl.replace(/\/+$/, '')
  const today = new Date().toISOString().slice(0, 10)
  const alternates = `
    <xhtml:link rel="alternate" hreflang="en" href="${url}/" />
    <xhtml:link rel="alternate" hreflang="ar" href="${url}/ar/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}/" />`
  const entry = (path: string, priority: string) => `  <url>
    <loc>${url}${path}</loc>${alternates}
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle(options) {
      // Only for the browser build, not the prerender (SSR) build.
      if (options.dir && /dist-ssr/.test(options.dir)) return
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry('/', '1.0')}
${entry('/ar/', '0.9')}
</urlset>
`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  return {
    // Absolute paths: pages are served from / and /ar/.
    base: '/',
    plugins: [react(), tailwindcss(), seoFiles(env.VITE_SITE_URL || 'https://mohammedjawoad.me')],
    build: {
      target: 'es2022',
      assetsInlineLimit: 0,
    },
  }
})
