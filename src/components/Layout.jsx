import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Loader from './Loader.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import Navbar from './Navbar.jsx';
import TopBar from './TopBar.jsx';
import Footer from './Footer.jsx';
import BagDrawer from './BagDrawer.jsx';
import PrivacyNotice from './PrivacyNotice.jsx';
import { brand } from '../data/brand.js';

/** Shared page frame: sticky nav + routed content + footer + bag drawer + WhatsApp. */
export default function Layout() {
  // Drives the error boundary reset so a failed route does not stay failed.
  const location = useLocation();
  const wa = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hi ${brand.name}, I'd like to ask about your PPE range.`)}`;

  return (
    <>
      <TopBar />
      <Navbar />
      <main id="main">
        {/* Boundary sits here, not around <Routes>, so a loading or failed page
            chunk leaves the header, footer and floating actions in place. The
            error boundary wraps the Suspense so a chunk that 404s (a deploy
            while the tab was open) shows a recoverable message inside the page
            frame instead of unmounting the entire app. */}
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<Loader label="Loading page" />}>
            {/* Keyed by path so each new page plays the entrance in the
                stylesheet (.route-enter). Opacity and translate only, with no
                fill once it ends, so it never leaves a transform behind that
                would trap the page's fixed bars. */}
            <div className="route-enter" key={location.pathname}>
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />

      {/* The quote list, presented as Gymshark's "Your bag" slide-in drawer. */}
      <BagDrawer />

      {/* First-visit note that no tracking cookies are used (option A, Oct 2026). */}
      <PrivacyNotice />

      {/* WhatsApp, by client request. NOTE: `brand.whatsapp` is still the stub
          `919000000000`, so this opens a chat with a number that does not exist
          until a real one is set in src/data/brand.js. */}
      <a href={wa} target="_blank" rel="noreferrer" className="whatsapp-btn" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.2L2 22l5-1.4A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4 14.9l-.3-.2-2.5.7.7-2.5-.2-.3A8 8 0 0 1 12 4zm-3 4c-.3 0-.6.1-.9.4-.3.3-.5.7-.5 1.1 0 1 .5 2.4 1.8 3.7 1.4 1.3 2.9 1.9 3.9 2 .4 0 .8-.1 1.1-.4.3-.3.4-.6.4-1 0-.3-.2-.5-.4-.7l-1-.5-.9.4a6.6 6.6 0 0 1-1.9-1.9l.4-.9-.5-1c-.2-.3-.4-.5-.7-.5H9z" />
        </svg>
      </a>
    </>
  );
}
