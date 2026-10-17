/**
 * Homepage curation - small, editable lists so the homepage sections can be
 * re-tuned without touching component code. Everything here references REAL
 * catalogue data (slugs/ids from products.js) - no invented figures.
 */

/** Hero copy - a value promise, not a product name. */
export const heroEyebrow = 'PPE manufacturer & supplier · Lagos, Nigeria';
export const heroHeadline = 'Certified protection for every zone of the job';
export const heroLead =
  'Gloves, footwear, head, eye and body protection engineered for real industrial hazards, supplied in bulk to sites across Nigeria.';

/** Short value ticks under the hero (labels, never statistics). */
export const valueTicks = ['Head-to-toe PPE', 'Certified & compliant', 'Bulk & OEM supply', 'Nationwide delivery'];

/** Industry slugs (from industryCatalog) shown as homepage tiles. */
export const homeIndustries = ['construction', 'oil-gas', 'manufacturing', 'mining', 'logistics', 'chemicals'];

/** Hazard ids (from hazardNames) shown as homepage tiles. */
export const homeHazards = ['cut', 'impact', 'chemical', 'heat', 'electric', 'slip'];

/** Bulk-quote quantity tiers for the closing CTA. */
export const quoteTiers = ['Under 500 units', '500 – 5,000', '5,000 – 50,000', '50,000+'];
