import { useEffect, useState } from 'react';

export const QTY_MAX = 99999;

/**
 * A quantity box that can be typed in, used between the − and + buttons on
 * the product page, in the bag and on the quote list.
 *
 * The earlier box forced every keystroke to a valid number, so clearing it
 * snapped back to 1 and typing "25" over "1" gave "125". This keeps what the
 * visitor types as a draft (digits only, empty allowed) and commits it on blur
 * or Enter, clamped to 1-QTY_MAX. An empty or zero entry falls back to the last
 * valid amount. Focusing selects the number, so typing replaces it.
 */
export default function QtyInput({ value, onChange, label = 'Quantity', className = '' }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (!n || n < 1) { setDraft(String(value)); return; }
    const next = Math.min(n, QTY_MAX);
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <input
      className={className}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      maxLength={String(QTY_MAX).length}
      value={draft}
      aria-label={label}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
      onFocus={(e) => e.target.select()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { setDraft(String(value)); e.currentTarget.blur(); }
      }}
    />
  );
}
