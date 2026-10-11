import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { useQuote, quoteKey } from '../quote/QuoteContext.jsx';
import { sendEnquiry, mailtoHref } from '../lib/enquiry.js';
import { IconArrowRight, IconCheck } from '../components/Icons.jsx';

const EMPTY = { name: '', email: '', company: '', notes: '' };

export default function QuotePage() {
  const { items, remove, setQty, clear } = useQuote();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [mailto, setMailto] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your name.';
    if (!form.email.trim()) next.email = 'Enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'That email looks invalid.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || !validate()) return;
    const res = await sendEnquiry(
      {
        type: 'Quote request',
        name: form.name,
        email: form.email,
        company: form.company,
        notes: form.notes,
        items: items.map((p) => ({ title: p.title, sku: p.sku, qty: p.qty || 1, option: p.option || '' })),
      },
      `Quote request from ${form.name}`
    );
    setSent(true);
    setMailto(res.mailto || '');
    if (res.endpoint && !res.ok) setSent(false);
    else clear();
  };

  const subtotal = items.reduce((n, p) => n + (p.qty || 1), 0);

  return (
    <>
      <PageHero eyebrow="Request a quote" title="Your quote list" lead="Review the products you've shortlisted and send us one consolidated request - we'll reply with pricing and lead times." crumb="Quote" />

      <section className="section" style={{ paddingBlock: '56px 84px' }}>
        <div className="container">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <h2 className="section-title" style={{ marginBottom: 10 }}>Your quote list is empty</h2>
              <p className="muted" style={{ marginBottom: 24, maxWidth: '46ch', marginInline: 'auto' }}>
                Browse the catalogue and tap "Add to quote" on any product to build your request.
              </p>
              <Link to="/products" className="btn hx-btn">Browse products <IconArrowRight width="14" height="14" /></Link>
            </div>
          ) : (
            <div className="quote-grid">
              {/* Items */}
              <div>
                {items.map((p) => (
                  <div className="quote-item" key={quoteKey(p)}>
                    <span className="quote-item__img">{p.img ? <img src={p.img} alt="" loading="lazy" /> : null}</span>
                    <span className="quote-item__info">
                      <strong>{p.title}</strong>
                      {p.option && <em>Size / colour: {p.option}</em>}
                      {p.sku && <em>SKU: {p.sku}</em>}
                    </span>
                    <span className="quote-item__qty">
                      <button type="button" onClick={() => setQty(quoteKey(p), (p.qty || 1) - 1)} aria-label="Decrease">−</button>
                      <b>{p.qty || 1}</b>
                      <button type="button" onClick={() => setQty(quoteKey(p), (p.qty || 1) + 1)} aria-label="Increase">+</button>
                    </span>
                    <button type="button" className="quote-item__remove" onClick={() => remove(quoteKey(p))} aria-label={`Remove ${p.title}`}>×</button>
                  </div>
                ))}
                <p className="muted" style={{ marginTop: 14 }}>{items.length} product{items.length === 1 ? '' : 's'} · {subtotal} line item{subtotal === 1 ? '' : 's'}</p>
              </div>

              {/* Form */}
              <div>
                {sent ? (
                  <div className="panel" role="status">
                    <div className="form-success" style={{ marginBottom: 14 }}>
                      <IconCheck width="18" height="18" style={{ display: 'inline', verticalAlign: -3, marginRight: 8 }} />
                      Thank you. Your quote request is ready to send.
                    </div>
                    {mailto ? (
                      <>
                        <p className="muted" style={{ fontSize: '0.95rem' }}>An email endpoint isn't configured yet, so open it in your email client:</p>
                        <a className="btn hx-btn" style={{ marginTop: 16 }} href={mailto}>Open in email client</a>
                        <p className="muted" style={{ fontSize: '0.82rem', marginTop: 14 }}>Developer note: set <code>enquiryEndpoint</code> in src/data/brand.js to send automatically.</p>
                      </>
                    ) : (
                      <p className="muted" style={{ fontSize: '0.95rem' }}>Your request has been submitted. We'll get back to you within one business day.</p>
                    )}
                  </div>
                ) : (
                  <form className="form" onSubmit={submit} noValidate>
                    <div className="form-row">
                      <div className="field">
                        <label htmlFor="q-name">Full name <span className="req">*</span></label>
                        <input id="q-name" value={form.name} onChange={set('name')} autoComplete="name" />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                      </div>
                      <div className="field">
                        <label htmlFor="q-company">Company</label>
                        <input id="q-company" value={form.company} onChange={set('company')} autoComplete="organization" />
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="q-email">Work email <span className="req">*</span></label>
                      <input id="q-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
                      {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>
                    <div className="field">
                      <label htmlFor="q-notes">Notes (volumes, deadlines, specifications)</label>
                      <textarea id="q-notes" value={form.notes} onChange={set('notes')} placeholder="e.g. 500 pairs, need ISO certificates…" />
                    </div>
                    <button type="submit" className="btn hx-btn" style={{ width: '100%', justifyContent: 'center' }}>
                      Send quote request <IconArrowRight width="14" height="14" />
                    </button>
                    <p className="form-note" style={{ marginTop: 10 }}>No payment now. This requests a quotation only.</p>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
