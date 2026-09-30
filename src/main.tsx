import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { I18nProvider, langFromPath } from './i18n'
import './index.css'
import { ThemeProvider } from './theme'

const params = new URLSearchParams(window.location.search)

// Links shared before the Arabic page had its own address used ?lang=ar.
if (params.get('lang') === 'ar' && langFromPath(window.location.pathname) !== 'ar') {
  window.location.replace('/ar/' + window.location.hash)
} else {
  // ?og=1 renders a clean hero for the social preview image (see scripts/og-image.mjs).
  if (params.has('og')) document.documentElement.classList.add('og')

  const app = (
    <StrictMode>
      <ThemeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ThemeProvider>
    </StrictMode>
  )
  const root = document.getElementById('root')!
  // Built pages arrive prerendered (scripts/prerender.mjs); the dev server does not.
  if (root.firstElementChild) hydrateRoot(root, app)
  else createRoot(root).render(app)
}
