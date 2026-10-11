import { brand } from '../data/brand.js';

/** Build a mailto: link carrying an enquiry as the body. */
export const mailtoHref = (subject, body) =>
  `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * Submit an enquiry to the configured endpoint, or fall back to a mailto.
 * Returns { ok, endpoint, mailto } - callers show success or the mailto link.
 */
export async function sendEnquiry(payload, subject) {
  const ep = (brand.enquiryEndpoint || '').trim();
  if (!ep) {
    const body = Object.entries(payload)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.map((i) => i.title || i).join(', ') : v}`)
      .join('\n');
    return { ok: true, endpoint: false, mailto: mailtoHref(subject, body) };
  }
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, site: brand.name, submittedAt: new Date().toISOString() }),
    });
    return { ok: res.ok, endpoint: true };
  } catch (e) {
    return { ok: false, endpoint: true, error: String(e) };
  }
}
