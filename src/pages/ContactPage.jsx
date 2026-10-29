import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { brand } from '../data/brand.js';
import { categories } from '../data/products.js';
import { IconPhone, IconMail, IconMapPin, IconClock, IconCheck } from '../components/Icons.jsx';
import { sendEnquiry } from '../lib/enquiry.js';
import EnquiryFallback from '../components/EnquiryFallback.jsx';
import { useSpamGuard } from '../components/SpamGuard.jsx';
import { useContactChecks } from '../lib/useContactChecks.js';
import { checkMessage } from '../lib/validate.js';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';

const EMPTY = {
  name: '',
  company: '',
  email: '',
  phone: '',
  interest: '',
  message: '',
};

export default function ContactPage() {
  usePageMeta(pageMeta['/contact']);
  const [params] = useSearchParams();
  const productParam = params.get('product');

  const [form, setForm] = useState({
    ...EMPTY,
    // ?interest=dealer (footer "Become a dealer") preselects that option.
    interest: productParam ? `Quote for: ${productParam}` : params.get('interest') === 'dealer' ? 'Becoming a dealer' : '',
    message: productParam ? `I would like a quote for ${productParam}.` : '',
  });
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const formRef = useRef(null);
  // Name, email and phone rules (lib/validate.js, shared with the server).
  // Email or phone: many buyers here prefer a call or WhatsApp.
  const checks = useContactChecks(form, {
    prefix: 'cf',
    formRef,
    extra: (f) => ({ message: checkMessage(f.message, { required: Boolean(productParam) }).error }),
  });
  const errors = checks.errors;
  const spam = useSpamGuard();
  // Set at once, unlike `sending` state, so clicks in the same instant cannot
  // send twice.
  const busy = useRef(false);

  const [fallbackMailto, setFallbackMailto] = useState('');
  const [fallbackText, setFallbackText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    const { ok, values } = checks.submit();
    if (!ok) return;
    if (spam.needsToken) { setSendError('Please wait a moment while we run a quick security check, then press send again.'); return; }
    busy.current = true;
    setSending(true);
    setSendError('');
    const res = await sendEnquiry(
      // Phone sent as +234…, so sales can dial or WhatsApp it as written.
      { type: 'Contact', name: values.name, company: form.company.trim(), email: values.email, phone: values.phone, interest: form.interest, message: form.message.trim() },
      `Enquiry from ${values.name}`,
      spam.guard()
    );
    busy.current = false;
    setSending(false);
    spam.reset();
    if (res.endpoint && !res.ok) {
      // It used to fail silently: the form simply came back. A refusal from
      // the server (rate limit, links, bot check) says why.
      setSendError(res.message || `We couldn’t send your enquiry. Check your connection and try again, or call or WhatsApp us on ${brand.phone}.`);
      return;
    }
    setFallbackMailto(res.mailto || '');
    setFallbackText(res.text || '');
    setSent(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to our safety specialist"
        lead="Whether you're kitting out a plant in Port Harcourt or a construction site in Lagos, tell us what you need and we'll quote it."
      />

      <section className="section">
        <div className="container contact-grid">
          {/* Info column */}
          <div>
            <div className="panel" style={{ marginBottom: 20 }}>
              <h2>Contact details</h2>
              <ul className="contact-lines">
                <li>
                  <IconMapPin width="18" height="18" /> {brand.address}
                </li>
                <li>
                  <IconPhone width="18" height="18" />
                  <a href={brand.phoneHref}>{brand.phone}</a>
                </li>
                <li>
                  <IconMail width="18" height="18" />
                  <a href={brand.emailHref}>{brand.email}</a>
                </li>
                <li>
                  <IconClock width="18" height="18" /> {brand.hours}
                </li>
              </ul>
            </div>
            <div className="panel">
              <h2>What happens next?</h2>
              <p className="muted" style={{ fontSize: '0.95rem' }}>
                We match your enquiry to one of our specialists for your industry, confirm certified product
                options, and send samples or documentation on request.
              </p>
            </div>
          </div>

          {/* Form column */}
          <div>
            {sent ? (
              <div className="panel" role="status">
                <div className="form-success" style={{ marginBottom: 16 }}>
                  <IconCheck width="18" height="18" style={{ display: 'inline', verticalAlign: -3, marginRight: 8 }} />
                  {fallbackMailto ? 'Your enquiry is ready to send.' : 'Thank you. Your enquiry has been sent.'}
                </div>
                {fallbackMailto ? (
                  <>
                    <EnquiryFallback mailto={fallbackMailto} text={fallbackText} />
                    <p className="form-note" style={{ marginTop: 6 }}>
                      <button type="button" className="link-btn" onClick={() => setSent(false)}>Edit enquiry</button>
                    </p>
                  </>
                ) : (
                  <p className="muted" style={{ fontSize: '0.95rem' }}>
                    We'll get back to you as soon as we can.
                  </p>
                )}
              </div>
            ) : (
              <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="cf-name">Full name <span className="req">*</span></label>
                    <input id="cf-name" value={form.name} onChange={set('name')} onBlur={checks.blur('name')} autoComplete="name" maxLength={100} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'cf-name-err' : undefined} />
                    {errors.name && <p className="form-error" id="cf-name-err">{errors.name}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="cf-company">Company</label>
                    <input id="cf-company" value={form.company} onChange={set('company')} autoComplete="organization" maxLength={150} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label htmlFor="cf-email">Work email</label>
                    <input id="cf-email" type="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="name@company.com" value={form.email} onChange={set('email')} onBlur={checks.blur('email')} autoComplete="email" maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'cf-email-err' : undefined} />
                    {errors.email && <p className="form-error" id="cf-email-err">{errors.email}</p>}
                    {checks.suggestion && (
                      <p className="form-hint" role="status">
                        Did you mean <strong>{checks.suggestion}</strong>?{' '}
                        <button type="button" className="link-btn" onClick={() => setForm((f) => ({ ...f, email: checks.suggestion }))}>Use this</button>
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="cf-phone">Phone / WhatsApp</label>
                    <input id="cf-phone" type="tel" inputMode="tel" placeholder="0803 123 4567" value={form.phone} onChange={set('phone')} onBlur={checks.blur('phone')} autoComplete="tel" maxLength={24} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'cf-phone-err' : undefined} />
                    {errors.phone && <p className="form-error" id="cf-phone-err">{errors.phone}</p>}
                  </div>
                </div>
                <p className="form-note" style={{ marginTop: -6, marginBottom: 14 }}>Give an email or a phone number, or both, so we can reply.</p>

                <div className="field">
                  <label htmlFor="cf-interest">I am interested in</label>
                  <select id="cf-interest" value={form.interest} onChange={set('interest')}>
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.label}>{c.label}</option>
                    ))}
                    <option value="Custom / OEM program">Custom / OEM program</option>
                    <option value="Becoming a dealer">Becoming a dealer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="cf-message">Message {productParam && <span className="req">*</span>}</label>
                  <textarea
                    id="cf-message"
                    value={form.message}
                    onChange={set('message')}
                    onBlur={checks.blur('message')}
                    maxLength={5000}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'cf-message-err' : undefined}
                    placeholder="Application, quantities, standards you need to meet…"
                  />
                  {errors.message && <p className="form-error" id="cf-message-err">{errors.message}</p>}
                </div>

                <div>
                  {spam.fields}
                  {sendError && <p className="form-error" role="alert" style={{ marginBottom: 12 }}>{sendError}</p>}
                  <button type="submit" className="btn btn--primary" disabled={sending} aria-busy={sending}>{sending ? 'Sending…' : 'Send enquiry'}</button>
                  <p className="form-note" style={{ marginTop: 12 }}>
                    By submitting you agree to be contacted about your enquiry. We never share your details. <Link to="/privacy">Privacy policy</Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
