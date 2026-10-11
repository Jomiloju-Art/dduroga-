import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import SearchModal from './SearchModal.jsx';
import { categories, industryCatalog, hazardNames } from '../data/products.js';
import { IconArrowRight, IconSearch } from './Icons.jsx';
import { useQuote } from '../quote/QuoteContext.jsx';

/** Entries shown per column in the Products mega panel before the "All …" link. */
const MEGA_ITEMS = 6;

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
    setTransparentRoute(pathname === '/');
  }, [pathname]);

  /* The scroll behaviour, copied from Gymshark:

       down  -> the header slides up out of view
       up    -> it comes back, white
       top   -> transparent again over the hero

     They drive it on scroll DIRECTION, not position: at 2000px down it is
     hidden, and scrolling up 20px brings it back while still deep in the page.
     So the check is against the previous position, and a small dead zone stops
     a jittery trackpad flickering it in and out. */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const prev = lastY.current;
      const delta = y - prev;

      setScrolled(y > 8);
      if (y <= 8) {
        setHidden(false);
      } else if (Math.abs(delta) > 4) {
        setHidden(delta > 0);        // moving down hides, moving up reveals
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
        hidden && !open ? 'site-header--hidden' : '',
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
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile: sub-menu header (back + title) */}
            {sub && (
              <div className="nav-mobile-head">
                <button type="button" className="nav-mobile-back" onClick={() => setSub(null)} aria-label="Back">
                  <i className="fas fa-chevron-left" aria-hidden="true" />
                </button>
                <span className="nav-mobile-head__title">
                  {sub === 'products' ? 'Products' : sub === 'industries' ? 'Industries' : 'Hazards'}
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

                    {/* Industry and hazard are capped at six. This panel is a
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
                      <Link className="mega-col__all" to="/products">
                        All {industryCatalog.length} industries
                      </Link>
                    </div>

                    <div className="mega-col">
                      <h4>By hazard</h4>
                      <ul>
                        {Object.entries(hazardNames)
                          .slice(0, MEGA_ITEMS)
                          .map(([id, label]) => (
                            <li key={id}>
                              <Link to={`/products?hazard=${id}`}>{label}</Link>
                            </li>
                          ))}
                      </ul>
                      <Link className="mega-col__all" to="/products">
                        All {Object.keys(hazardNames).length} hazards
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
              <li>
                <NavLink to="/learning" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  Learning
                </NavLink>
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
                    <i className="fas fa-chevron-right" aria-hidden="true" />
                  </button>
                  <button type="button" className="nav-mobile-item" onClick={() => setSub('industries')}>
                    <span>Industries</span>
                    <i className="fas fa-chevron-right" aria-hidden="true" />
                  </button>
                  <button type="button" className="nav-mobile-item" onClick={() => setSub('hazards')}>
                    <span>Hazards</span>
                    <i className="fas fa-chevron-right" aria-hidden="true" />
                  </button>
                  <Link className="nav-mobile-item" to="/about">About Us</Link>
                  <Link className="nav-mobile-item" to="/learning">Learning</Link>
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
                  {sub === 'hazards' && Object.entries(hazardNames).map(([id, label]) => (
                    <Link className="nav-mobile-item" to={`/products?hazard=${id}`} key={id}>{label}</Link>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="nav-cta desktop-cta">
            <button type="button" className="nav-search" onClick={() => setSearchOpen(true)} aria-label="Search">
              <IconSearch width="18" height="18" />
            </button>
            <button type="button" className="nav-bag" onClick={openBag} aria-label="Open your bag">
              <i className="fas fa-shopping-bag" aria-hidden="true" />
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
            <i className="fas fa-shopping-bag" aria-hidden="true" />
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
