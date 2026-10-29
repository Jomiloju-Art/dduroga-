import { useCallback, useEffect, useRef, useState } from 'react';
import { brand } from '../data/brand.js';
import { track } from '../lib/track.js';

/**
 * Spam checks shared by the contact and quote forms. api/enquiry.js repeats
 * every check on the server, because a bot can post to it directly.
 *
 *   trap       a field people never see (moved off screen, skipped by Tab and
 *              screen readers). Form-filling bots fill every field, so a
 *              filled trap means a bot.
 *   elapsedMs  time since the form appeared. People take several seconds;
 *              bots take under one.
 *   token      Cloudflare Turnstile, when brand.turnstileSiteKey is set. It
 *              usually checks silently and only asks for a click when a
 *              visitor looks automated. If it cannot run at all (script
 *              blocked, or the site's address missing from the widget's
 *              hostnames: error 110200), `unavailable` is set and the
 *              forms hand the enquiry to the visitor's email app instead of
 *              waiting for a token that will never come. The same happens
 *              when it neither passes nor fails within WAIT_MS (a slow
 *              network, a strict browser), unless it is showing the visitor
 *              a box to tick. Each failure is reported once per page
 *              (api/event.js), so api/health.js can raise the alarm.
 *
 * Usage:
 *   const spam = useSpamGuard();
 *   <form>… {spam.fields} …</form>
 *   sendEnquiry(payload, subject, spam.guard()); then spam.reset()
 */
export function useSpamGuard() {
  const started = useRef(0);
  const trapRef = useRef(null);
  const [token, setToken] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const widget = useRef(null);
  useEffect(() => { started.current = Date.now(); }, []);

  const guard = () => ({
    trap: trapRef.current?.value || '',
    elapsedMs: started.current ? Date.now() - started.current : 0,
    token,
    unavailable: unavailable && !token,
  });

  // A Turnstile token works once, so each attempt gets a fresh one.
  const reset = useCallback(() => {
    setToken('');
    if (widget.current != null && window.turnstile) window.turnstile.reset(widget.current);
  }, []);

  const fields = (
    <>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="dd-confirm-ref">Leave this field empty</label>
        <input id="dd-confirm-ref" name="dd_confirm_ref" type="text" tabIndex={-1} autoComplete="off" ref={trapRef} defaultValue="" />
      </div>
      {brand.turnstileSiteKey && <Turnstile onToken={setToken} onFail={setUnavailable} widgetRef={widget} />}
    </>
  );

  return { fields, guard, reset, needsToken: Boolean(brand.turnstileSiteKey) && !token && !unavailable };
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const WAIT_MS = 15000;
let scriptPromise = null;
const loadScript = () => {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT; s.async = true; s.defer = true;
      s.onload = resolve;
      s.onerror = () => { scriptPromise = null; reject(new Error('turnstile')); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
};

function Turnstile({ onToken, onFail, widgetRef }) {
  const box = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let gone = false;
    const reported = new Set();
    const report = (e) => { if (!reported.has(e)) { reported.add(e); track(e); } };
    // Cleared by a token, or by the widget asking the visitor to tick a box
    // (they may take a while, and that is not a failure).
    const timer = setTimeout(() => { if (!gone) { onFail(true); report('turnstile_timeout'); } }, WAIT_MS);
    loadScript().then(() => {
      if (gone || !box.current) return;
      widgetRef.current = window.turnstile.render(box.current, {
        sitekey: brand.turnstileSiteKey,
        appearance: 'interaction-only',
        callback: (t) => { clearTimeout(timer); onFail(false); onToken(t); },
        'before-interactive-callback': () => clearTimeout(timer),
        'expired-callback': () => onToken(''),
        'error-callback': () => { clearTimeout(timer); onToken(''); onFail(true); report('turnstile_error'); },
      });
    }).catch(() => { if (!gone) { clearTimeout(timer); setFailed(true); onFail(true); report('turnstile_error'); } });
    return () => {
      gone = true;
      clearTimeout(timer);
      if (widgetRef.current != null && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [onToken, onFail, widgetRef]);

  return (
    <div className="turnstile-box">
      <div ref={box} />
      {failed && (
        <p className="form-error" role="alert">
          The security check could not load. Check your connection and reload the page, or call or WhatsApp us on {brand.phone}.
        </p>
      )}
    </div>
  );
}
