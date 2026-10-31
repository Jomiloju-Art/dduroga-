import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import SearchModal from './SearchModal.jsx';
import { categories, industryCatalog } from '../data/products.js';
import { guides } from '../data/guides.js';
import { standards, zoneLabels } from '../data/standards.js';
import { faqs } from '../data/faqs.js';
import { IconArrowRight, IconSearch, IconBag, IconClose, IconChevronLeft, IconChevronRight } from './Icons.jsx';
import { useQuote } from '../quote/QuoteContext.jsx';
import { useScrollLock } from '../lib/scrollLock.js';

/** Entries shown per column in the Products mega panel before the "All …" link. */
const MEGA_ITEMS = 6;

/* The Learning mega panel (client's request, 31 Oct 2026): guides, standards
   and tests, FAQs. A guide's menu label is its title up to the colon
   ("Cut resistance explained: EN 388 vs …" -> "Cut resistance explained"). */
const guideLabel = (g) => g.title.split(':')[0];
const STANDARD_ZONES = ['head', 'hand', 'body', 'feet'].map((z) => ({ id: z, label: zoneLabels[z], count: standards.filter((s) => s.zone === z).length }));

/* The homepage header used to sit see-through over the hero photo, which left
   the navy half of the logo hard to read on the dark image. It is now the same
   white bar as every other page (Oct 2026). Set true to bring the transparent
   treatment back; the hero would then also need its hx-hero--under-header
   class and top shade again (HomePage.jsx). */
