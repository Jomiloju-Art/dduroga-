/**
 * ReviewsSection - an exact copy of Gymshark's review block.
 *
 * STRUCTURE copied element-for-element from their live PDP. Measured values:
 *
 *   section wrapper        margin: 80px 0 64px
 *   two columns            717px + 717px, "Reviews" h2 above both
 *
 *   LEFT  .reviews-summary
 *     rating               48px / 43.2px  weight 800  rgb(0,0,0)
 *     stars                5 svg, 40x40 each (24px in the scaled-down build here)
 *     total                14px / 19.6px  weight 400
 *     recommenders         14px / 19.6px  weight 400  rgb(118,122,127), tick icon
 *     "Rating snapshot"    20px / 18.8px  weight 500
 *     breakdown rows       "5 ( 109 )" 14px + a 4px bar
 *
 *   RIGHT .pdp-reviews_right-column
 *     "AVERAGE RATINGS"    20px / 18.8px  weight 500
 *     label buttons        38px tall, 14px / 400, radius 0
 *     a single 4px bar with "1 Star" / "5 Star" end labels, 12px / 400
 *
 *   FILTERS  a 285px search input, then a horizontally scrollable row of
 *            dropdowns: Sort by and Rating. The reference also carries Activity,
 *            Age, Workout Frequency and Height, but those filter on demographic
 *            data Mallcom's reviews do not contain, so they are not rendered at
 *            all - a control with nothing behind it would be worse than absent.
 *
 *   REVIEW CARD  an <article>. Author column 300px, content column the rest.
 *     author               18px / 400  rgb(13,16,18)
 *     "Verified buyer"     14px, with a tick
 *     metrics              the fields that exist for that review
 *     title                14px / 19.6px  WEIGHT 700  rgb(13,16,18)
 *     body                 14px / 19.6px  weight 400  rgb(118,122,127)  <- muted
 *
 *   FOOTER  "1-2 of N reviews" + a Load more control.
 *
 * The data is Mallcom's, and is labelled as such - see the note in the summary.
 */
import { useMemo, useState } from 'react';
import { reviewsForProduct } from '../data/mallcomReviews.generated.js';

const PAGE = 5;

/**
 * The percentage an aspect's bar sits at.
 *
 * Their markup carries `--percentage: 92.6865671641791%` for a 4.63/5 Quality
 * score - i.e. score/5*100, the position on the 5-point scale, unrounded. An
 * aspect here is a filter over the reviews that mention it, so its score is the
 * mean of those reviews; with no aspect selected the overall average is used.
 */
function aspectScore(aspect, fallbackAverage) {
  if (!aspect || !aspect.hits || !aspect.hits.length) return fallbackAverage / 5 * 100;
  const mean = aspect.hits.reduce((n, r) => n + r.score, 0) / aspect.hits.length;
  return mean / 5 * 100;
}

const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s.replace(' UTC', 'Z').replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * The star — copied verbatim from Gymshark's markup, not redrawn.
 *
 * Their technique: a 5-pointed <path> inside a <clipPath>, with two full-size
 * <rect>s clipped to that shape. The gold rect sits at x=0; the grey rect is
 * pushed right by `fill` percent, which is what produces a partial star. So a
 * 4.5 rating is four fully-gold stars and one whose grey mask is offset 50%.
 *
 *   <rect x="0"      fill="#ffb005" clip-path="url(#star)"/>   gold
 *   <rect x="{fill}%" fill="#D9D9D9" clip-path="url(#star)"/>  grey offset
 *
 * No half-star glyph and no per-fraction path - the fraction IS the x offset.
 */
const STAR_PATH =
  'M22.3498 27.54L14.0005 21.0646L5.60596 27.5165L8.8893 17.1675L0.460938 10.7745' +
  'L10.8412 10.8569L14.0005 0.460938L17.1484 10.8569L27.5513 10.8216L19.1116 17.1675' +
  'L22.3611 27.5518L22.3498 27.54Z';

function Star({ fillPct, index }) {
  // clipPath ids must be unique per star across the document
  const id = `star-clip-${index}`;
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="gs-star"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <path d={STAR_PATH} fill="#ffb005" />
        </clipPath>
      </defs>
      <rect x="0" y="0" fill="#ffb005" width="100%" height="100%" clipPath={`url(#${id})`} />
      <rect x={`${fillPct}%`} y="0" fill="#D9D9D9" width="100%" height="100%" clipPath={`url(#${id})`} />
    </svg>
  );
}

