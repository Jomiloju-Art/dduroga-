import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'dduroga-privacy-ok';

/**
 * First-visit notice: the site sets no tracking cookies, so there is nothing
 * to consent to and nothing is blocked; this only says so and links the
 * privacy page. Shown after mount (never in the prerendered HTML) and hidden
 * for good once OK is tapped.
 */
export default function PrivacyNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setOpen(!localStorage.getItem(KEY)); } catch { /* storage blocked: skip the notice */ }
  }, []);

  if (!open) return null;

  const ok = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    setOpen(false);
  };

  return (
    <div className="privacy-notice" role="region" aria-label="Privacy notice">
      <p>
        We don’t use tracking cookies. Your quote list is saved only on this device.{' '}
        <Link to="/privacy">Privacy policy</Link>
      </p>
      <button type="button" className="btn btn--primary privacy-notice__ok" onClick={ok}>OK</button>
    </div>
  );
}
