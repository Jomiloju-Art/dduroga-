/**
 * POST /api/event: counts the actions that show buying intent, for the
 * monthly client report (api/stats.js reads them back).
 *
 * The page sends { e, s } with navigator.sendBeacon (src/lib/track.js):
 *   whatsapp, phone, email   a tap on a WhatsApp, tel: or mailto: link
 *   catalogue                the 2025 catalogue PDF downloaded
 *   product_view             a product page opened; s is the product slug
 * Quote and contact form sends are counted by api/enquiry.js itself, after
 * the email has gone, so they cannot be faked from here.
 *
 * Counts live in Upstash Redis (KV_REST_API_URL + KV_REST_API_TOKEN, the
 * same store the enquiry rate limits use), one hash per month:
 *   stats:2026-10            { whatsapp: 12, phone: 4, ... }
 *   stats:2026-10:products   { "f-224": 31, ... }
 * Kept for 400 days. Nothing about the visitor is stored. Without the store
 * this answers 204 and counts nothing.
 */

const EVENTS = new Set(['whatsapp', 'phone', 'email', 'catalogue', 'product_view']);
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
const PER_HOUR = 120;
const KEEP = String(400 * 86400);

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kv(commands) {
  const r = await fetch(`${kvUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  return r.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  if (!kvUrl || !kvToken) return res.status(204).end();

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const e = typeof body?.e === 'string' ? body.e : '';
  const s = typeof body?.s === 'string' ? body.s.toLowerCase() : '';
  if (!EVENTS.has(e) || (e === 'product_view' && !SLUG_RE.test(s))) return res.status(204).end();

  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim() || 'unknown';
  const hour = Math.floor(Date.now() / 3600000);
  const month = new Date().toISOString().slice(0, 7);

  try {
    // One connection cannot inflate the numbers: past PER_HOUR events in an
    // hour, the rest are dropped.
    const [lim] = await kv([['INCR', `ev:ip:${ip}:${hour}`], ['EXPIRE', `ev:ip:${ip}:${hour}`, '3600', 'NX']]);
    if (Number(lim?.result) > PER_HOUR) return res.status(204).end();

    const cmds = [['HINCRBY', `stats:${month}`, e, '1'], ['EXPIRE', `stats:${month}`, KEEP]];
    if (e === 'product_view') cmds.push(['HINCRBY', `stats:${month}:products`, s, '1'], ['EXPIRE', `stats:${month}:products`, KEEP]);
    await kv(cmds);
  } catch (err) {
    console.error('event', String(err));
  }
  return res.status(204).end();
}