/**
 * Five stars. Each slot is either wholly gold (fill 100), wholly masked (fill 0,
 * i.e. no offset so the grey covers it), or partially masked for a fraction.
 */
function Stars({ score }) {
  const slots = [0, 1, 2, 3, 4].map((i) => {
    const remaining = score - i;              // how much of THIS star is filled
    if (remaining >= 1) return 100;           // fully gold -> grey pushed fully out
    if (remaining <= 0) return 0;             // fully grey -> grey at x=0
    return Math.round(remaining * 100);       // partial
  });
  return (
    <div
      className="gs-stars"
      role="img"
      aria-label={`Rating: ${score} out of 5 stars`}
      data-testid="reviews__stars"
    >
      {slots.map((fillPct, i) => <Star key={i} fillPct={fillPct} index={i} />)}
    </div>
  );
}

export default function ReviewsSection({ slug }) {
  const data = reviewsForProduct(slug);
  const [sort, setSort] = useState('recent');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [aspect, setAspect] = useState(null);

  const aspects = useMemo(() => {
    if (!data) return [];
    const WORDS = {
      Quality: /quality/i,
      Comfort: /comfort|comfortable|cushion/i,
      Fit: /fit|fits|sizing|size/i,
      Durability: /sturdy|robust|durab|long.?last|whole day/i,
      Value: /worth|value|price|money/i,
    };
    return Object.entries(WORDS)
      .map(([label, re]) => ({ label, hits: data.reviews.filter((r) => re.test(`${r.title} ${r.body}`)) }))
      .filter((a) => a.hits.length > 0);
  }, [data]);

  const snapshot = useMemo(() => {
    if (!data) return [];
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of data.reviews) counts[Math.round(r.score)] += 1;
    return [5, 4, 3, 2, 1].map((s) => ({ star: s, n: counts[s], pct: data.count ? (counts[s] / data.count) * 100 : 0 }));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.reviews;
    if (ratingFilter !== 'all') list = list.filter((r) => Math.round(r.score) === Number(ratingFilter));
    if (aspect) list = list.filter((r) => aspect.hits.includes(r));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => `${r.title} ${r.body} ${r.author}`.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === 'high') sorted.sort((a, b) => b.score - a.score);
    else if (sort === 'low') sorted.sort((a, b) => a.score - b.score);
    else if (sort === 'old') sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    else sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted;
  }, [data, sort, ratingFilter, query, aspect]);

  if (!data) return null;

  const shown = filtered.slice(0, page * PAGE);
  const pctRecommend = Math.round((data.reviews.filter((r) => r.score >= 4).length / data.count) * 100);
  const avgScore = data.average;

  return (
    <section className="gs-reviews" aria-labelledby="gs-reviews-title">
      <h2 className="gs-reviews__title" id="gs-reviews-title">Reviews</h2>

      <div className="gs-reviews__sections">
        {/* ---------------- LEFT: summary + breakdown ---------------- */}
        <section className="gs-summary">
          <div className="gs-summary__row">
            <span className="gs-summary__rating">{avgScore.toFixed(1)}</span>
            <Stars score={avgScore} size={26} />
          </div>

          <p className="gs-summary__total">
            Based on {data.count} {data.count === 1 ? 'review' : 'reviews'}
          </p>

          {/* The source line. Their section reads "94% of customers would
              recommend this"; ours cannot say "customers" - these are Mallcom's
              customers, not DDUROGA's. */}
          <p className="gs-summary__recommenders">
            <span className="gs-tick" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 12.5l5 5 11-12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            {pctRecommend}% of reviewers rated this 4 or 5
          </p>
          <p className="gs-summary__source">
            Collected by Mallcom, the manufacturer of this product
          </p>

          <h4 className="gs-breakdown__heading">Rating snapshot</h4>
          <div className="gs-breakdown">
            {snapshot.map((row) => (
              <div className="gs-breakdown__row" key={row.star}>
                <div className="gs-breakdown__label">{row.star} ( {row.n} )</div>
                <div className="gs-breakdown__bar">
                  <div className="gs-breakdown__fill" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- RIGHT: average ratings ----------------
            Markup copied from theirs:

              <div class="average-ratings_container" style="--percentage: X%;">
                <div class="average-ratings_bar" role="progressbar"
                     aria-valuemin="0" aria-valuemax="5"
                     aria-label="Rated 4.63 out of 5 for Quality"></div>
                <div class="average-ratings_bar-labels">
                  <span>1 Star</span><span>5 Star</span>
                </div>
              </div>

            The bar is ONE element. There is no fill child and no separate track:
            the grey comes from its own `background`, and the marker is a ::before
            driven by the --percentage custom property:

              .bar::before { left: var(--percentage); transform: translateX(-50%);
                             width: 24px; height: .4rem; background: #0d1012; } */}
        <div className="gs-right">
          <div className="gs-average">
            {/* Their heading is "AVERAGE RATINGS " with text-transform: none -
                the caps are literal, and there is a trailing space. Reproduced
                as-is rather than applied via uppercase, so the two match. */}
            <h2 className="gs-average__title">AVERAGE RATINGS </h2>

            {aspects.length > 0 && (
              <div className="gs-average__labels">
                {aspects.map((a) => {
                  const on = aspect ? aspect.label === a.label : false;
                  return (
                    <button
                      key={a.label}
                      type="button"
                      className={`gs-average__label${on ? ' is-active' : ''}`}
                      aria-pressed={on}
                      onClick={() => setAspect(aspect && aspect.label === a.label ? null : a)}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className="gs-average__container"
              style={{
                /* which aspect is selected decides what the bar reports; with
                   none selected it reports the overall average */
                '--percentage': `${aspect ? aspectScore(aspect, avgScore) : avgScore / 5 * 100}%`,
              }}
            >
              <div
                className="gs-average__bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="5"
                aria-label={`Rated ${(aspect ? aspectScore(aspect, avgScore) / 20 : avgScore).toFixed(2)} out of 5${aspect ? ` for ${aspect.label}` : ''}`}
              />
              <div className="gs-average__bar-labels">
                <span className="gs-average__bar-label">1 Star</span>
                <span className="gs-average__bar-label">5 Star</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- filters ---------------- */}
      <section className="gs-comments">
        <div className="gs-filters">
          <div className="gs-filters__search">
            <label className="gs-visually-hidden" htmlFor="gs-search">Search reviews and topics</label>
            <input
              id="gs-search"
              className="gs-filters__input"
              type="search"
              placeholder="Search reviews and topics"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
            <span className="gs-filters__search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </span>
          </div>

          <div className="gs-filters__row-scrollable">
            <div className="gs-filters__row">
              {/* Sort by - works */}
              <div className="gs-filter">
                <label className="gs-filter__label" htmlFor="gs-f-sort">Sort by:</label>
                <select id="gs-f-sort" className="gs-filter__select" value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                  <option value="recent">Most recent</option>
                  <option value="old">Oldest first</option>
                  <option value="high">Highest rated</option>
                  <option value="low">Lowest rated</option>
                </select>
              </div>

              {/* Rating - works */}
              <div className="gs-filter">
                <label className="gs-visually-hidden" htmlFor="gs-f-rating">Rating</label>
                <select id="gs-f-rating" className="gs-filter__select" value={ratingFilter}
                        onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}>
                  <option value="all">Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- the reviews ---------------- */}
        <div className="gs-comments__reviews">
          {shown.length === 0 && (
            <p className="gs-no-match">No reviews match this filter.</p>
          )}

          {shown.map((r) => (
            <article className="gs-card" key={r.id || `${r.author}-${r.date}`}>
              <div className="gs-card__author">
                <p className="gs-card__header-text">
                  <span className="gs-card__name">{r.author}</span>
                </p>
                <div className="gs-card__verified">
                  <span className="gs-card__tick" aria-hidden="true">
                    <span className="gs-card__tick-mark" />
                  </span>
                  {r.verified ? 'Verified buyer' : 'Reviewer'}
                </div>
                <div className="gs-card__metrics">
                  <div className="gs-card__metric"><span>Date</span><span>{fmtDate(r.date)}</span></div>
                  <div className="gs-card__metric"><span>Rating</span><span>{r.score} / 5</span></div>
                </div>
              </div>

              <div className="gs-card__content">
                <header className="gs-card__body-head">
                  <Stars score={r.score} />
                  {r.title && <h3 className="gs-card__heading">{r.title}</h3>}
                </header>
                {r.body && <p className="gs-card__text">{r.body}</p>}
              </div>
            </article>
          ))}
        </div>

        {/* ---------------- footer ---------------- */}
        <div className="gs-comments__footer">
          <p className="gs-comments__counter">
            {filtered.length === 0
              ? `0 of ${data.count} reviews`
              : `1-${shown.length} of ${filtered.length} review${filtered.length === 1 ? '' : 's'}`}
          </p>
          {shown.length < filtered.length && (
            <button type="button" className="gs-load-more" onClick={() => setPage((p) => p + 1)}>
              Load more
            </button>
          )}
        </div>
      </section>
    </section>
  );
}
