/**
 * Service-worker registration.
 *
 * Kept out of main.jsx on purpose: main.jsx runs the critical path (render,
 * boot-loader dismissal, input-method tracking) and every statement added there
 * is a statement between the visitor and the first paint. A worker is a
 * background concern, so it is registered on `load` — after the page is
 * interactive — and it is fire-and-forget.
 *
 * WHY NOT register in dev:
 *   `vite dev` serves modules from memory with no cache-busting hash on the
 *   module graph, so a worker that cache-first's /assets/* would serve a stale
 *   module and make HMR appear broken. Vite's own guidance is to keep the worker
 *   out of development entirely; the build preview (vite preview) and production
 *   both get it.
 *
 * WHY THE RELOAD GUARD:
 *   A worker takes control of the page only after it activates. On the very first
 *   visit it installs and activates but does NOT control the document that
 *   installed it, so a visitor gets no offline benefit until their second load.
 *   `controllerchange` fires when this client is claimed; reloading once at that
 *   moment gives the first visit the same behaviour as every later one. Guarded
 *   with a flag so the reload can only happen once per page lifetime.
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      // A failed registration is never fatal: the site works without a worker,
      // it just has no offline behaviour. Logged, not surfaced to the visitor.
      console.warn('[DDUROGA] service worker registration failed:', err);
    });
  });
}
