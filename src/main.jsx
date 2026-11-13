import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Registers the service worker; registerType: 'autoUpdate' means new
// versions are installed and activated automatically in the background.
// A new SW taking control doesn't retroactively fix a tab that's already
// loaded — it's still running old JS that references old asset hashes
// which no longer exist post-deploy (the server's SPA rewrite serves
// index.html for those, which the browser rejects as a module script).
// So force a reload once the new version is ready, and check for one every
// few minutes and whenever the tab/app comes back into view, so a deploy
// reaches open tabs quickly.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) return
    const check = () => registration.update().catch(() => {})
    setInterval(check, 5 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check()
    })
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
