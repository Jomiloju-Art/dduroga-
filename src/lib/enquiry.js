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
    // One line per product with quantity, size/colour and SKU: the earlier
    // body listed titles only, so the quantities a buyer set were lost.
    const line = (i) => (typeof i === 'object'
      ? `- ${i.qty || 1} x ${i.title}${i.option ? ` (size/colour: ${i.option})` : ''}${i.sku ? ` [SKU ${i.sku}]` : ''}`
      : `- ${i}`);
    const body = Object.entries(payload)
      .filter(([, v]) => v !== '' && v != null)
      .map(([k, v]) => (Array.isArray(v) ? `${k}:\n${v.map(line).join('\n')}` : `${k}: ${v}`))
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
