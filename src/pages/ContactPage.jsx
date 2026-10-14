import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { brand } from '../data/brand.js';
import { categories } from '../data/products.js';
import { IconPhone, IconMail, IconMapPin, IconClock, IconCheck } from '../components/Icons.jsx';
import { sendEnquiry } from '../lib/enquiry.js';
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
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const formRef = useRef(null);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    // Email or phone: many buyers here prefer a call or WhatsApp.
    const hasEmail = Boolean(form.email.trim());
    const hasPhone = form.phone.replace(/\D/g, '').length >= 7;
    if (!hasEmail && !hasPhone) next.email = 'Enter an email or a phone number so we can reply.';
    else if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'That email address looks invalid.';
    if (form.phone.trim() && !hasPhone) next.phone = 'That phone number looks too short.';
    if (productParam && !form.message.trim()) next.message = 'Please add a short message.';
    setErrors(next);
    // Move focus to the first problem field.
    const first = ['name', 'email', 'phone', 'message'].find((k) => next[k]);
    if (first) formRef.current?.querySelector(`#cf-${first}`)?.focus();
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await sendEnquiry(
      { type: 'Contact', name: form.name, company: form.company, email: form.email, phone: form.phone, interest: form.interest, message: form.message },
      `Enquiry from ${form.name || 'website visitor'}`
    );
    setSent(true);
    setFallbackMailto(res.mailto || '');
    if (res.endpoint && !res.ok) setSent(false);
  };

  const [fallbackMailto, setFallbackMailto] = useState('');

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
                  Thank you. Your enquiry has been captured.
                </div>
                {fallbackMailto ? (
                  <>
                    <p className="muted" style={{ fontSize: '0.95rem' }}>
                      Send it from your email app to finish, or call or WhatsApp us on {brand.phone}.
                    </p>
                    <a className="btn btn--primary" style={{ marginTop: 16 }} href={fallbackMailto}>
                      Open in email app
                    </a>
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
                    <input id="cf-name" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'cf-name-err' : undefined} />
                    {errors.name && <p className="form-error" id="cf-name-err">{errors.name}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="cf-company">Company</label>
                    <input id="cf-company" value={form.company} onChange={set('company')} autoComplete="organization" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label htmlFor="cf-email">Work email</label>
                    <input id="cf-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'cf-email-err' : undefined} />
                    {errors.email && <p className="form-error" id="cf-email-err">{errors.email}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="cf-phone">Phone / WhatsApp</label>
                    <input id="cf-phone" type="tel" inputMode="tel" placeholder="+234…" value={form.phone} onChange={set('phone')} autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'cf-phone-err' : undefined} />
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
                    placeholder="Application, quantities, standards you need to meet…"
                  />
                  {errors.message && <p className="form-error">{errors.message}</p>}
                </div>

                <div>
                  <button type="submit" className="btn btn--primary">Send enquiry</button>
                  <p className="form-note" style={{ marginTop: 12 }}>
                    By submitting you agree to be contacted about your enquiry. We never share your details.
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
