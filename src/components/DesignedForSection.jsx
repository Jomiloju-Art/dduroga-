/**
 * DesignedForSection - the Gymshark "Designed For" tab block.
 *
 * Measured off their Element baselayer PDP (www.gymshark.com), which is a
 * different template to the Whitney one - the section only exists there:
 *
 *   display                grid
 *   grid-template-columns  712.5px 712.5px   <- exact 50/50
 *   column-gap             64px
 *   row heights match      both columns 891px
 *   video                  object-fit: cover, border-radius: 0, fills the column
 *   video attrs            muted loop playsinline preload="none", autoplaying
 *   control                pause button, top-right of the video
 *
 * Left column order: one large statement paragraph, then feature rows - small
 * line icon, bold title, muted description.
 *
 * Their tabs are "Designed For" / "Description". The same split is used here, so
 * the page gains a place for the spec content that currently sits in accordions
 * without duplicating it.
 *
 * Content comes from what the catalogue already holds - no invented copy:
 *   desc         -> the statement paragraph (first sentences)
 *   keyFeatures  -> the feature rows
 *   design       -> the Description tab body
 */
import { useState } from 'react';
import ProductVideo from './ProductVideo.jsx';
import { IconCheck } from './Icons.jsx';

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
function toSentences(text) {
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
function splitFeature(sentence) {
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

export default function DesignedForSection({ product, video, rich }) {
  const [tab, setTab] = useState('designed');

  const features = (rich?.keyFeatures?.length ? rich.keyFeatures : [])
    .map(splitFeature)
    .filter(Boolean)
    .slice(0, 4);

  const design = rich?.design || [];
  const remarks = rich?.remarks || [];

  /* The statement paragraph: the opening of the description, trimmed to a hook.
     Gymshark's is two short sentences; the catalogue's desc has no punctuation to
     rely on, so it is broken with toSentences() and the leading 1-2 clauses are
     kept, capped so it can never become a wall of text. */
  const statement = (() => {
    const sentences = toSentences(product?.desc);
    if (!sentences.length) return '';
    const out = [];
    let len = 0;
    for (const s of sentences) {
      // First clause is sometimes still very long - cut it at a comma.
      if (out.length === 0 && s.length > 150) {
        const slice = s.slice(0, 150);
        const comma = slice.lastIndexOf(',');
        out.push((comma > 60 ? slice.slice(0, comma) : slice).trim());
        break;
      }
      if (len + s.length > 190 && out.length) break;
      out.push(s);
      len += s.length;
      if (out.length >= 2) break;
    }
    return out.join('. ').replace(/[.,;]$/, '').trim();
  })();

  if (!statement && !features.length) return null;

  return (
    <section className="df-section" aria-labelledby="df-tab-designed">
      {/* Tabs, matching their two-tab strip. */}
      <div className="df-tabs" role="tablist" aria-label="Product information">
        <button
          type="button"
          role="tab"
          id="df-tab-designed"
          aria-selected={tab === 'designed'}
          aria-controls="df-panel-designed"
          className={`df-tab${tab === 'designed' ? ' is-active' : ''}`}
          onClick={() => setTab('designed')}
        >
          Designed For
        </button>
        <button
          type="button"
          role="tab"
          id="df-tab-description"
          aria-selected={tab === 'description'}
          aria-controls="df-panel-description"
          className={`df-tab${tab === 'description' ? ' is-active' : ''}`}
          onClick={() => setTab('description')}
        >
          Description
        </button>
      </div>

      {tab === 'designed' && (
        <div className="df-grid" role="tabpanel" id="df-panel-designed" aria-labelledby="df-tab-designed">
          <div className="df-content">
            {statement && <p className="df-statement">{statement}</p>}

            {features.length > 0 && (
              <ul className="df-features">
                {features.map((f) => (
                  <li key={f.title || f.text.slice(0, 30)}>
                    <span className="df-feature__icon" aria-hidden="true">
                      <IconCheck width="20" height="20" />
                    </span>
                    <span className="df-feature__body">
                      {f.title && <strong>{f.title}</strong>}
                      {f.text && <span>{f.text}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* The video column. Fills its half exactly, square corners, cover
              crop - their treatment. Falls back to the first product image when
              a product has no clip, so the column is never empty. */}
          <div className="df-media">
            {video ? (
              <ProductVideo
                mp4={video.mp4}
                webm={video.webm}
                poster={video.poster}
                title={product.title}
                /* contain, not cover: the clip is 16:9 and this column is taller
                   than that, so cover was cropping the sides of the frame. The
                   whole frame matters more than filling the box. */
                fit="contain"
              />
            ) : (
              product?.img && <img src={product.img} alt={product.title} loading="lazy" decoding="async" />
            )}
          </div>
        </div>
      )}

      {tab === 'description' && (
        <div className="df-grid" role="tabpanel" id="df-panel-description" aria-labelledby="df-tab-description">
          <div className="df-content">
            {design.length > 0 && (
              <>
                <h3 className="df-subhead">Design</h3>
                <ul className="df-list">
                  {design.map((d) => <li key={d.slice(0, 30)}>{d}</li>)}
                </ul>
              </>
            )}
            {remarks.length > 0 && (
              <>
                <h3 className="df-subhead">Remarks</h3>
                <ul className="df-list">
                  {remarks.map((d) => <li key={d.slice(0, 30)}>{d}</li>)}
                </ul>
              </>
            )}
            {!design.length && !remarks.length && (
              <p className="df-statement">{statement}</p>
            )}
          </div>
          <div className="df-media">
            {video ? (
              <ProductVideo
                mp4={video.mp4}
                webm={video.webm}
                poster={video.poster}
                title={product.title}
                fit="contain"
              />
            ) : (
              product?.img && <img src={product.img} alt={product.title} loading="lazy" decoding="async" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
