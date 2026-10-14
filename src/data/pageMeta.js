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
    description: 'DDUROGA Safety: certified head-to-toe PPE for industry. Gloves, footwear, head, eye and body protection, supplied in bulk across Nigeria.',
  },
  '/products': {
    title: 'All products',
    description: 'Browse the certified PPE range from DDUROGA Safety: all products.',
  },
  '/about': {
    title: 'About us',
    description: 'DDUROGA Safety is a Nigerian PPE supplier and the wholly owned Nigerian subsidiary of Mallcom, supplying certified protection to industry nationwide from our Lagos warehouse.',
  },
  '/learning': {
    title: 'Learning centre',
    description: 'Industry guides, standards explained and FAQs from DDUROGA Safety.',
  },
  '/contact': {
    title: 'Contact us',
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
