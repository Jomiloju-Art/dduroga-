/**
 * Text helpers for the catalogue copy on the product page. Moved here from
 * DesignedForSection.jsx when that block was merged into the product
 * information accordions (Oct 2026).
 */
/**
 * Split the catalogue description into readable sentences.
 *
 * The supplier `desc` fields have NO full stops - they run sentences together
 * with only a capital to mark the join:
 *
 *   "This non ventilated HDPE safety helmet adapts ... for greater comfort
 *    Designed and developed including features ... acceptability
 *    Safety helmet with UV resistant high density polyethylene (HDPE) shell
 *    Textile lining with 3 bands with 8 attachment points ..."
 *
 * Splitting on `[.!?]` therefore yields one 503-character blob. Break instead on
 * a capitalised word that follows a lowercase word, which is the only signal the
 * text gives. Guard against the false positives that creates: acronyms (HDPE),
 * measurements (cm), and numbers are left alone.
 */
export function toSentences(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  return clean
    .split(/(?<=[a-z0-9)\]])\s+(?=[A-Z][a-z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

/**
 * Turn a feature line into a short title plus the rest.
 *
 * Prefer a real break. Otherwise head the line with its own first clause, cut at
 * a preposition so it never ends mid-promise ("Textile lining with 3" was the
 * failure mode). When no clean break exists the line is used as body copy with
 * no heading, which reads better than a fragment.
 */
export function splitFeature(sentence) {
  const clean = String(sentence).trim().replace(/\s+/g, ' ');
  if (!clean) return null;

  for (const sep of [':', ' — ', ' – ', ' - ']) {
    const i = clean.indexOf(sep);
    if (i > 8 && i < 70) {
      return { title: clean.slice(0, i).trim(), text: clean.slice(i + sep.length).trim() };
    }
  }

  const words = clean.split(' ');
  const STOPS = new Set(['with', 'from', 'for', 'of', 'in', 'on', 'by', 'to']);

  /* Cut at a preposition, but only where the head reads as a finished phrase.
     "Adjustable easy | to use tightening ratchets" split badly because "easy"
     is an adjective waiting for its noun - so a head may not end on a word that
     only modifies what follows. */
  const DANGLING = new Set(['easy', 'hard', 'simple', 'quick', 'high', 'low', 'full', 'non', 'anti', 'multi', 'pre', 'semi', 'adjustable', 'resistant']);
  let cut = -1;
  for (let i = 2; i < Math.min(words.length, 9); i++) {
    const w = words[i].toLowerCase();
    if (!STOPS.has(w)) continue;
    const prev = words[i - 1].toLowerCase().replace(/[^a-z-]/g, '');
    if (DANGLING.has(prev)) continue;      // would end mid-phrase
    cut = i;
    break;
  }
  if (cut >= 2) {
    const title = words.slice(0, cut).join(' ').replace(/[,.]$/, '');
    const rest = words.slice(cut).join(' ');
    if (title.length >= 6 && title.length <= 46) return { title, text: rest };
  }

  // No usable break: show the line whole, headed by nothing.
  return { title: null, text: clean };
}
