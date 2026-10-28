import { useCallback, useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import AccreditationDrawer from '../components/AccreditationDrawer.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { facilityAccreditations, productAccreditations } from '../data/accreditations.js';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';

/**
 * /certifications — every accreditation from the client's business profile,
 * one card each, opening the same drawer as the homepage strip.
 *
 * Certificate numbers and dates are not shown until the client supplies them;
 * the lead says certificates are available on request rather than on hand.
 * (A "Details pending" pill on all eleven cards made the page look unfinished.)
 */
function Cards({ items, onPick }) {
  return (
    <div className="accr-cards">
      {items.map((a) => {
        return (
          <button type="button" className="accr-card" key={a.id} onClick={() => onPick(a)}>
            <span className="accr-card__logo"><img src={a.logo} alt={`${a.name} logo`} loading="lazy" /></span>
            <span className="accr-card__body">
              <span className="accr-card__name">{a.name}</span>
              <span className="accr-card__what">{a.what}</span>
              <span className="accr-card__meta">
                <span />
                <b>Details →</b>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CertificationsPage() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  usePageMeta(pageMeta['/certifications']);

  return (
    <>
      <PageHero
        eyebrow="Quality & compliance"
        title="Certifications & accreditations"
        crumb="Certifications"
        lead="Our Mallcom range is made in Mallcom group facilities and tested to the standards below. Certificates and declarations of conformity are available on request for tenders and audits."
      />

      <section className="section">
        <div className="container">
          <h2 className="accr-section-title">Facility accreditations</h2>
          <p className="accr-section-lead">How our products are made: quality, environmental and ethical management, independently audited.</p>
          <Cards items={facilityAccreditations} onPick={setActive} />
          <div className="accr-callout">
            <b>Who holds these?</b> Facility accreditations are issued to Mallcom India Limited for its manufacturing sites. DDUROGA Safety is Mallcom India’s sole authorized distributor in West Africa.
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="accr-section-title">Product certification marks</h2>
          <p className="accr-section-lead">Standards our ranges are tested and marked to. Each product page lists the standards and performance levels printed for that product in the Mallcom catalogue.</p>
          <Cards items={productAccreditations} onPick={setActive} />
        </div>
      </section>

      {/* The "Nigerian approvals" (SON / SONCAP) placeholder was removed at the
          client's request (Oct 2026). Add a section back once real SONCAP or
          MANCAP certificates are supplied. */}

      <CtaBand
        title="Need certificates for a tender?"
        text="Tell us the products and the standards your tender asks for, and our team will send the declarations of conformity and test reports."
      />
      <AccreditationDrawer item={active} onClose={close} />
    </>
  );
}
