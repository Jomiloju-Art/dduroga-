import { useEffect, useRef } from 'react';

/**
 * Side drawer with the details behind one accreditation logo.
 *
 * Shows the mark, its name and what it certifies, and nothing else: the
 * certificate facts, the parent-company note and the certificate / verify
 * buttons were removed at the client's request (Oct 2026). Those facts were
 * all still "To be supplied", so the drawer is shorter and promises nothing.
 *
 * Behaves as a modal dialog: focus moves to the close button on open, Tab is
 * kept inside, Escape and the scrim close it, and focus returns to the logo.
 */
export default function AccreditationDrawer({ item, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const open = Boolean(item);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = [...panelRef.current.querySelectorAll('button:not([disabled]), a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && opener.focus) opener.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <div className={`accr-scrim${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className={`accr-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accr-drawer-title"
        aria-hidden={!open}
        inert={open ? undefined : ''}
      >
        {item && (
          <>
            <div className="accr-drawer__top">
              <span className="accr-pill">{item.kind === 'facility' ? 'Facility accreditation' : 'Product certification mark'}</span>
              <button ref={closeRef} type="button" className="accr-drawer__close" onClick={onClose} aria-label="Close">×</button>
            </div>
            <div className="accr-drawer__body">
              <div className="accr-drawer__logo"><img src={item.logo} alt={`${item.name} logo`} /></div>
              <h2 id="accr-drawer-title">{item.name}</h2>
              <p>{item.what}</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