const HERO_UNDER_HEADER = false;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sub, setSub] = useState(null);
  /* Which of the four header states we are in. Two booleans, because the header
     changes for two independent reasons: the page scrolled, and the pointer is
     on the header. See the stylesheet for what each one does. */
  const [scrolled, setScrolled] = useState(false);
  /* True while the pointer or keyboard focus is on the mega-menu trigger. Used
     only to mirror that state onto the header, so CSS can react to it. */
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  /* Home is the only route with a hero tall enough to sit under the header, so
     it is the only route where the transparent treatment is used. */
  const [transparentRoute, setTransparentRoute] = useState(false);
  const { pathname } = useLocation();
  const { count, openBag } = useQuote();
  const drawerRef = useRef(null);
  const lastY = useRef(0);

  useEffect(() => {
    setTransparentRoute(HERO_UNDER_HEADER && pathname === '/');
  }, [pathname]);

  /* The scroll behaviour, copied from Gymshark:

       down  -> the header slides up out of view
       up    -> it comes back, white
       top   -> transparent again over the hero

     They drive it on scroll DIRECTION, not position: at 2000px down it is
     hidden, and scrolling up 20px brings it back while still deep in the page.
     So the check is against the previous position, and a small dead zone stops
     a jittery trackpad flickering it in and out. */
  /* Where the header stops being "over the hero". On the homepage that is the
     hero's bottom edge less the header's height: until then the header stays
     transparent and never hides. It used to switch at 8px, so the first scroll
     painted a white bar over the dark hero and slid it away in the same moment,
     a white flash. Other routes keep the 8px switch. */
  useEffect(() => {
    const threshold = () => {
      if (!transparentRoute) return 8;
      const hero = document.querySelector('.hx-hero');
      if (!hero) return 8;
      const header = document.querySelector('.site-header');
      return Math.max(8, hero.getBoundingClientRect().bottom + window.scrollY - (header?.offsetHeight || 74));
    };
    // Where the header's bottom edge sits in the window, for the mega-menu
    // backdrop (.menu-backdrop starts there). It moves: the contact bar
    // (TopBar.jsx) sits above the header until it scrolls away. Worked out
    // from the bar and the header's height rather than the header's own box,
    // so the slide-away transform cannot leave it stale.
    const setHeaderBottom = () => {
      const bar = document.querySelector('.topbar');
      const header = document.querySelector('.site-header');
      const top = Math.max(0, bar ? bar.getBoundingClientRect().bottom : 0);
      document.documentElement.style.setProperty('--hdr-bottom', `${Math.round(top + (header?.offsetHeight || 74))}px`);
    };
    const onScroll = () => {
      setHeaderBottom();
      const y = window.scrollY;
      const delta = y - lastY.current;
      const end = threshold();

      setScrolled(y > end);
      if (y <= end) {
        setHidden(false);
      } else if (Math.abs(delta) > 4) {
        setHidden(delta > 0);        // moving down hides, moving up reveals
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [transparentRoute]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Reset any open sub-menu when the drawer closes.
  useEffect(() => {
    if (!open) setSub(null);
  }, [open]);

  // Tap anywhere outside the drawer (or press Escape) to close it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Lock the page behind the drawer so only the drawer scrolls.
  useScrollLock(open);

  return (
    /* The four header states, as class modifiers on the header itself.
       Names mirror Gymshark's own modifiers (--transparent, --scrolled,
       --hidden, --solid) so the CSS reads the same way.

       `is-keyboard-focused` is set only while the pointer is NOT the last thing
       used. It exists because focus-within fires for a mouse click too: clicking
       the Home link left focus on it, the header gained :focus-within, and on
       the homepage that defeated the :not(:focus-within) in the transparent
       rules - so the header stayed white until something else was clicked.
       Gating it on the keyboard session means a click no longer counts, while
       tabbing into the nav still makes the header solid. */
    <header
      className={[
        'site-header',
        transparentRoute ? 'site-header--transparent' : 'site-header--solid',
        scrolled ? 'site-header--scrolled' : '',
        hidden && !open && !menuOpen ? 'site-header--hidden' : '',
        menuOpen ? 'is-menu-open' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* The backdrop that blurs the page while a mega menu is open.
          Structure and values copied from Gymshark's own stylesheet:
              .menu-backdrop { position:fixed; opacity:0; z-index:-999;
                               background:transparent; pointer-events:none; visibility:hidden }
              .menu-backdrop.is-visible { opacity:1; visibility:visible;
                                          background:rgba(0,0,0,.3);
                                          backdrop-filter:blur(10px) }
          It only becomes visible while the pointer or focus is inside .mega-wrap,
          which is the same trigger that opens the panel itself - so the blur and
          the panel cannot get out of step. pointer-events stays none even when
          visible, so it can never intercept a click meant for the page. */}
      <div className="menu-backdrop" aria-hidden="true" />

      {/* No inline background here. The navbar's fill is driven entirely by CSS so
          it can change with the menu state - transparent at rest so the page
          shows through, solid white while a menu is open so the header and the
          panel below fuse into one surface. An inline style would win over the
          stylesheet and the header could never change. */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="container">
          <Logo href="/" compactOnMobile />

          <div className={`nav-menu ${open ? 'open' : ''}`} ref={drawerRef}>
            <div className="nav-drawer-head">
              <button type="button" className="nav-close" onClick={() => setOpen(false)} aria-label="Close menu">
                <IconClose width="14" height="14" />
              </button>
            </div>

            {/* Mobile: sub-menu header (back + title) */}
            {sub && (
              <div className="nav-mobile-head">
                <button type="button" className="nav-mobile-back" onClick={() => setSub(null)} aria-label="Back">
                  <IconChevronLeft width="20" height="20" />
                </button>
                <span className="nav-mobile-head__title">
                  {{ products: 'Products', industries: 'Industries', learning: 'Learning' }[sub]}
                </span>
              </div>
            )}

            <ul className="nav-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  Home
                </NavLink>
              </li>

              {/* Products mega menu (desktop hover) */}
              <li
                className="mega-wrap"
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
                onFocus={() => setMenuOpen(true)}
                onBlur={() => setMenuOpen(false)}
              >
                <NavLink
                  to="/products"
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  Products
                </NavLink>
                <div className="mega-panel" aria-label="Products submenu">
                  <div className="mega-cols">
                    <div className="mega-col">
                      <h4>By protection</h4>
                      <ul>
                        {categories.map((c) => (
                          <li key={c.id}>
                            <Link to={`/products?cat=${c.id}`}>{c.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* The "By hazard" column was removed at the client's request (Oct 2026);
                        hazards remain a filter on /products. Industry is capped at six. This panel is a
                        shortcut into the catalogue, not an index of it — the
                        full sets of 17 and 26 live in the /products filters,
                        one click away via the "All …" link. Ten and eleven
                        entries here made the panel 570px tall and left the
                        four-item protection column stranded beside it. */}
                    <div className="mega-col">
                      <h4>By industry</h4>
                      <ul>
                        {industryCatalog.slice(0, MEGA_ITEMS).map((i) => (
                          <li key={i.slug}>
                            <Link to={`/products?industry=${i.slug}`}>{i.label}</Link>
                          </li>
                        ))}
                      </ul>
                      <Link className="mega-col__all" to="/products#facet-industry">
                        All {industryCatalog.length} industries
                      </Link>
                    </div>
                  </div>

                  <Link className="mega-foot" to="/products">
                    View the full catalogue <IconArrowRight width="14" height="14" />
                  </Link>
                </div>
              </li>

              <li>
                <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  About Us
                </NavLink>
              </li>
              {/* Learning mega menu (desktop hover), built like Products. */}
              <li
                className="mega-wrap"
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
                onFocus={() => setMenuOpen(true)}
                onBlur={() => setMenuOpen(false)}
              >
                <NavLink to="/learning" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  Learning
                </NavLink>
                <div className="mega-panel" aria-label="Learning submenu">
                  <div className="mega-cols">
                    <div className="mega-col">
                      <h4>Guides</h4>
                      <ul>
                        {guides.slice(0, MEGA_ITEMS).map((g) => (
                          <li key={g.slug}>
                            <Link to={`/learning/${g.slug}`}>{guideLabel(g)}</Link>
                          </li>
                        ))}
                      </ul>
                      <Link className="mega-col__all" to="/learning#guides">
                        All {guides.length} guides
                      </Link>
                    </div>

                    <div className="mega-col">
                      <h4>Standards &amp; tests</h4>
                      <ul>
                        {STANDARD_ZONES.map((z) => (
                          <li key={z.id}>
                            <Link to={`/learning#standards-${z.id}`}>{z.label} protection <span className="mega-col__n">{z.count}</span></Link>
                          </li>
                        ))}
                        <li><Link to="/learning#tests">How products are tested</Link></li>
                      </ul>
                      <Link className="mega-col__all" to="/learning#standards">
                        All {standards.length} standards
                      </Link>
                    </div>

                    <div className="mega-col mega-col--text">
                      <h4>FAQs</h4>
                      <ul>
                        {faqs.map((f, i) => (
                          <li key={f.q}>
                            <Link to={`/learning#faq-${i + 1}`}>{f.q}</Link>
                          </li>
                        ))}
                      </ul>
                      <Link className="mega-col__all" to="/learning#faq">
                        All FAQs
                      </Link>
                    </div>
                  </div>

                  <Link className="mega-foot" to="/learning">
                    Visit the Learning centre <IconArrowRight width="14" height="14" />
                  </Link>
                </div>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  Contact
                </NavLink>
              </li>
            </ul>

            {/* Mobile-only navigation: root list + sliding sub-menus */}
            <div className="nav-mobile">
              {!sub ? (
                <nav className="nav-mobile-root" aria-label="Menu">
                  <Link className="nav-mobile-item" to="/">Home</Link>
                  <button type="button" className="nav-mobile-item" onClick={() => setSub('products')}>
                    <span>Products</span>
                    <IconChevronRight width="18" height="18" />
                  </button>
                  <button type="button" className="nav-mobile-item" onClick={() => setSub('industries')}>
                    <span>Industries</span>
                    <IconChevronRight width="18" height="18" />
                  </button>
                  <Link className="nav-mobile-item" to="/about">About Us</Link>
                  <button type="button" className="nav-mobile-item" onClick={() => setSub('learning')}>
                    <span>Learning</span>
                    <IconChevronRight width="18" height="18" />
                  </button>
                  <Link className="nav-mobile-item" to="/contact">Contact</Link>
                  <Link className="nav-mobile-item nav-mobile-item--cta" to="/contact">Request a quote</Link>
                </nav>
              ) : (
                <nav className="nav-mobile-sub" aria-label="Sub menu">
                  {sub === 'products' && (
                    <>
                      <Link className="nav-mobile-item" to="/products">All products</Link>
                      {categories.map((c) => (
                        <Link className="nav-mobile-item" to={`/products?cat=${c.id}`} key={c.id}>{c.label}</Link>
                      ))}
                    </>
                  )}
                  {sub === 'industries' && industryCatalog.map((i) => (
                    <Link className="nav-mobile-item" to={`/products?industry=${i.slug}`} key={i.slug}>{i.label}</Link>
                  ))}
                  {sub === 'learning' && (
                    <>
                      <Link className="nav-mobile-item" to="/learning">Learning centre</Link>
                      <Link className="nav-mobile-item" to="/learning#guides">Guides</Link>
                      <Link className="nav-mobile-item" to="/learning#standards">Standards &amp; tests</Link>
                      <Link className="nav-mobile-item" to="/learning#faq">FAQs</Link>
                    </>
                  )}
                </nav>
              )}
            </div>
          </div>

          <div className="nav-cta desktop-cta">
            <button type="button" className="nav-search" onClick={() => setSearchOpen(true)} aria-label="Search">
              <IconSearch width="18" height="18" />
            </button>
            <button type="button" className="nav-bag" onClick={openBag} aria-label="Open your bag">
              <IconBag width="20" height="20" />
              {count > 0 && <span className="nav-bag__badge">{count}</span>}
            </button>
            <Link className="btn btn--gold" to="/contact" style={{ padding: '11px 22px' }}>
              Request a quote
            </Link>
          </div>

          <button type="button" className="nav-search mobile-search" onClick={() => setSearchOpen(true)} aria-label="Search">
            <IconSearch width="18" height="18" />
          </button>

          <button type="button" className="nav-bag mobile-bag" onClick={openBag} aria-label="Open your bag">
            <IconBag width="20" height="20" />
            {count > 0 && <span className="nav-bag__badge">{count}</span>}
          </button>

          <Link className="btn btn--gold mobile-cta" to="/contact">Request a quote</Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`nav-scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
