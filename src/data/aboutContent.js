/**
 * The About page's copy (AboutPage.jsx), kept apart from the layout.
 * Every fact here is from brand.js or counted from the
 * catalogue; there are no invented figures.
 */
import { brand } from './brand.js';
import { allProducts, zones } from './products.js';

export const aboutTitle = 'Certified protection for Nigerian workers, for the full shift.';

export const aboutLede = `We were established in ${brand.establishedYear} as the wholly owned Nigerian subsidiary of Mallcom, an established manufacturer of personal protective equipment. Mallcom manufactures; DDUROGA sells — bringing that production to Nigerian industry with local stock, local pricing and a Lagos team your procurement and HSE people deal with directly.`;

export const aboutHowWeWork = 'The range is not assembled at arm’s length from whoever has stock. Specification, testing and batch documentation all start with the maker rather than being reconciled after the fact.';

export const aboutValues = [
  {
    title: 'Fit for the hazard',
    text: 'We start from the risk on your site (cut, impact, chemical, heat, electric) and work back to the product, rather than supplying whatever is easiest to move.',
  },
  {
    title: 'Straight about standards',
    text: 'If a product is rated to a given level, that is what its documentation says. We do not put a stronger claim on a box than the test report supports.',
  },
  {
    title: 'Reachable when it matters',
    text: 'A phone line that answers, a WhatsApp number for quick replacements, and a warehouse you can visit in Lagos.',
  },
];

export const aboutFacts = [
  { value: brand.establishedYear, label: 'Established in Lagos' },
  { value: 'Mallcom', label: 'Wholly owned subsidiary' },
  { value: allProducts.length, label: 'Products in the range' },
  { value: zones.length, label: 'Protection zones, head to toe' },
];
