/**
 * Single source of truth for brand identity and contact details.
 * Brand: DDUROGA Safety.
 */
export const brand = {
  name: 'DDUROGA Safety',
  legalName: 'DDUROGA Safety',
  tagline: 'PPE manufacturer & safety equipment supplier',
  establishedYear: 2019,

  // Where the contact and quote forms send to: the site's own function
  // (api/enquiry.js), which emails the sales inbox. Until its keys are set in
  // Vercel it answers "not configured" and the forms fall back to the
  // visitor's email app. Leave EMPTY to always use that fallback.
  enquiryEndpoint: '/api/enquiry',

  // Cloudflare Turnstile site key (public). Empty = no bot check on the forms.
  // The matching secret goes in Vercel as TURNSTILE_SECRET_KEY; set both.
  turnstileSiteKey: '0x4AAAAAAFZUqhtf5EDFDn-O',

  /*
   * CONTACT BLOCK — from the client's own "Mallcom Nigeria - Business Profile
   * & Mini Catalogue" (contact page): +234 907 225 4796 and sales@dduroga.com.
   *
   * FILL: confirm the WhatsApp number. It is set to the same line as the phone
   * because the catalogue prints only one number; change it if WhatsApp runs on
   * a different line.
   *
   * The hours string was the one value that was actually WRONG rather than
   * missing: it read `Mon – Sat, 9:00 – 18:00 IST`, Indian Standard Time, on a
   * Lagos operation. Corrected to WAT (West Africa Time, UTC+1), which is
   * Nigeria's real zone.
   */
  phone: '+234 907 225 4796',
  phoneHref: 'tel:+2349072254796',
  whatsapp: '2349072254796', // digits only, no '+' - WhatsApp wa.me link
  email: 'sales@dduroga.com',
  emailHref: 'mailto:sales@dduroga.com',
  address: '44 Jimoh Odutola Street, Off Eric Moore Road, Surulere, Lagos, Nigeria',
  hours: 'Mon – Sat, 8:00 – 18:00 WAT', // closing time confirmed by the client, Oct 2026
};

/**
 * Social profiles. The footer shows an icon only for a filled entry, so an
 * empty one never renders a dead link.
 *
 * LinkedIn is DDUROGA's own company page (Lagos, "Mallcom India and the owner
 * of the Bragoxd brand"). YouTube and X are Mallcom's official accounts, as
 * linked from mallcom.in, on the client's instruction (Oct 2026).
 * FILL: Instagram and Facebook. No DDUROGA account could be found, and
 * guessing a handle risks linking to someone else's.
 */
export const social = {
  YouTube: 'https://www.youtube.com/user/MallcomIndia',
  Facebook: '',
  LinkedIn: 'https://www.linkedin.com/company/dduroga/',
  Instagram: '',
  X: 'https://x.com/mallcom_india',
};

/**
 * DDUROGA's brands, shown small on the homepage certification band
 * as "Mallcom (authorized distributor) · Bragoxd (our brand)" (client wording,
 * Oct 2026; Bragoxd is DDUROGA's own brand, not a distributed one).
 * DDUROGA is the umbrella brand; these must never outweigh it visually.
 *
 * `logo` is the brand's own logo file, never a redrawn one; `mark: true` means
 * the file is a symbol only, so the name is set beside it. Bragoxd uses
 * DDUROGA's shield (client, Oct 2026).
 */
export const brandPartners = [
  { name: 'Mallcom', logo: '/brand/mallcom-logo.png', role: 'authorized distributor' },
  { name: 'Bragoxd', logo: '/logo-mark.png', mark: true, role: 'our brand' },
];
