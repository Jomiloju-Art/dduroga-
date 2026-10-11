import CertBadges from './CertBadges.jsx';

/**
 * Certification strip sitting directly under the hero.
 *
 * The 524 / 17 / 4 metrics row and its "What each mark means" link were
 * removed on client feedback — she circled that row specifically, so the
 * certification badges and the Mallcom endorsement stay where they are.
 * Nothing is lost site-wide: the same counts still appear on the catalogue
 * covers, which are generated from the live catalogue rather than typed in.
 *
 * There are deliberately no order counts or "X clients served" numbers — we do
 * not hold those, and inventing them on the page whose whole job is credibility
 * would be self-defeating.
 */
export default function TrustBand() {
  return (
    <section className="hp-trust" aria-labelledby="trust-heading">
      <div className="container">
        <h2 className="sr-only" id="trust-heading">Certifications</h2>

        <div className="hp-trust__row">
          <span className="hp-trust__label">Certified &amp; marked to</span>
          <CertBadges />

          {/* Parent-brand endorsement. Mallcom manufactures the range; DDUROGA
              supplies it. Not a link — it is a credential, not a destination.
              Label is "Made by" rather than "Manufactured by": measured against
              the row, "Manufactured by" overran the 1180px container by 11px and
              pushed the whole lockup onto a second line. */}
          <span className="hp-trust__maker">
            <span className="hp-trust__label">Made by</span>
            <img
              className="hp-trust__mallcom"
              src="/brand/mallcom-logo.png"
              alt="Mallcom"
              width="96"
              height="36"
              loading="lazy"
              decoding="async"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
