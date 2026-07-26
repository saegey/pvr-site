import './src/styles/global.css'
import rootWrapper from './rootWrapper'
export const wrapPageElement = rootWrapper

// Hard cleanup for the retired gatsby-plugin-offline service worker. The plugin
// swap unregisters it via /sw.js, but this also runs in-page to tear down any
// lingering SW and purge its Workbox caches, so a stale bundle (e.g. old shop
// product keys) can never keep being served. Safe to remove once traffic has
// cycled off the old service worker.
export const onClientEntry = () => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations?.()
      .then(regs => regs.forEach(r => r.unregister()))
      .catch(() => {})
  }
  if (typeof window !== 'undefined' && window.caches?.keys) {
    window.caches
      .keys()
      .then(keys => keys.forEach(k => window.caches.delete(k)))
      .catch(() => {})
  }
}
