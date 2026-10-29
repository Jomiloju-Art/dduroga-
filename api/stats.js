/**
 * GET /api/stats?key=…&month=2026-10: the month's counts from api/event.js
 * and api/enquiry.js, for the monthly client report
 * (scripts/monthly-report.mjs).
 *
 * Needs STATS_KEY (Vercel → Project → Settings → Environment Variables);
 * without it, or with the wrong key, this answers 404 so the address does
 * not advertise itself.
 */

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const pairs = (flat) => {
  const out = {};
  for (let i = 0; i + 1 < (flat || []).length; i += 2) out[flat[i]] = Number(flat[i + 1]) || 0;
  return out;
};

export default async function handler(req, res) {
  const want = process.env.STATS_KEY;
  if (!want || req.query.key !== want) return res.status(404).end();
  if (!kvUrl || !kvToken) return res.status(503).json({ ok: false, error: 'no_store' });

  const month = /^\d{4}-\d{2}$/.test(String(req.query.month || '')) ? req.query.month : new Date().toISOString().slice(0, 7);
  const r = await fetch(`${kvUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['HGETALL', `stats:${month}`], ['HGETALL', `stats:${month}:products`]]),
  });
  const [events, products] = await r.json();
  const top = Object.entries(pairs(products?.result))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([slug, views]) => ({ slug, views }));

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, month, events: pairs(events?.result), topProducts: top });
}
