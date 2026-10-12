import { useCallback, useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import AccreditationDrawer from '../components/AccreditationDrawer.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { facilityAccreditations, productAccreditations } from '../data/accreditations.js';
import { usePageMeta } from '../lib/seo.js';

/**
 * /certifications — every accreditation from the client's business profile,
 * one card each, opening the same drawer as the homepage strip.
 *
 * Cards whose certificate details are still missing say so ("Details pending")
 * rather than implying the paperwork is on hand.
 */
function Cards({ items, onPick }) {
  return (
    <div className="accr-cards">
      {items.map((a) => {
        const pending = Object.values(a.facts).some((v) => v == null);
        return (
          <button type="button" className="accr-card" key={a.id} onClick={() => onPick(a)}>
            <span className="accr-card__logo"><img src={a.logo} alt={`${a.name} logo`} loading="lazy" /></span>
            <span className="accr-card__body">
              <span className="accr-card__name">{a.name}</span>
              <span className="accr-card__what">{a.what}</span>
              <span className="accr-card__meta">
                {pending ? <span className="accr-pill accr-pill--todo">Details pending</span> : <span />}
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

  usePageMeta({
    title: 'Certifications & accreditations',
    description: 'Facility accreditations and product certification marks behind the DDUROGA Safety range, manufactured by the Mallcom group.',
    canonical: '/certifications',
  });

  return (
    <>
      <PageHero
        eyebrow="Quality & compliance"
        title="Certifications & accreditations"
        crumb="Certifications"
        lead="Every DDUROGA product is made in Mallcom group facilities and tested to the standards below. Certificates and declarations of conformity are available for tenders and audits."
      />

      <section className="section">
        <div className="container">
          <h2 className="accr-section-title">Facility accreditations</h2>
          <p className="accr-section-lead">How our products are made: quality, environmental and ethical management, independently audited.</p>
          <Cards items={facilityAccreditations} onPick={setActive} />
          <div className="accr-callout">
            <b>Who holds these?</b> Facility accreditations are issued to Mallcom India Limited, our parent company, for its manufacturing sites. DDUROGA Safety is Mallcom’s wholly owned Nigerian subsidiary.
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

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="accr-section-title">Nigerian approvals</h2>
          <p className="accr-section-lead">Local regulatory approvals for importing and supplying PPE in Nigeria.</p>
          <div className="accr-cards">
            <div className="accr-card accr-card--todo">
              <span className="accr-card__logo">SON · SONCAP</span>
              <span className="accr-card__body">
                <span className="accr-card__name">Standards Organisation of Nigeria</span>
                <span className="accr-card__what">SONCAP product certificates and any MANCAP approvals will be listed here once confirmed.</span>
                <span className="accr-card__meta"><span className="accr-pill accr-pill--todo">To be confirmed</span><span /></span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Need certificates for a tender?"
        text="Tell us the products and the standards your tender asks for, and our team will send the declarations of conformity and test reports."
      />
      <AccreditationDrawer item={active} onClose={close} />
    </>
  );
}
