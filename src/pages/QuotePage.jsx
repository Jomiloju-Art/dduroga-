import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { useQuote, quoteKey } from '../quote/QuoteContext.jsx';
import { sendEnquiry } from '../lib/enquiry.js';
import { IconArrowRight, IconCheck } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';
import { brand } from '../data/brand.js';
import QtyInput from '../components/QtyInput.jsx';
import EnquiryFallback from '../components/EnquiryFallback.jsx';
import { useSpamGuard } from '../components/SpamGuard.jsx';
import { useContactChecks } from '../lib/useContactChecks.js';
import { checkMessage } from '../lib/validate.js';

const EMPTY = { name: '', email: '', phone: '', company: '', notes: '' };

export default function QuotePage() {
  const { items, remove, setQty, clear } = useQuote();
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [mailto, setMailto] = useState('');
  const [mailText, setMailText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const formRef = useRef(null);
  // Name, email and phone rules (lib/validate.js, shared with the server).
  // Many buyers here answer by phone or WhatsApp, so either one is enough.
  const checks = useContactChecks(form, { prefix: 'q', formRef, extra: (f) => ({ notes: checkMessage(f.notes).error }) });
  const errors = checks.errors;
  const spam = useSpamGuard();
  // Set at once, unlike `sending` state, so clicks in the same instant cannot
  // send twice.
  const busy = useRef(false);

  // In email mode the list stays until the visitor clears it (it used to be
  // emptied before the email was actually sent). Editing it afterwards makes
  // the prepared email out of date, so the form comes back to send it again.
  const sentItems = useRef(null);
  useEffect(() => {
    if (sent && mailto && sentItems.current !== items) setSent(false);
  }, [items, sent, mailto]);
  usePageMeta({ title: 'Your quote list', canonical: '/quote', noindex: true });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy.current || items.length === 0) return;
    const { ok, values } = checks.submit();
    if (!ok) return;
    if (spam.needsToken) { setSendError('Please wait a moment while we run a quick security check, then press send again.'); return; }
    busy.current = true;
    setSending(true);
    setSendError('');
    const res = await sendEnquiry(
      {
        type: 'Quote request',
        name: values.name,
        email: values.email,
        // Sent as +234…, so sales can dial or WhatsApp it as written.
        phone: values.phone,
        company: form.company.trim(),
        notes: form.notes,
        items: items.map((p) => ({ title: p.title, sku: p.sku, qty: p.qty || 1, option: p.option || '' })),
      },
      `Quote request from ${values.name}`,
      spam.guard()
    );
    busy.current = false;
    setSending(false);
    spam.reset();
    if (res.endpoint && !res.ok) {
      // It used to fail silently: the form simply came back. A refusal from
      // the server (rate limit, links, bot check) says why.
      setSendError(res.message || `We couldn’t send your request. Check your connection and try again, or call or WhatsApp us on ${brand.phone}.`);
      return;
    }
    setMailto(res.mailto || '');
    setMailText(res.text || '');
    sentItems.current = items;
    setSent(true);
    if (!res.mailto) clear();
  };

  const startOver = () => { clear(); setSent(false); setForm(EMPTY); checks.reset(); };

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
                        <EnquiryFallback mailto={mailto} text={mailText} />
                        <p className="form-note" style={{ marginTop: 6 }}>
                          Your list stays here until you clear it.{' '}
                          <button type="button" className="link-btn" onClick={() => setSent(false)}>Edit request</button>
                          {' · '}
                          <button type="button" className="link-btn" onClick={startOver}>Clear list</button>
                        </p>
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
                        <input id="q-name" value={form.name} onChange={set('name')} onBlur={checks.blur('name')} autoComplete="name" maxLength={100} {...field('q-name', errors.name)} />
                        {errors.name && <p className="form-error" id="q-name-err">{errors.name}</p>}
                      </div>
                      <div className="field">
                        <label htmlFor="q-company">Company</label>
                        <input id="q-company" value={form.company} onChange={set('company')} autoComplete="organization" maxLength={150} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="field">
                        <label htmlFor="q-email">Work email</label>
                        <input id="q-email" type="email" inputMode="email" autoCapitalize="none" spellCheck={false} value={form.email} onChange={set('email')} onBlur={checks.blur('email')} autoComplete="email" maxLength={254} placeholder="name@company.com" {...field('q-email', errors.email)} />
                        {errors.email && <p className="form-error" id="q-email-err">{errors.email}</p>}
                        {checks.suggestion && (
                          <p className="form-hint" role="status">
                            Did you mean <strong>{checks.suggestion}</strong>?{' '}
                            <button type="button" className="link-btn" onClick={() => setForm((f) => ({ ...f, email: checks.suggestion }))}>Use this</button>
                          </p>
                        )}
                      </div>
                      <div className="field">
                        <label htmlFor="q-phone">Phone / WhatsApp</label>
                        <input id="q-phone" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} onBlur={checks.blur('phone')} autoComplete="tel" maxLength={24} placeholder="0803 123 4567" {...field('q-phone', errors.phone)} />
                        {errors.phone && <p className="form-error" id="q-phone-err">{errors.phone}</p>}
                      </div>
                    </div>
                    <p className="form-note" style={{ marginTop: -6, marginBottom: 14 }}>Give an email or a phone number, or both, so we can send your quote.</p>
                    <div className="field">
                      <label htmlFor="q-notes">Notes (volumes, deadlines, specifications)</label>
                      <textarea id="q-notes" value={form.notes} onChange={set('notes')} onBlur={checks.blur('notes')} maxLength={5000} placeholder="e.g. 500 pairs, need ISO certificates…" {...field('q-notes', errors.notes)} />
                      {errors.notes && <p className="form-error" id="q-notes-err">{errors.notes}</p>}
                    </div>
                    {spam.fields}
                    {sendError && <p className="form-error" role="alert" style={{ marginBottom: 12 }}>{sendError}</p>}
                    <button type="submit" className="btn hx-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={sending} aria-busy={sending}>
                      {sending ? 'Sending…' : <>Send quote request <IconArrowRight width="14" height="14" /></>}
                    </button>
                    <p className="form-note" style={{ marginTop: 10 }}>No payment now. This requests a quotation only. We only use your details to reply to you. <Link to="/privacy">Privacy policy</Link></p>
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
