/**
 * Writes the starting rows for the client's description sheet
 * (src/lib/copySheet.js): one row per product with its current text, for
 * importing into Google Sheets (File → Import → Upload).
 *
 *   node scripts/export-copy-sheet.mjs [out.csv]     (default: reports/product-descriptions.csv)
 *
 * Run after `npm run build` so the text is the corrected text the site shows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || path.join(root, 'reports/product-descriptions.csv'));
const { catalog, zoneMeta, rangeMeta } = await import(pathToFileURL(path.join(root, 'src/data/catalog.slim.generated.js')).href);
const { csvCell } = await import(pathToFileURL(path.join(root, 'src/lib/copySheet.js')).href);

const zoneLabel = Object.fromEntries((Array.isArray(zoneMeta) ? zoneMeta : Object.values(zoneMeta)).map((z) => [z.id, z.label]));
const rangeLabel = Object.fromEntries(rangeMeta.map((r) => [r.id, r.label]));
const rows = [['Key', 'Product', 'Type', 'Page', 'Description']];
for (const [zone, list] of Object.entries(catalog)) {
  const sorted = [...list].sort((a, b) => (rangeLabel[a.range] || '').localeCompare(rangeLabel[b.range] || '') || a.title.localeCompare(b.title));
  for (const p of sorted) {
    rows.push([p.key, p.title, rangeLabel[p.range] || zoneLabel[zone] || zone, `https://dduroga.com/products/${p.slug}`, p.hasDesc ? p.desc : '']);
  }
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n');
console.log(`export-copy-sheet: ${rows.length - 1} products -> ${out}`);
