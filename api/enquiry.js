/**
 * POST /api/enquiry: the contact and quote forms send here, and this emails
 * the enquiry to the sales inbox through Resend.
 *
 * Every check runs here, not only in the page, because a bot can post to this
 * address directly:
 *   1. hidden trap field filled, or the form sent within 3 seconds of
 *      appearing: a bot. Answered "ok" so it does not learn to adapt.
 *   2. Cloudflare Turnstile token, when TURNSTILE_SECRET_KEY is set.
 *   3. at most 5 enquiries an hour from one connection, and DAILY_CAP a day
 *      in total (Resend's free plan sends 100 a day).
 *   4. field checks: a name, an email or phone, length limits, and no more
 *      than 2 web links (spam is mostly links).
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY         required to send. Without it this answers 503 and
 *                          the page falls back to the visitor's email app.
 *   ENQUIRY_TO             inbox, default sales@dduroga.com
 *   ENQUIRY_FROM           sender, e.g. "DDUROGA Website <website@dduroga.com>"
 *                          once the domain is verified in Resend. Default is
 *                          Resend's test sender, which only delivers to the
 *                          Resend account's own address.
 *   TURNSTILE_SECRET_KEY   with brand.turnstileSiteKey in src/data/brand.js
 *   KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + _TOKEN)
 *                          Upstash Redis from the Vercel Marketplace, free
 *                          tier. Makes the limits hold across all servers;
 *                          without it they are counted per server instance,
 *                          which still slows a flood but does not stop it.
 *   DAILY_CAP              total enquiries a day, default 90
 */

const TO = process.env.ENQUIRY_TO || 'sales@dduroga.com';
const FROM = process.env.ENQUIRY_FROM || 'DDUROGA Website <onboarding@resend.dev>';
const PER_HOUR = 5;
const DAILY_CAP = Number(process.env.DAILY_CAP) || 90;
const MIN_MS = 3000;

const LIMITS = { name: 100, company: 150, email: 200, phone: 40, interest: 150, message: 5000, notes: 5000, type: 40 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINK_RE = /(https?:\/\/|www\.|\[url|<a\s)/gi;

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const oneLine = (s) => s.replace(/[\r\n]+/g, ' ');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- counting (rate limits) ---------- */

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const memory = new Map();

/** Adds one to `key` (expiring after `ttl` seconds) and returns the new count. */
async function hit(key, ttl) {
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(ttl), 'NX']]),
      });
      const out = await r.json();
      const n = Number(out?.[0]?.result);
      if (Number.isFinite(n)) return n;
    } catch { /* fall through to memory */ }
  }
  const now = Date.now();
  const e = memory.get(key);
  if (!e || e.until < now) { memory.set(key, { n: 1, until: now + ttl * 1000 }); return 1; }
  e.n += 1;
  return e.n;
}

/* ---------- checks ---------- */

async function turnstileOk(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    return (await r.json()).success === true;
  } catch {
    return false;
  }
}

/** The cleaned enquiry, or { error } with a message for the visitor. */
function clean(body) {
  const f = {};
  for (const [k, n] of Object.entries(LIMITS)) f[k] = str(body[k], n);
  if (!f.name) return { error: 'Please enter your name.' };
  const phoneDigits = f.phone.replace(/\D/g, '').length;
  if (!f.email && phoneDigits < 7) return { error: 'Please give an email or a phone number so we can reply.' };
  if (f.email && !EMAIL_RE.test(f.email)) return { error: 'That email address looks invalid.' };
  if (f.phone && phoneDigits < 7) return { error: 'That phone number looks too short.' };

  const items = Array.isArray(body.items) ? body.items.slice(0, 200).map((i) => ({
    title: str(i?.title, 200), sku: str(i?.sku, 100), option: str(i?.option, 100),
    qty: Math.min(99999, Math.max(1, Math.round(Number(i?.qty)) || 1)),
  })).filter((i) => i.title) : [];

  const text = [f.name, f.company, f.interest, f.message, f.notes, ...items.map((i) => `${i.title} ${i.option}`)].join(' ');
  const links = (text.match(LINK_RE) || []).length;
  if (/(https?:\/\/|www\.)/i.test(f.name + f.company)) return { error: 'Please remove web links from your name and company.' };
  if (links > 2) return { error: 'Please remove the web links from your message, or call us.' };
  return { f, items };
}

/* ---------- email ---------- */

