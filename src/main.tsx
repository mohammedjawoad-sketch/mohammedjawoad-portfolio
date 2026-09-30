import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { I18nProvider } from './i18n'
import './index.css'
import { ThemeProvider } from './theme'

// ?og=1 renders a clean hero for the social preview image (see scripts/og-image.mjs).
if (new URLSearchParams(window.location.search).has('og')) {
  document.documentElement.classList.add('og')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
