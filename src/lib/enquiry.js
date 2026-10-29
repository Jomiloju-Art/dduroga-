import { brand } from '../data/brand.js';

/** Build a mailto: link carrying an enquiry as the body. */
export const mailtoHref = (subject, body) =>
  `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** The enquiry as a mailto link plus plain text (for "Copy request"). */
function mailtoFallback(payload, subject) {
  // One line per product with quantity, size/colour and SKU: the earlier
  // body listed titles only, so the quantities a buyer set were lost.
  const line = (i) => (typeof i === 'object'
    ? `- ${i.qty || 1} x ${i.title}${i.option ? ` (size/colour: ${i.option})` : ''}${i.sku ? ` [SKU ${i.sku}]` : ''}`
    : `- ${i}`);
  const body = Object.entries(payload)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => (Array.isArray(v) ? `${k}:\n${v.map(line).join('\n')}` : `${k}: ${v}`))
    .join('\n');
  // `text` lets the page offer a copy: some email apps refuse a long mailto
  // link, and office PCs often have no email app set up at all.
  return { ok: true, endpoint: false, mailto: mailtoHref(subject, body), text: `${subject}\n\n${body}` };
}

/**
 * Send an enquiry to brand.enquiryEndpoint (api/enquiry.js), which emails it
 * to the sales inbox. `guard` carries the spam checks from useSpamGuard():
 * the hidden trap field, time on the form and the Turnstile token.
 *
 * Returns { ok, endpoint, mailto?, text?, message? }:
 *   ok + endpoint       sent; the page says thank you
 *   ok + mailto         no sending service yet (no endpoint, or the function
 *                       answers "not configured"): the visitor sends it from
 *                       their own email app, as before
 *   !ok + message       refused (too many enquiries, a link-filled message,
 *                       the bot check); the message says why
 *   !ok, no message     network failure; the page offers a retry and the phone
 */
export async function sendEnquiry(payload, subject, guard = {}) {
  const ep = (brand.enquiryEndpoint || '').trim();
  // No endpoint, or the bot check could not run (the server would refuse the
  // enquiry without its token): the visitor's email app, so it is not lost.
  if (!ep || guard.unavailable) return mailtoFallback(payload, subject);

  // A sending service that never answers would leave the button on
  // "Sending…" for good, so give up after 20 seconds.
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl && setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(ep, {
      signal: ctrl?.signal,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, guard }),
    });
    // Sending not set up yet (no email key on the server), or the function is
    // missing (a local preview): fall back to the visitor's email app rather
    // than failing.
    if (res.status === 503 || res.status === 404 || res.status === 405) return mailtoFallback(payload, subject);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok !== false, endpoint: true, message: data.message || '' };
  } catch (e) {
    return { ok: false, endpoint: true, error: String(e) };
  } finally {
    clearTimeout(timer);
  }
}
