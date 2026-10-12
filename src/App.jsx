import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import { QuoteProvider } from './quote/QuoteContext.jsx';

/*
 * Route-level code splitting.
 *
 * Every page used to be a static import, so all nine shipped in the initial
 * bundle — one of the reasons a cold visit sat on a blank screen. Home stays
 * eager because it is the landing route and lazily loading it would just add a
 * round-trip to the first page most visitors see. Everything else becomes its
 * own chunk, fetched on navigation.
 *
 * The Suspense boundary lives inside Layout (around <Outlet />), not here, so
 * the header, footer and floating actions stay on screen while a page chunk
 * loads instead of the whole shell being replaced by a spinner.
 */
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const QuotePage = lazy(() => import('./pages/QuotePage.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));
const LearningPage = lazy(() => import('./pages/LearningPage.jsx'));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage.jsx'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

export default function App() {
  return (
    <QuoteProvider>
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="learning" element={<LearningPage />} />
            <Route path="learning/:slug" element={<GuideDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="quote" element={<QuotePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="certifications" element={<CertificationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ScrollToTop>
    </QuoteProvider>
  );
}
