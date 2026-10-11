/**
 * Single source of truth for brand identity and contact details.
 * Brand: DDUROGA Safety. Update the real contact details before launch.
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
   * CONTACT BLOCK — STILL PLACEHOLDERS, DELIBERATELY.
   *
   * The phone, WhatsApp and email below have not been supplied by the client, so
   * they remain obvious non-dialable placeholders rather than invented numbers.
   * A fabricated Nigerian line or address on a live supplier site is worse than
   * a visible gap: it misroutes real buyers and it is a liability.
   *
   * Before launch, replace all five values. There is a checklist marker here so
   * a `FILL:` search finds the one place that must change:
   *   FILL: phone, phoneHref, whatsapp, email, emailHref
   *
   * The hours string was the one value that was actually WRONG rather than
   * missing: it read `Mon – Sat, 9:00 – 18:00 IST`, Indian Standard Time, on a
   * Lagos operation. Corrected to WAT (West Africa Time, UTC+1), which is
   * Nigeria's real zone.
   */
  phone: '+234 000 000 0000',
  phoneHref: 'tel:+2340000000000',
  whatsapp: '2340000000000', // digits only, no '+' - WhatsApp wa.me link
  email: 'sales@ddurogasafety.example',
  emailHref: 'mailto:sales@ddurogasafety.example',
  address: '44 Jimoh Odutola Street, Off Eric Moore Road, Warehouse 7, Surulere, Lagos, Nigeria',
  hours: 'Mon – Sat, 8:00 – 17:00 WAT',
};

/**
 * Marks shown in the certification row.
 *
 * 'ISI Marked' was removed on client feedback — the BIS/ISI mark is an Indian
 * domestic market certification and does not apply to a Nigerian supplier, so
 * displaying it claimed a credential the business cannot stand behind.
 */
export const complianceMarks = ['ISO 9001', 'CE Certified', 'EN / IS standards'];
