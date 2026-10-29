/**
 * Counts an action for the monthly client report (api/event.js). Fire and
 * forget: sendBeacon survives the page being left, which a WhatsApp or tel:
 * tap usually does. Nothing is sent in development.
 */
export function track(e, s) {
  if (import.meta.env.DEV || typeof navigator === 'undefined') return;
  try {
    const body = JSON.stringify(s ? { e, s } : { e });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))) return;
    fetch('/api/event', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  } catch { /* never break a click over a count */ }
}

/**
 * One listener for every contact link on the site (top bar, footer, the
 * floating WhatsApp button, product pages), so new links are counted without
 * wiring each one.
 */
export function trackContactClicks() {
  document.addEventListener('click', (ev) => {
    const a = ev.target instanceof Element && ev.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) track('whatsapp');
    else if (/^tel:/i.test(href)) track('phone');
    else if (/^mailto:/i.test(href)) track('email');
    else if (/\/catalogues\/.+\.pdf$/i.test(href)) track('catalogue');
  }, { capture: true });
}
