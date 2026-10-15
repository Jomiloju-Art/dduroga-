/** Minimal inline icon set (stroke style, inherits currentColor). */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} aria-hidden="true" {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconArrowRight = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} aria-hidden="true" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconDocument = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} aria-hidden="true" {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);

export const IconBox = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} aria-hidden="true" {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);

/** Shopping bag (the quote list). Was a Font Awesome glyph, which showed as an
 *  empty box until the icon font arrived. */
export const IconBag = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} aria-hidden="true" {...p}>
    <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9z" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
  </svg>
);

export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} aria-hidden="true" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconSliders = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} aria-hidden="true" {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const IconChevronRight = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} aria-hidden="true" {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconChevronLeft = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} aria-hidden="true" {...p}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const IconPhone = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} aria-hidden="true" {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const IconMail = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} aria-hidden="true" {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.9 5.7a2 2 0 0 1-2.2 0L2 7" />
  </svg>
);

export const IconMapPin = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} aria-hidden="true" {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconClock = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export const IconShieldCheck = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} aria-hidden="true" {...p}>
    <path d="M12 3 20 6v6c0 4.6-3.2 7.9-8 9-4.8-1.1-8-4.4-8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} aria-hidden="true" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

/* ---------------------------------------------------------------------------
 * Industry marks — one per entry in `industryCatalog`. Drawn on the same
 * 24x24 grid and stroke weight as the rest of the set so they sit evenly
 * beside a label.
 * ------------------------------------------------------------------------- */

/** Construction & Civil — hard hat. Dome, brim and a single centre crest.
 *  Two vertical ribs here read as a radiator grille at 20px, so there is one. */
export const IconHelmet = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M4.5 16.5a7.5 7.5 0 0 1 15 0" />
    <path d="M2 16.5h20" />
    <path d="M12 9.1v7.4" />
  </svg>
);

/** Automobile — car. */
export const IconCar = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M4 16v-4l2.2-4.2A1.5 1.5 0 0 1 7.5 7h9a1.5 1.5 0 0 1 1.3.8L20 12v4" />
    <path d="M4 12h16" />
    <circle cx="7.5" cy="16.5" r="1.6" />
    <circle cx="16.5" cy="16.5" r="1.6" />
  </svg>
);

/** Oil & Gas — flame. A drilling derrick was tried first but the wide base and
 *  two crossbraces read as a traffic cone at 20px. */
export const IconFlame = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M12 4C9 7.5 7 10.1 7 13.1a5 5 0 0 0 10 0c0-2-1-4-3-6.4-.2 1.6-.9 2.6-2 3.2.6-2.4.4-4.2 0-5.9z" />
  </svg>
);

/** Mining & Metallurgy — cut gem. A mountain outline was tried first, but the
 *  adit inside it merged with the slope and it read as two plain hills. */
export const IconGem = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M7 3h10l4 6-9 12L3 9z" />
    <path d="M3 9h18" />
    <path d="m12 21-4-12M12 21l4-12" />
  </svg>
);

/** Manufacturing — sawtooth plant with stack. */
export const IconFactory = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M2 20v-9l5 3.2V11l5 3.2V11l5 3.2V20z" />
    <path d="M17 20V6h4v14" />
    <path d="M2 20h20" />
  </svg>
);

/** Food & Beverage — three-tine fork and knife. */
export const IconUtensils = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M6 3v5M9 3v5M12 3v5" />
    <path d="M6 8v3h6V8" />
    <path d="M9 11v10" />
    <path d="M16.5 3c1.8 3.6 1.8 8.4 0 12v6" />
  </svg>
);

/** Pharmaceuticals — conical flask. */
export const IconFlask = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M9 3h6" />
    <path d="M10 3v6l-4.5 8a2.5 2.5 0 0 0 2.2 3.7h8.6A2.5 2.5 0 0 0 18.5 17L14 9V3" />
    <path d="M7.4 15h9.2" />
  </svg>
);

/** Agriculture — leaf. */
export const IconLeaf = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-6 11-16z" />
    <path d="M4 21c0-6 5-11 12-13" />
  </svg>
);

/** Logistics & Transportation — box truck. */
export const IconTruck = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M2 16V6h11v10" />
    <path d="M13 9h4.5l3.5 4v3h-3" />
    <circle cx="7" cy="17.5" r="2" />
    <circle cx="17.5" cy="17.5" r="2" />
    <path d="M9 17.5h4.5" />
  </svg>
);

/** Chemical & Paint — droplet. Ink box is centred on the 24x24 grid so it sits
 *  level with the others inside a tile badge. */
export const IconDroplet = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M12 3.5c0 0 6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z" />
  </svg>
);

/** Iron & Steel — rolled I-section: two flanges and one web. Extra verticals
 *  at the flange ends made it read as a window grate. */
export const IconIBeam = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M4.5 4h15M4.5 20h15" />
    <path d="M12 4v16" />
  </svg>
);

/** Welding — welding hood with a lens window. A neck stem was tried first and
 *  turned the whole mark into a padlock. */
export const IconWeldingMask = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M6 10a6 6 0 0 1 12 0v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6z" />
    <path d="M8.6 9.4h6.8v3.2H8.6z" />
  </svg>
);

/** Electronics & IT — processor. */
export const IconChip = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9.6 9.6h4.8v4.8H9.6z" />
    <path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
  </svg>
);

/** Heavy Engineering — cog. Two concentric rings plus eight stub teeth; without
 *  the inner ring the radial marks read as a sun. */
export const IconGear = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="6.8" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M12 2.7v2.5M12 21.3v-2.5M2.7 12h2.5M21.3 12h-2.5M18.6 5.4l-1.8 1.8M18.6 18.6l-1.8-1.8M5.4 18.6l1.8-1.8M5.4 5.4l1.8 1.8" />
  </svg>
);

/** Aerospace & Aviation — aircraft, top view. The paper-plane glyph used
 *  earlier is a "send" button, not an aircraft. */
export const IconPlane = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M12 2c1.4 0 2.2 1.6 2.2 3.6v4.2l6.3 3.6v2.2l-6.3-1.9v4.1l2 1.6v1.8L12 20l-4.2 1.2v-1.8l2-1.6v-4.1L3.5 15.6v-2.2l6.3-3.6V5.6C9.8 3.6 10.6 2 12 2z" />
  </svg>
);

/** Defence & Security — shield. */
export const IconShield = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <path d="M12 3 20 6v6c0 4.6-3.2 7.9-8 9-4.8-1.1-8-4.4-8-9V6z" />
  </svg>
);

/** Material Handling — cartons stacked on a pallet. Two cartons beside each
 *  other on a rail read as a bench, so the stack is staggered. */
export const IconPallet = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} aria-hidden="true" {...p}>
    <rect x="7.5" y="3" width="9" height="6" rx="1" />
    <rect x="3" y="11" width="8" height="5.5" rx="1" />
    <rect x="13" y="11" width="8" height="5.5" rx="1" />
    <path d="M2 18.5h20" />
    <path d="M4 18.5V21M20 18.5V21" />
  </svg>
);
