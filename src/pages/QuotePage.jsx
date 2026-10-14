import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { useQuote, quoteKey } from '../quote/QuoteContext.jsx';
import { sendEnquiry } from '../lib/enquiry.js';
import { IconArrowRight, IconCheck } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';
import { brand } from '../data/brand.js';
import QtyInput from '../components/QtyInput.jsx';

const EMPTY = { name: '', email: '', phone: '', company: '', notes: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function QuotePage() {
  const { items, remove, setQty, clear } = useQuote();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [mailto, setMailto] = useState('');
  const formRef = useRef(null);
  usePageMeta({ title: 'Your quote list', canonical: '/quote', noindex: true });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your name.';
    // Many buyers here answer by phone or WhatsApp rather than email, so either
    // one is enough to reply to.
    const hasEmail = Boolean(form.email.trim());
    const hasPhone = form.phone.replace(/\D/g, '').length >= 7;
    if (!hasEmail && !hasPhone) next.email = 'Enter an email or a phone number so we can reply.';
    else if (hasEmail && !EMAIL_RE.test(form.email.trim())) next.email = 'That email looks invalid.';
    if (form.phone.trim() && !hasPhone) next.phone = 'That phone number looks too short.';
    setErrors(next);
    // Move focus to the first problem so keyboard and screen-reader users land on it.
    const first = ['name', 'email', 'phone'].find((k) => next[k]);
    if (first) formRef.current?.querySelector(`#q-${first}`)?.focus();
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
        phone: form.phone,
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

  const units = items.reduce((n, p) => n + (p.qty || 1), 0);
  const field = (id, err) => ({ 'aria-invalid': Boolean(err), 'aria-describedby': err ? `${id}-err` : undefined });

  return (
    <>
      <PageHero eyebrow="Request a quote" title="Your quote list" lead="Review the products you've shortlisted and send us one consolidated request - we'll reply with pricing and lead times." crumb="Quote" />

      <section className="section" style={{ paddingBlock: '56px 84px' }}>
        <div className="container">
          {items.length === 0 && !sent ? (
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
                      <button type="button" onClick={() => setQty(quoteKey(p), (p.qty || 1) - 1)} aria-label={`Decrease quantity of ${p.title}`}>−</button>
                      <QtyInput value={p.qty || 1} onChange={(n) => setQty(quoteKey(p), n)} label={`Quantity of ${p.title}`} />
                      <button type="button" onClick={() => setQty(quoteKey(p), (p.qty || 1) + 1)} aria-label={`Increase quantity of ${p.title}`}>+</button>
                    </span>
                    <button type="button" className="quote-item__remove" onClick={() => remove(quoteKey(p))} aria-label={`Remove ${p.title}`}>×</button>
                  </div>
                ))}
                {items.length > 0 && (
                  <p className="muted" style={{ marginTop: 14 }}>
                    {items.length} product{items.length === 1 ? '' : 's'} · {units} unit{units === 1 ? '' : 's'} in total
                  </p>
                )}
              </div>

              {/* Form */}
              <div>
                {sent ? (
                  <div className="panel" role="status">
                    <div className="form-success" style={{ marginBottom: 14 }}>
                      <IconCheck width="18" height="18" style={{ display: 'inline', verticalAlign: -3, marginRight: 8 }} />
                      {mailto ? 'Your quote request is ready to send.' : 'Thank you. Your quote request has been sent.'}
                    </div>
                    {mailto ? (
                      <>
                        <p className="muted" style={{ fontSize: '0.95rem' }}>
                          Send it from your email app to finish, or call or WhatsApp us on {brand.phone} and give your name.
                        </p>
                        <a className="btn hx-btn" style={{ marginTop: 16 }} href={mailto}>Open in email app</a>
                      </>
                    ) : (
                      <p className="muted" style={{ fontSize: '0.95rem' }}>
                        Our team will reply with pricing and lead times. For anything urgent, call or WhatsApp {brand.phone}.
                      </p>
                    )}
                  </div>
                ) : (
                  <form className="form" onSubmit={submit} noValidate ref={formRef}>
                    <div className="form-row">
                      <div className="field">
                        <label htmlFor="q-name">Full name <span className="req">*</span></label>
                        <input id="q-name" value={form.name} onChange={set('name')} autoComplete="name" {...field('q-name', errors.name)} />
                        {errors.name && <p className="form-error" id="q-name-err">{errors.name}</p>}
                      </div>
                      <div className="field">
                        <label htmlFor="q-company">Company</label>
                        <input id="q-company" value={form.company} onChange={set('company')} autoComplete="organization" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="field">
                        <label htmlFor="q-email">Work email</label>
                        <input id="q-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" {...field('q-email', errors.email)} />
                        {errors.email && <p className="form-error" id="q-email-err">{errors.email}</p>}
                      </div>
                      <div className="field">
                        <label htmlFor="q-phone">Phone / WhatsApp</label>
                        <input id="q-phone" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+234…" {...field('q-phone', errors.phone)} />
                        {errors.phone && <p className="form-error" id="q-phone-err">{errors.phone}</p>}
                      </div>
                    </div>
                    <p className="form-note" style={{ marginTop: -6, marginBottom: 14 }}>Give an email or a phone number, or both, so we can send your quote.</p>
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
