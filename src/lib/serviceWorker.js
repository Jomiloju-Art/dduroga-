/**
 * Service worker: deliberately none.
 *
 * This used to register /sw.js, but no such file has ever shipped: the live
 * site answers /sw.js with index.html, so every visit logged a failed
 * registration (Oct 2026 audit). Rather than ship an untested offline cache,
 * the registration is gone, and any worker a browser may still hold from an
 * earlier build is removed so it cannot serve stale assets.
 *
 * If offline support is wanted later, add a real public/sw.js (e.g. with
 * vite-plugin-pwa) and register it here again.
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}
