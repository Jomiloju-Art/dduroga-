/**
 * Client / social-proof entries.
 *
 * NAMES SUPPLIED BY DDUROGA, 13 of them, each now paired with a mark.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PROVENANCE — five different routes, because no single one worked
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Own site, static scrape
 *   Guinness                     guinness-nigeria.com
 *   Dangote Petroleum & Refinery refinery.dangote.com
 *   NIPCO                        nipcoplc.com
 *   Quantum Group                quantumgroupnigeria.com
 *   Olam Group                   olamgroup.com
 *   Saket Agro                   saketgroup.com
 *   Bua Group                    buagroup.com — Cloudflare blocks a browser here
 *                                but not curl, and the site served a 59x62
 *                                WordPress crop that had to be swapped for the
 *                                uncropped original
 * Own site, rendered DOM
 *   Mantrac                      mantracgroup.com — an inline SVG that only
 *                                exists after JS runs
 * Parent brand site
 *   DuFil / Indomie              indomie.com; dufil.com never finishes rendering
 *
 * THIRD-PARTY SOURCES — these four could not be taken from the brands at all,
 * so they come from elsewhere and are worth confirming before launch:
 *
 *   Kelloggs Tolaram     Wikimedia Commons, File:Kellogg's-Logo.svg.
 *                        kelloggs.com answers "Access Denied" and .co.uk
 *                        returns 405, so the brand site was never readable.
 *   Colgate Tolaram      uplead logo API. Their own CDN serves only
 *                        colgate-smile-badge-white, a white mark that is
 *                        invisible on a light strip; every other colourway
 *                        returns 403.
 *   7Up Bottling Company hunter.io logo API. 7up.com sits behind a Cloudflare
 *                        interstitial and its /en page is a JS shell.
 *   Tower Alloys Group   hunter.io logo API. No website exists — only
 *                        business-directory listings.
 *
 * Note on style: Mantrac, Indomie, BUA, Colgate and 7UP publish block lockups
 * with solid grounds. They read heavier in the row than the transparent
 * wordmarks beside them. That is how the brands publish them.
 *
 * Note on shape: Tower Alloys is a portrait mark, so height-normalising leaves
 * it narrow — it reads smaller than its neighbours at strip size.
 *
 * A logo is a trademark, and four of these came from neither the brand nor the
 * client. For a "we supply them" strip this is the usual distributor use, but
 * all thirteen want the same written confirmation the names need.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SPELLINGS TO CONFIRM WITH THE CLIENT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Reproduced EXACTLY as sent, including the ones that look like they want a
 * second look. Nothing has been tidied, because "the company name, exactly as
 * it should appear" is a question only the client can answer:
 *
 *   'DuFil / Indomie'              one company, or two entries?
 *   'Kelloggs Tolaram'             Kellogg's / Kellogg ?
 *   'Dangote Petroleum & Refinery' their registered form? (their own site
 *                                  renders it "Dangote Petroleum Refinery")
 *   '7Up Bottling Company'         7UP ?
 *   'Bua Group'                    BUA ? (their own site renders it "BUA Group")
 *
 * Their message also ended "And many more", which is not treated as an entry.
 */
/* w / h: the PNG's pixel size. ClientLogos sizes each mark from its aspect
   ratio so wide wordmarks and square badges carry the same visual weight. */
export const clients = [
  { name: 'Guinness', logo: '/clients/guinness.png', w: 144, h: 120 },
  { name: 'DuFil / Indomie', logo: '/clients/dufil-indomie.png', w: 182, h: 120 },
  { name: 'Kelloggs Tolaram', logo: '/clients/kelloggs-tolaram.png', w: 344, h: 120 },
  { name: 'Colgate Tolaram', logo: '/clients/colgate-tolaram.png', w: 300, h: 120 },
  { name: 'Dangote Petroleum & Refinery', logo: '/clients/dangote-refinery.png', w: 189, h: 120 },
  { name: 'NIPCO', logo: '/clients/nipco.png', w: 464, h: 120 },
  { name: '7Up Bottling Company', logo: '/clients/7up-bottling.png', w: 128, h: 120 },
  { name: 'Quantum Group', logo: '/clients/quantum-group.png', w: 280, h: 120 },
  { name: 'Tower Alloys Group', logo: '/clients/tower-alloys.png', w: 89, h: 120 },
  { name: 'Olam Group', logo: '/clients/olam-group.png', w: 394, h: 120 },
  { name: 'Bua Group', logo: '/clients/bua-group.png', w: 114, h: 120 },
  { name: 'Mantrac', logo: '/clients/mantrac.png', w: 441, h: 120 },
  { name: 'Saket Agro', logo: '/clients/saket-agro.png', w: 434, h: 120 },
];

/** Clients with a permissioned quote, shown alongside their entry. */
export const testimonials = [];
