import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// robots.txt and sitemap.xml are generated from VITE_SITE_URL in .env,
// so changing the domain only needs one edit.
function seoFiles(siteUrl: string): Plugin {
  const url = siteUrl.replace(/\/+$/, '')
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
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
  <url>
    <loc>${url}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${url}/" />
    <xhtml:link rel="alternate" hreflang="ar" href="${url}/?lang=ar" />
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  return {
    base: './',
    plugins: [react(), tailwindcss(), seoFiles(env.VITE_SITE_URL || 'https://mohammedjawoad.com')],
    build: {
      target: 'es2022',
      assetsInlineLimit: 0,
    },
  }
})