function compose({ f, items }) {
  const isQuote = items.length > 0;
  const subject = oneLine(isQuote
    ? `Quote request from ${f.name}${f.company ? `, ${f.company}` : ''} (${items.length} product${items.length === 1 ? '' : 's'})`
    : `Website enquiry from ${f.name}${f.company ? `, ${f.company}` : ''}`).slice(0, 200);

  const rows = [
    ['Name', f.name], ['Company', f.company], ['Email', f.email], ['Phone / WhatsApp', f.phone],
    ['Interested in', f.interest],
  ].filter(([, v]) => v);
  const note = f.message || f.notes;
  const units = items.reduce((n, i) => n + i.qty, 0);

  const text = [
    `${isQuote ? 'Quote request' : 'Enquiry'} from the DDUROGA website`, '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(items.length ? ['', `Products (${items.length}, ${units} units):`, ...items.map((i) => `- ${i.qty} x ${i.title}${i.option ? ` (size/colour: ${i.option})` : ''}${i.sku ? ` [SKU ${i.sku}]` : ''}`)] : []),
    ...(note ? ['', isQuote ? 'Notes:' : 'Message:', note] : []),
    '', f.email ? 'Reply to this email to answer the customer directly.' : 'No email given: reply by phone or WhatsApp.',
  ].join('\n');

  const td = 'padding:6px 12px;border-bottom:1px solid #eee;vertical-align:top';
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;max-width:640px">
<h2 style="font-size:18px;margin:0 0 12px">${isQuote ? 'Quote request' : 'Enquiry'} from the DDUROGA website</h2>
<table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="${td};color:#666;width:150px">${esc(k)}</td><td style="${td}">${esc(v)}</td></tr>`).join('')}</table>
${items.length ? `<h3 style="font-size:15px;margin:20px 0 8px">Products (${items.length}, ${units} units)</h3>
<table style="border-collapse:collapse;width:100%"><tr><th style="${td};text-align:left">Qty</th><th style="${td};text-align:left">Product</th><th style="${td};text-align:left">Size / colour</th><th style="${td};text-align:left">SKU</th></tr>
${items.map((i) => `<tr><td style="${td}">${i.qty}</td><td style="${td}">${esc(i.title)}</td><td style="${td}">${esc(i.option)}</td><td style="${td}">${esc(i.sku)}</td></tr>`).join('')}</table>` : ''}
${note ? `<h3 style="font-size:15px;margin:20px 0 8px">${isQuote ? 'Notes' : 'Message'}</h3><p style="white-space:pre-wrap;margin:0">${esc(note)}</p>` : ''}
<p style="color:#666;margin-top:24px">${f.email ? 'Reply to this email to answer the customer directly.' : 'No email given: reply by phone or WhatsApp.'}</p>
</div>`;
  return { subject, text, html };
}

/* ---------- handler ---------- */

export default async function handler(req, res) {
  const send = (status, data) => res.status(status).json(data);
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { ok: false }); }
  if (!process.env.RESEND_API_KEY) return send(503, { ok: false, error: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return send(400, { ok: false, message: 'Something went wrong. Please try again.' });
  if (JSON.stringify(body).length > 100000) return send(413, { ok: false, message: 'That request is too long. Please call or email us instead.' });

  // 1. Bots: answered "ok" and dropped.
  const guard = body.guard && typeof body.guard === 'object' ? body.guard : {};
  if (guard.trap || !(Number(guard.elapsedMs) >= MIN_MS)) return send(200, { ok: true });

  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim() || 'unknown';

  // 2. Bot check.
  if (!(await turnstileOk(str(guard.token, 4096), ip))) {
    return send(403, { ok: false, message: 'The security check did not pass. Please reload the page and try again, or call us.' });
  }

  // 4. Fields (before counting, so a typo does not use up an attempt).
  const c = clean(body);
  if (c.error) return send(422, { ok: false, message: c.error });

  // 3. Limits.
  const hour = Math.floor(Date.now() / 3600000);
  const day = new Date().toISOString().slice(0, 10);
  if ((await hit(`enq:ip:${ip}:${hour}`, 3600)) > PER_HOUR) {
    return send(429, { ok: false, message: 'You have sent several enquiries in the last hour. Please try again later, or call or WhatsApp us.' });
  }
  if ((await hit(`enq:day:${day}`, 90000)) > DAILY_CAP) {
    return send(429, { ok: false, message: 'We could not take your enquiry online just now. Please call or WhatsApp us, or email us directly.' });
  }

  // A failed send answers 503, like "not configured", so the page falls back
  // to the visitor's email app and the enquiry is not lost.
  const mail = compose(c);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: TO.split(',').map((s) => s.trim()).filter(Boolean),
        ...(c.f.email ? { reply_to: c.f.email } : {}),
        subject: mail.subject, text: mail.text, html: mail.html,
      }),
    });
    if (!r.ok) {
      console.error('resend', r.status, (await r.text()).slice(0, 300));
      return send(503, { ok: false, error: 'send_failed' });
    }
  } catch (e) {
    console.error('resend', String(e));
    return send(503, { ok: false, error: 'send_failed' });
  }
  return send(200, { ok: true });
}
