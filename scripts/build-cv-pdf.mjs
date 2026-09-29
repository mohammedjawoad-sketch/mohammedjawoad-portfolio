// Prints cv/cv.html to cv/Mohammed-Jawoad-Ali-CV.pdf with headless Chrome.
// The PDF is for your own use; it is not published with the website.
// Usage: npm run cv:pdf
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { findChrome } from './chrome.mjs'

const chrome = findChrome()
const input = pathToFileURL(resolve('cv/cv.html')).href
const output = resolve('cv/Mohammed-Jawoad-Ali-CV.pdf')
const profile = mkdtempSync(join(tmpdir(), 'cv-chrome-'))

try {
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${profile}`,
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=3000',
      `--print-to-pdf=${output}`,
      input,
    ],
    { stdio: 'inherit' },
  )
} finally {
  rmSync(profile, { recursive: true, force: true })
}

console.log(`Wrote ${output} (${Math.round(statSync(output).size / 1024)} KB)`)
