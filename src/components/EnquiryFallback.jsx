import { useEffect, useRef, useState } from 'react';
import { brand } from '../data/brand.js';

/**
 * Shown when the site cannot send an enquiry itself (no sending service set
 * up yet, or it failed), so the visitor sends the prepared request instead.
 *
 * "Open in email app" (a mailto: link) does nothing at all on a computer with
 * no email program set up, which is most office PCs and anyone who uses Gmail
 * in the browser. So it is the last option, not the first:
 *
 *   1. WhatsApp, with the whole request typed in (WhatsApp Web on a PC)
 *   2. Gmail in the browser, with the email filled in
 *   3. the computer's email app; if nothing opens within a moment, a hint
 *      points back to 1 and 2
 *   4. copy the request, to paste anywhere
 */
const WaIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.04c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.32 11.32 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.7L.55 23.63l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
  </svg>
);

/** Subject and body back out of the mailto: link sendEnquiry built. */
function parts(mailto) {
  try {
    const q = new URLSearchParams(mailto.slice(mailto.indexOf('?') + 1));
    return { subject: q.get('subject') || '', body: q.get('body') || '' };
  } catch {
    return { subject: '', body: '' };
  }
}

export default function EnquiryFallback({ mailto, text }) {
  const [copied, setCopied] = useState(null);
  const [noMailApp, setNoMailApp] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const { subject, body } = parts(mailto);
  const whatsapp = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(text)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(brand.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // A mailto: link that opens an app takes focus away from the page. If the
  // page has not lost focus a moment later, nothing opened.
  const tryMailApp = () => {
    setNoMailApp(false);
    let left = false;
    const away = () => { left = true; };
    window.addEventListener('blur', away, { once: true });
    document.addEventListener('visibilitychange', away, { once: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      window.removeEventListener('blur', away);
      document.removeEventListener('visibilitychange', away);
      if (!left) setNoMailApp(true);
    }, 1500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="ef">
      <p className="muted ef__lead">Send it to us in one tap, on WhatsApp or by email.</p>
      <a className="ef__wa" href={whatsapp} target="_blank" rel="noopener noreferrer">
        <WaIcon /> Send on WhatsApp
      </a>
      <div className="ef__row">
        <a className="ef__btn" href={gmail} target="_blank" rel="noopener noreferrer">Open in Gmail</a>
        <a className="ef__btn" href={mailto} onClick={tryMailApp}>Other email app</a>
      </div>
      {noMailApp && (
        <p className="form-hint ef__hint" role="status">
          Nothing opened? This computer may not have an email app set up. Use WhatsApp or Gmail above, or copy the request below.
        </p>
      )}
      <p className="form-note ef__copy">
        <button type="button" className="link-btn" onClick={copy}>Copy request</button>
        {' '}to paste into any email to {brand.email}, or call {brand.phone}.
      </p>
      <p className="form-note" role="status" style={{ minHeight: '1.4em', margin: 0 }}>
        {copied === true ? 'Copied. Paste it into an email or WhatsApp message.' : copied === false ? 'Copying is blocked in this browser. Please use one of the buttons above, or call us.' : ''}
      </p>
    </div>
  );
}
