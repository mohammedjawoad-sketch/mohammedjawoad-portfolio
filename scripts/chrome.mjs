import { existsSync } from 'node:fs'

// Chrome or Edge, used headless to print the CV and capture the preview image.
const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]

export function findChrome() {
  const found = candidates.find((path) => path && existsSync(path))
  if (!found) {
    console.error('Chrome or Edge was not found. Set CHROME_PATH to the browser executable and try again.')
    process.exit(1)
  }
  return found
}
