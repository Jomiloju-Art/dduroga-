/**
 * Titles and descriptions for the fixed pages.
 *
 * Shared by the pages themselves (usePageMeta, in the browser) and by
 * scripts/postbuild.mjs, which writes them into a static HTML file per route
 * so that link previews (WhatsApp, LinkedIn, Facebook) and a crawler's first
 * fetch see the right page instead of the homepage. Edit here, not in both.
 */
export const pageMeta = {
  '/': {
    title: null,
    description: 'Certified PPE supplier in Lagos, Nigeria: safety boots, gloves, helmets, hi-vis and workwear for oil & gas, construction and manufacturing. Request a quote online.',
  },
  '/products': {
    title: 'All products',
    description: 'Browse the certified PPE range from DDUROGA Safety: all products.',
  },
  '/about': {
    title: 'About us: PPE supplier in Lagos, Nigeria',
    description: 'DDUROGA Safety is a B2B PPE supplier serving industrial businesses across West Africa: the sole authorized distributor of Mallcom India, and the home of our own brand, Bragoxd.',
  },
  '/learning': {
    title: 'PPE guides and safety standards explained',
    description: 'Industry guides, standards explained and FAQs from DDUROGA Safety.',
  },
  '/contact': {
    title: 'Contact our PPE specialists in Lagos',
    description: 'Talk to our DDUROGA Safety specialists about PPE for your operation.',
  },
  '/certifications': {
    title: 'Certifications & accreditations',
    description: 'Facility accreditations and product certification marks behind the DDUROGA Safety range, manufactured by the Mallcom group.',
  },
  '/search': {
    title: 'Search',
    description: 'Search the DDUROGA Safety PPE catalogue by product name, SKU, type or standard.',
    noindex: true,
  },
  '/quote': {
    title: 'Your quote list',
    noindex: true,
  },
};
