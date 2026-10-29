/**
 * GET /api/health: the daily check that the contact and quote forms still
 * work end to end, run by Vercel Cron (vercel.json "crons", 07:00 UTC =
 * 08:00 in Lagos). Both of October 2026's silent outages (Resend still in
 * test mode; the Turnstile widget not allowing dduroga.com) would have been
 * caught on day one.
 *
 * Checks:
 *   store     Upstash answers (the rate limits and enquiry backups live there)
 *   sending   Resend accepts an email from the real sender (ENQUIRY_FROM) to
 *             its test inbox delivered@resend.dev: proves the API key and the
 *             verified domain without filling anyone's inbox
 *   problems  in the last two days: failed sends (api/enquiry.js), failed
 *             receipts, the security check erroring or hanging in visitors'
 *             browsers, and forms falling back to the email app (counted by
 *             src/components/SpamGuard.jsx and src/lib/enquiry.js through
 *             api/event.js)
 *
 * Anything wrong emails ALERT_TO (comma-separated) and answers 500, which
 * also shows as a failed run under Vercel → Project → Settings → Cron Jobs.
 * Needs CRON_SECRET: Vercel sends it as "Authorization: Bearer …" on cron
 * runs; any other caller gets 404.
 */

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const FROM = process.env.ENQUIRY_FROM || 'DDUROGA Website <onboarding@resend.dev>';

const PROBLEMS = {
  send_failed: 'enquiry emails failed to send (the visitor was offered their email app; the enquiry is in /api/enquiries)',
  confirm_failed: 'customer receipts failed to send',
  turnstile_error: 'visitors hit an error in the forms’ security check (Cloudflare Turnstile: check the widget’s hostnames)',
  turnstile_timeout: 'visitors waited 15+ seconds for the security check and were sent to their email app',
  fallback_used: 'enquiries were handed to the visitor’s email app instead of being sent',
};

async function kv(commands) {
  const r = await fetch(`${kvUrl}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`store answered ${r.status}`);
  return r.json();
}

async function email(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Resend answered ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(404).end();

  const issues = [];
  const day = (d) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

  if (!kvUrl || !kvToken) issues.push('The store (Upstash) is not configured.');
  else {
    try {
      const out = await kv([['PING'], ['HGETALL', `health:${day(0)}`], ['HGETALL', `health:${day(1)}`]]);
      if (out[0]?.result !== 'PONG') issues.push('The store (Upstash) did not answer.');
      const totals = {};
      for (const { result = [] } of out.slice(1)) {
        for (let i = 0; i + 1 < result.length; i += 2) totals[result[i]] = (totals[result[i]] || 0) + Number(result[i + 1]);
      }
      for (const [k, n] of Object.entries(totals)) if (n > 0 && PROBLEMS[k]) issues.push(`${n} × ${PROBLEMS[k]}.`);
    } catch (e) {
      issues.push(`The store (Upstash) failed: ${String(e)}.`);
    }
  }

  if (!process.env.RESEND_API_KEY) issues.push('RESEND_API_KEY is not set: no enquiry can be emailed.');
  else {
    try {
      await email({ from: FROM, to: ['delivered@resend.dev'], subject: 'DDUROGA daily health check', text: 'Automated check from api/health.js. No action needed.' });
    } catch (e) {
      issues.push(`Test send failed, so enquiry emails are probably failing too. ${String(e)}`);
    }
  }

  if (issues.length && process.env.ALERT_TO && process.env.RESEND_API_KEY) {
    const to = process.env.ALERT_TO.split(',').map((s) => s.trim()).filter(Boolean);
    const text = ['The dduroga.com daily check found problems with the contact and quote forms:', '', ...issues.map((i) => `- ${i}`), '', 'Enquiries are backed up at https://dduroga.com/api/enquiries?key=<STATS_KEY>'].join('\n');
    try { await email({ from: FROM, to, subject: `dduroga.com: ${issues.length} problem${issues.length === 1 ? '' : 's'} with the enquiry forms`, text }); }
    catch (e) { console.error('alert', String(e)); }
  }

  console.log('health', issues.length ? issues : 'ok');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(issues.length ? 500 : 200).json({ ok: issues.length === 0, issues });
}
