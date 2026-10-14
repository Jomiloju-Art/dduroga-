/**
 * Single source of truth for brand identity and contact details.
 * Brand: DDUROGA Safety.
 */
export const brand = {
  name: 'DDUROGA Safety',
  legalName: 'DDUROGA Safety',
  tagline: 'PPE manufacturer & safety equipment supplier',
  establishedYear: 2019,

  // Backend endpoint for contact / newsletter / quote requests.
  // Leave EMPTY to use the mailto fallback; paste your webhook/email/CRM POST URL here later.
  enquiryEndpoint: '',

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
  address: '44 Jimoh Odutola Street, Off Eric Moore Road, Warehouse 7, Surulere, Lagos, Nigeria',
  hours: 'Mon – Sat, 8:00 – 17:00 WAT',
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
 * Brands DDUROGA distributes, shown small on the homepage certification band
 * under "Exclusive distributor in Nigeria for" (client wording, Oct 2026).
 * DDUROGA is the umbrella brand; these must never outweigh it visually.
 *
 * `logo: null` shows the name as text until the official artwork arrives:
 * use the brand's own logo file, never a redrawn one.
 */
export const brandPartners = [
  { name: 'Mallcom', logo: '/brand/mallcom-logo.png' },
  { name: 'Bragoxd', logo: null }, // FILL: official Bragoxd logo file
];
