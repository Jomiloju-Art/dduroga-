/**
 * Product descriptions the client edits in a Google Sheet (client's request,
 * 30 Oct 2026). The sheet is published as CSV (File → Share → Publish to web)
 * and its link set as COPY_SHEET_CSV in Vercel. Columns, matched by header:
 *
 *   Key           the product's key; do not change (it is how rows are matched)
 *   Description   the write-up; edit freely. A blank cell keeps the site's text.
 *
 * Other columns (Product, Type, Page) are only there to help the client find a
 * product. Used by api/copy.js (live edits, no redeploy) and
 * scripts/build-catalog.mjs (bakes the sheet's text into each build).
 * Pure functions: no DOM, no network.
 */

const MAX = 3000;

/** RFC 4180 CSV: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const s = String(text || '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** One cell of client text, made safe to show: no tags, even spacing, a length cap. */
export const cleanCopy = (s) => String(s || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, MAX);

/** CSV text → { key: description } for every row with a key and some text. */
export function copyFromCsv(text) {
  const rows = parseCsv(text);
  const head = (rows[0] || []).map((h) => h.trim().toLowerCase());
  const k = head.indexOf('key');
  const d = head.findIndex((h) => h.startsWith('description'));
  if (k < 0 || d < 0) return {};
  const out = {};
  for (const r of rows.slice(1)) {
    const key = (r[k] || '').trim();
    const desc = cleanCopy(r[d]);
    if (key && desc) out[key] = desc;
  }
  return out;
}

/** Quote one value for CSV output. */
export const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
