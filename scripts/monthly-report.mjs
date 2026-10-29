/**
 * Monthly client report: one A4 page of the month's numbers, as HTML and PDF.
 *
 *   STATS_KEY=… node scripts/monthly-report.mjs 2026-11 \
 *     --visitors 820 --pageviews 3100 --impressions 5400 --clicks 140
 *
 * Contact taps, enquiries and top products come from /api/stats (the counts
 * api/event.js and api/enquiry.js keep). Visitors and page views are read off
 * Vercel → Analytics, impressions and clicks off Search Console →
 * Performance, and passed in as flags: neither has an API on the free plans.
 * A flag left out shows as "–".
 *
 * Writes reports/DDUROGA-report-YYYY-MM.html, and the PDF beside it when
 * Microsoft Edge is installed (headless print). reports/ is not committed.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { catalog } from '../src/data/catalog.slim.generated.js';

const SITE = 'https://dduroga.com';
const args = process.argv.slice(2);
const month = args.find((a) => /^\d{4}-\d{2}$/.test(a)) || new Date().toISOString().slice(0, 7);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  const n = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(n) ? n : null;
};
const key = process.env.STATS_KEY;
if (!key) { console.error('Set STATS_KEY (the value in Vercel → Settings → Environment Variables).'); process.exit(1); }

const r = await fetch(`${SITE}/api/stats?key=${encodeURIComponent(key)}&month=${month}`);
if (!r.ok) { console.error(`/api/stats answered ${r.status}`); process.exit(1); }
const { events = {}, topProducts = [] } = await r.json();

const titles = new Map(Object.values(catalog).flat().map((p) => [p.slug, p.fullTitle || p.title]));
const fmt = (n) => (n == null ? '–' : n.toLocaleString('en-NG'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const monthName = new Date(`${month}-01T00:00:00Z`).toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const enquiries = (events.quote_sent || 0) + (events.enquiry_sent || 0);
const taps = (events.whatsapp || 0) + (events.phone || 0) + (events.email || 0);
const tiles = [
  ['Visitors', flag('visitors')],
  ['Page views', flag('pageviews')],
  ['Enquiries sent', enquiries],
  ['WhatsApp, call & email taps', taps],
];
const rows = [
  ['Quote requests (with products)', events.quote_sent || 0],
  ['Contact form messages', events.enquiry_sent || 0],
  ['WhatsApp taps', events.whatsapp || 0],
  ['Phone taps', events.phone || 0],
  ['Email taps', events.email || 0],
  ['Catalogue PDF downloads', events.catalogue || 0],
  ['Product pages viewed', events.product_view || 0],
  ['Google: times shown in search', flag('impressions')],
  ['Google: clicks from search', flag('clicks')],
];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>DDUROGA website report, ${esc(monthName)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font: 13px/1.5 'Segoe UI', Arial, sans-serif; color: #0e1216; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #F39019; padding-bottom: 10px; }
  h1 { font-size: 22px; margin: 0; } h2 { font-size: 15px; margin: 22px 0 8px; }
  .muted { color: #5b6470; }
  .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 18px; }
  .tile { border: 1px solid #e3e6ea; border-radius: 8px; padding: 12px; }
  .tile b { display: block; font-size: 24px; color: #2F3974; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 6px 8px; border-bottom: 1px solid #eceff2; text-align: left; }
  td:last-child, th:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  footer { margin-top: 24px; font-size: 11px; }
</style></head><body>
<header><div><h1>Website report: ${esc(monthName)}</h1><div class="muted">DDUROGA Safety · dduroga.com</div></div>
<div class="muted">Prepared ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div></header>
<div class="tiles">${tiles.map(([k, v]) => `<div class="tile"><b>${fmt(v)}</b>${esc(k)}</div>`).join('')}</div>
<h2>Enquiries and contact</h2>
<table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${fmt(v)}</td></tr>`).join('')}</table>
<h2>Most viewed products</h2>
${topProducts.length ? `<table><tr><th>#</th><th>Product</th><th>Views</th></tr>${topProducts.slice(0, 10).map((p, i) => `<tr><td>${i + 1}</td><td>${esc(titles.get(p.slug) || p.slug)}</td><td>${fmt(p.views)}</td></tr>`).join('')}</table>` : '<p class="muted">No product views recorded this month.</p>'}
<footer class="muted">Visitors and page views: Vercel Web Analytics. Search figures: Google Search Console. Enquiries, taps and product views: counted by the website. Counts are of actions, not of people.</footer>
</body></html>`;

mkdirSync('reports', { recursive: true });
const out = resolve(`reports/DDUROGA-report-${month}`);
writeFileSync(`${out}.html`, html);
console.log(`wrote ${out}.html`);

const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
if (edge) {
  execFileSync(edge, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${out}.pdf`, `file:///${out.replace(/\\/g, '/')}.html`], { stdio: 'ignore' });
  console.log(`wrote ${out}.pdf`);
}
