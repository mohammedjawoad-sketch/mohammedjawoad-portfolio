// Captures the social preview image (public/og-image.png, 1200x630) from the
// built site, plus the iOS home-screen icon (public/apple-touch-icon.png).
// Usage: npm run build && npm run og && npm run build
// (the second build copies the new images into dist/)
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { findChrome } from './chrome.mjs'

if (!existsSync('dist/index.html')) {
  console.error('Build the site first: npm run build')
  process.exit(1)
}

const chrome = findChrome()
const port = 4179
const url = `http://127.0.0.1:${port}/?og=1&lang=en`

const server = spawn(process.execPath, [resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
  stdio: 'ignore',
})

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('Preview server did not start')
}

function capture(target, output, size, extra = []) {
  const profile = mkdtempSync(join(tmpdir(), 'og-chrome-'))
  try {
    execFileSync(
      chrome,
      [
        '--headless=new',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${profile}`,
        '--hide-scrollbars',
        // Software WebGL so the particle field renders without a GPU.
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        `--window-size=${size}`,
        '--virtual-time-budget=6000',
        ...extra,
        `--screenshot=${output}`,
        target,
      ],
      { stdio: 'ignore' },
    )
  } finally {
    rmSync(profile, { recursive: true, force: true })
  }
  console.log(`Wrote ${output}`)
}

// Headless Chrome has a minimum window width, so the icon is rendered at 512px
// from a copy of the favicon with explicit dimensions. iOS scales it down.
function captureIcon() {
  const dir = mkdtempSync(join(tmpdir(), 'icon-'))
  try {
    const svg = readFileSync('public/favicon.svg', 'utf8').replace('<svg ', '<svg width="512" height="512" ')
    const file = join(dir, 'icon.svg')
    writeFileSync(file, svg)
    capture(pathToFileURL(file).href, resolve('public/apple-touch-icon.png'), '512,512', [
      '--default-background-color=0B1333FF',
    ])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

try {
  await waitForServer()
  capture(url, resolve('public/og-image.png'), '1200,630')
  captureIcon()
} finally {
  server.kill()
}
