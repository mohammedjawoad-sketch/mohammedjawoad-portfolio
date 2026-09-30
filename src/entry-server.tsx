// Server entry used only at build time: scripts/prerender.mjs renders the page
// to static HTML for each language, so the content is readable without JavaScript.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { ar } from './content/ar'
import { en } from './content/en'
import type { Lang } from './content/types'
import { I18nProvider } from './i18n'
import { site } from './site.config'
import { ThemeProvider } from './theme'

export const content = { en, ar }
export { site }

export function render(lang: Lang) {
  return renderToString(
    <StrictMode>
      <ThemeProvider>
        <I18nProvider initialLang={lang}>
          <App />
        </I18nProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
