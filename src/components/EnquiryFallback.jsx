import { useState } from 'react';
import { brand } from '../data/brand.js';

/**
 * Shown when no form endpoint is set (src/data/brand.js) and an enquiry goes
 * out by email instead. "Open in email app" can do nothing on a PC with no
 * email app set up, and some apps refuse a long link, so the request can also
 * be copied and pasted into an email or WhatsApp.
 */
export default function EnquiryFallback({ mailto, text, buttonClass = 'btn hx-btn', copyClass = 'btn hx-btn hx-btn--outline' }) {
  const [copied, setCopied] = useState(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <p className="muted" style={{ fontSize: '0.95rem' }}>
        Send it from your email app to finish. If no email app opens, copy the request and paste it into an
        email to {brand.email} or a WhatsApp message to {brand.phone}.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        <a className={buttonClass} href={mailto}>Open in email app</a>
        {text && <button type="button" className={copyClass} onClick={copy}>Copy request</button>}
      </div>
      <p className="form-note" role="status" style={{ marginTop: 10, minHeight: '1.4em' }}>
        {copied === true ? 'Copied. Paste it into an email or WhatsApp message.' : copied === false ? 'Copying is blocked in this browser. Please use the email button, or call us.' : ''}
      </p>
    </>
  );
}
