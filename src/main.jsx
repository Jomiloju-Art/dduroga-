import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { registerServiceWorker } from './lib/serviceWorker.js';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

/**
 * Dismiss the boot loader in index.html.
 *
 * The loader lives OUTSIDE #root and is a plain DOM node, so it is removed
 * explicitly here rather than relying on React to clear the container it was
 * handed — that behaviour is not something to bet a permanently-covering
 * overlay on. It fades before removal so the first paint of the app is not a
 * hard cut from a centred mark to a full page.
 */
const boot = document.getElementById('boot');
if (boot) {
  boot.classList.add('is-done');
  window.setTimeout(() => boot.remove(), 320);
}

/**
 * Input-method tracking, copied from Gymshark.
 *
 * Their rules are gated on a class on <body>:
 *
 *   body:not(.user-is-tabbing) button:focus { outline: none }
 *
 * The class is added the moment the Tab key is pressed and removed again on any
 * pointer press. The effect: a focus ring appears when someone is navigating by
 * keyboard — where it is essential — and never after a mouse click, where it
 * just sits on whatever was last clicked until something else is clicked.
 *
 * Two listeners, capture phase on keydown so it is seen before anything that
 * might stop propagation:
 *
 *   Tab       -> mark the session as keyboard navigation
 *   pointerdown -> it is a mouse session again
 *
 * `pointerdown` rather than `mousedown` so touch and pen behave the same. A
 * first pointer press on a device that has never seen a Tab key is a no-op:
 * the class was never added, so there is nothing to remove.
 */
(() => {
  const add = () => document.body.classList.add('user-is-tabbing');
  const remove = () => document.body.classList.remove('user-is-tabbing');

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Tab') add();
    },
    true
  );
  window.addEventListener('pointerdown', remove, true);
})();

/**
 * Offline support. Registered after `load`, production only — see the module for
 * why dev is excluded and why the controllerchange reload is guarded.
 */
registerServiceWorker();

/**
 * Reveal fail-open flag.
 *
 * The scroll-reveal animation hides `.reveal` and `.reveal-stagger > *` at
 * opacity 0 and depends on an IntersectionObserver to bring them back. That
 * makes the animation load-bearing: no observer, no visible content — an empty
 * band in the middle of the homepage with nothing in the console.
 *
 * This sets a marker the stylesheet keys off (see the FAIL-OPEN block in
 * index.css). When the observer exists, the animated hide/reveal path applies as
 * designed. When it does not, the stylesheet never hides anything and every
 * section renders immediately, unanimated.
 *
 * Set here rather than in the Reveal component so the attribute is present
 * before first paint: a per-component effect would run after the elements had
 * already been laid out, which is the flash the hidden state exists to avoid.
 */
if ('IntersectionObserver' in window) {
  document.documentElement.dataset.reveal = 'on';
}
