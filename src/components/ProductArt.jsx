/**
 * Decorative SVG artwork per product category.
 * Simple geometric pictograms - replace with real product photography
 * (see .card-art / .detail-art backgrounds) when you have it.
 * tone="light" renders white pictograms for dark backgrounds.
 */

const palettes = {
  dark: { stroke: '#161b22', accent: '#f28a1a', frame: 'rgba(22,27,34,0.07)' },
  light: { stroke: '#ffffff', accent: '#f28a1a', frame: 'rgba(255,255,255,0.14)' },
};

function Frame({ p, children, size = '100%' }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="52" fill={p.frame} />
      {children}
    </svg>
  );
}

/* --- Hand protection: mitt + cuff --- */
function Hand({ p }) {
  return (
    <Frame p={p}>
      <rect x="50" y="38" width="22" height="46" rx="11" fill={p.stroke} />
      <circle cx="45" cy="60" r="9" fill={p.stroke} />
      <rect x="40" y="84" width="40" height="15" rx="7.5" fill={p.stroke} />
      <circle cx="61" cy="26" r="4.5" fill={p.accent} />
    </Frame>
  );
}

/* --- Foot protection: boot shaft + sole --- */
function Foot({ p }) {
  return (
    <Frame p={p}>
      <rect x="55" y="26" width="16" height="40" rx="5" fill={p.stroke} />
      <rect x="51" y="52" width="22" height="16" rx="8" fill={p.stroke} />
      <rect x="36" y="76" width="54" height="11" rx="5.5" fill={p.stroke} />
      <path d="M36 78h54" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />
      <rect x="82" y="34" width="9" height="16" rx="4.5" fill={p.accent} />
    </Frame>
  );
}

/* --- Eye & face protection: dual-lens goggles --- */
function Eye({ p }) {
  return (
    <Frame p={p}>
      <rect x="24" y="46" width="33" height="25" rx="12.5" fill="none" stroke={p.stroke} strokeWidth="6" />
      <rect x="63" y="46" width="33" height="25" rx="12.5" fill="none" stroke={p.stroke} strokeWidth="6" />
      <path d="M57 58.5h6" stroke={p.stroke} strokeWidth="6" strokeLinecap="round" />
      <path d="M24 56h-10M96 56h10" stroke={p.stroke} strokeWidth="6" strokeLinecap="round" />
      <path d="m33 60 8-8M72 60l8-8" stroke={p.accent} strokeWidth="4" strokeLinecap="round" />
    </Frame>
  );
}

/* --- Head protection: helmet dome + brim --- */
function Head({ p }) {
  return (
    <Frame p={p}>
      <path d="M34 66a26 26 0 0 1 52 0z" fill={p.stroke} />
      <rect x="27" y="64" width="66" height="9" rx="4.5" fill={p.stroke} />
      <circle cx="50" cy="42" r="3.5" fill={p.accent} />
      <circle cx="70" cy="42" r="3.5" fill={p.accent} />
      <path d="M60 62v-6" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </Frame>
  );
}

/* --- Respiratory protection: band + mask + filter pods --- */
function Respiratory({ p }) {
  return (
    <Frame p={p}>
      <path d="M32 52a28 28 0 0 1 56 0" fill="none" stroke={p.stroke} strokeWidth="6" strokeLinecap="round" />
      <rect x="30" y="50" width="60" height="24" rx="12" fill={p.stroke} />
      <circle cx="48" cy="80" r="7.5" fill="none" stroke={p.accent} strokeWidth="4.5" />
      <circle cx="72" cy="80" r="7.5" fill="none" stroke={p.accent} strokeWidth="4.5" />
    </Frame>
  );
}

/* --- Protective clothing: smock + hi-vis bands --- */
function Apparel({ p }) {
  return (
    <Frame p={p}>
      <rect x="44" y="26" width="32" height="9" rx="4.5" fill={p.stroke} />
      <rect x="24" y="30" width="14" height="26" rx="7" fill={p.stroke} />
      <rect x="82" y="30" width="14" height="26" rx="7" fill={p.stroke} />
      <rect x="42" y="34" width="36" height="52" rx="10" fill={p.stroke} />
      <rect x="46" y="46" width="28" height="8" rx="4" fill={p.accent} />
      <rect x="46" y="66" width="28" height="8" rx="4" fill="#fff" />
    </Frame>
  );
}

const art = { hand: Hand, foot: Foot, eye: Eye, head: Head, respiratory: Respiratory, apparel: Apparel };

/**
 * Renders artwork for a category id. Unknown ids fall back to a shield.
 * @param {{category: string, size?: string|number, label?: string, tone?: 'dark'|'light'}} props
 */
export default function ProductArt({ category, size = '100%', label, tone = 'dark' }) {
  const p = palettes[tone] || palettes.dark;
  const Art = art[category];
  if (!Art) {
    return (
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" role={label ? 'img' : undefined} aria-label={label}>
        <path d="M60 8 104 22v34c0 31-19 52-44 60-25-8-44-29-44-60V22z" fill={p.stroke} />
        <path d="m48 62 8 8 18-20" fill="none" stroke={p.accent} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return <Art p={p} />;
}
