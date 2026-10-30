/**
 * GET /api/copy: the product descriptions from the client's Google Sheet, as
 * { copy: { key: description } } (src/lib/copySheet.js). The product page
 * applies them, so an edit shows within about five minutes without a
 * redeploy; each build also bakes the sheet's text into the pages.
 *
 * Environment variable (Vercel → Project → Settings → Environment Variables):
 *   COPY_SHEET_CSV   the sheet's "Publish to web" CSV link. Without it, or
 *                    when Google cannot be reached, the answer is empty and
 *                    the pages keep the text they were built with.
 *
 * Cached at Vercel's edge for five minutes, so visitors never wait on Google
 * and the sheet is read at most a few times an hour.
 */
import { copyFromCsv } from '../src/lib/copySheet.js';

const TIMEOUT_MS = 6000;

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  const url = process.env.COPY_SHEET_CSV;
  const cache = (seconds) => {
    res.setHeader('Vercel-CDN-Cache-Control', `s-maxage=${seconds}, stale-while-revalidate=86400`);
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  };
  if (!url) { cache(300); return res.status(200).json({ copy: {} }); }
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'follow' });
    if (!r.ok) throw new Error(`sheet answered ${r.status}`);
    const copy = copyFromCsv(await r.text());
    cache(300);
    return res.status(200).json({ copy });
  } catch (e) {
    console.error('copy sheet:', e.message);
    cache(60);
    return res.status(200).json({ copy: {} });
  }
}
