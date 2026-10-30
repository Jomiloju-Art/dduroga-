import { useState } from 'react';
import { checkContact } from './validate.js';

/**
 * Live checks for the name, email and phone fields of the quote and contact
 * forms (rules in validate.js, shared with the server).
 *
 * A field is checked when the visitor leaves it, not while they type, and once
 * its message shows it updates as they type, so it clears the moment the field
 * is right. Submitting checks everything and moves focus to the first problem.
 *
 *   const checks = useContactChecks(form, { prefix: 'q', formRef, extra });
 *   <input onBlur={checks.blur('email')} {...} />  {checks.errors.email}
 *   const { ok, values } = checks.submit();
 *
 * `extra(form)` adds page-specific errors, e.g. { message: '…' }.
 */
const ORDER = ['name', 'email', 'phone', 'message', 'notes'];

export function useContactChecks(form, { prefix, formRef, extra }) {
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const result = checkContact(form);
  const all = { ...result.errors, ...(extra ? extra(form) : {}) };

  const errors = {};
  for (const [key, msg] of Object.entries(all)) {
    if (msg && (submitted || touched[key])) errors[key] = msg;
  }

  const blur = (key) => () => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const submit = () => {
    setSubmitted(true);
    const ok = Object.values(all).every((m) => !m);
    if (!ok) {
      // Keyboard and screen-reader users land on the first problem.
      const first = ORDER.find((k) => all[k]);
      if (first) formRef.current?.querySelector(`#${prefix}-${first}`)?.focus();
    }
    return { ok, values: result.values };
  };

  const reset = () => { setTouched({}); setSubmitted(false); };

  return {
    errors,
    blur,
    submit,
    reset,
    // A likely typo in a common email domain, offered once the field is left.
    suggestion: touched.email || submitted ? result.suggestion : '',
  };
}
