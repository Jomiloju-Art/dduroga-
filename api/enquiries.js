/**
 * GET /api/enquiries?key=…&month=2026-10: the backup copies api/enquiry.js
 * saves before emailing each enquiry, newest first, with whether the email
 * went out (status: sent | failed | pending) and whether the customer's
 * receipt did (receipt: sent | failed | none).
 *
 * For finding an enquiry that did not arrive in the sales inbox. Same key as
 * api/stats.js (STATS_KEY); without it, or with the wrong key, this answers
 * 404. These hold customers' details: never share the link.
 */

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  const want = process.env.STATS_KEY;
  if (!want || req.query.key !== want) return res.status(404).end();
  if (!kvUrl || !kvToken) return res.status(503).json({ ok: false, error: 'no_store' });

  const month = /^\d{4}-\d{2}$/.test(String(req.query.month || '')) ? req.query.month : new Date().toISOString().slice(0, 7);
  const r = await fetch(`${kvUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['HGETALL', `enq:log:${month}`]]),
  });
  const [{ result = [] } = {}] = await r.json();
  const list = [];
  for (let i = 0; i + 1 < result.length; i += 2) {
    try { list.push({ id: result[i], ...JSON.parse(result[i + 1]) }); } catch { /* skip a damaged entry */ }
  }
  list.sort((a, b) => (a.id < b.id ? 1 : -1));

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, month, count: list.length, enquiries: list });
}
