# Mohammed Jawoad, personal site

A one-page marketing site for SAP Business One, SAP S/4HANA, Odoo and ERPNext consulting.
English and Arabic (right-to-left), with an animated WebGL particle background.

Built with React 19, TypeScript, Vite, Tailwind CSS 4 and Motion. The particle
field is plain WebGL2 (no three.js), so the page stays light.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Add `?lang=ar` to the address to open the Arabic version directly.

## Edit the content

| What | Where |
| --- | --- |
| All English text | `src/content/en.ts` |
| All Arabic text | `src/content/ar.ts` |
| Email, WhatsApp, LinkedIn, case-studies link | `src/site.config.ts` |
| Domain (canonical link, LinkedIn preview, sitemap) | `.env` (`VITE_SITE_URL`) |
| Your CV | `cv/cv.html` (kept local, out of the repository), then `npm run cv:pdf`: it writes `cv/Mohammed-Jawoad-Ali-CV.pdf` and copies it to `public/Mohammed-Jawoad-CV.pdf`, the file behind the site's "Download CV" buttons |

Both language files have the same shape; TypeScript flags anything missing.

## Build

```bash
npm run build      # type-checks, then writes the site to dist/
```

`dist/` is a plain static site: `index.html`, an `assets/` folder, icons, the
LinkedIn preview image, `robots.txt`, `sitemap.xml` and `.htaccess`. It works
from any web host.

## Publish on GoDaddy (cPanel hosting)

1. Buy the domain (for example `mohammedjawoad.com`). If you pick a different
   one, set it in `.env` and run `npm run build` again.
2. In cPanel, add the domain (Domains > Create a new domain). Note its document
   root, usually `public_html` for the main domain.
3. Open File Manager in that folder and upload **everything inside `dist/`**,
   not the `dist` folder itself. Include `.htaccess` (enable "Show hidden files").
4. In cPanel > SSL/TLS Status, run AutoSSL so the site gets a free certificate.
5. Once `https://` works, open `.htaccess` and remove the `#` in front of the
   three `Rewrite...` lines to send every visitor to the secure address.

Other hosts work the same way: upload the contents of `dist/`. Cloudflare Pages
is a free alternative: create a project, upload `dist/`, then point the domain's
DNS at it.

## Link it from LinkedIn

- **Contact info > Website**: add the address with the type "Portfolio".
- **Featured > Add a link**: LinkedIn shows `og-image.png` as the preview card.
- Link straight to the form with `https://your-domain/#contact`, or to the
  Arabic version with `https://your-domain/?lang=ar`.
- After publishing, paste the address into LinkedIn's Post Inspector
  (linkedin.com/post-inspector) so it picks up the preview image. Run it again
  whenever you change the image.

## Regenerate the images

```bash
npm run build && npm run og && npm run build
```

`npm run og` serves the built site, captures the hero at 1200x630 into
`public/og-image.png` and renders `public/apple-touch-icon.png` from the
favicon. The second build copies them into `dist/`. It needs Chrome or Edge;
set `CHROME_PATH` if they are installed somewhere unusual.

## How the particle background works

`src/particles/shaders.ts` defines five formations (galaxy, globe, hub, waves,
ring) as functions of two random seeds per particle. Each section declares the
one it wants with `data-formation`, and the vertex shader blends between them
as you scroll. The pointer pushes particles aside, and a click on empty space
sends a ripple.

It respects "reduce motion" settings (a still frame, no ripple), lowers
resolution or particle count on slow devices, pauses in background tabs, and
falls back to a static gradient where WebGL2 is unavailable.
