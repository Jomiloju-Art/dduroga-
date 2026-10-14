import { Component } from 'react';

/**
 * Catches render errors and, importantly, failed lazy-chunk loads.
 *
 * Route-level code splitting introduced a failure mode that did not exist while
 * every page was statically imported: if a chunk 404s, the dynamic import
 * rejects and React unmounts the whole tree, leaving a blank page with no
 * explanation. That is not a rare edge case — it is the normal consequence of
 * deploying while someone has the site open, because the old hashed chunk
 * filename stops existing the moment a new build ships.
 *
 * Verified before this existed: blocking one chunk left `#root` with zero
 * children and the header and footer gone.
 *
 * A class component because React has no hook equivalent; `getDerivedStateFromError`
 * is the only supported way to turn a thrown error into rendered UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  /**
   * Clear the error when the route changes.
   *
   * Without this, a chunk failure is permanent: the boundary keeps rendering the
   * error UI instead of its children, so clicking any other nav link changes the
   * URL but the panel stays and the site looks dead. Verified before this
   * existed — the URL moved to /learning while the error panel remained.
   *
   * Done here rather than by keying the boundary on the path, because a key
   * remount would also remount the page subtree on every navigation. This only
   * resets when there is actually an error to clear.
   */
  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, info) {
    // Surfaced in the console so the real error survives for debugging, since
    // the UI deliberately shows the visitor something human instead.
    console.error('[DDUROGA] render/chunk error:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const message = String(error?.message || error || '');
    // A missing chunk is fixed by a reload: the fresh document points at the new
    // hashes. Anything else might be transient, so the same button is offered.
    const isChunk = /dynamically imported module|Loading chunk|Importing a module/i.test(message);

    return (
      <section className="oops" role="alert">
        <div className="oops__inner">
          <span className="eyebrow">Something went wrong</span>
          <h1>{isChunk ? 'This page needs a refresh' : 'We couldn\u2019t load this page'}</h1>
          <p>
            {isChunk
              ? 'The site was updated while you had it open, so this part is out of date. Reloading will pick up the current version — nothing in your quote list is affected.'
              : 'This is usually a dropped connection. Trying again normally works.'}
          </p>
          <div className="oops__actions">
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
              Reload the page
            </button>
            {/* A plain link with a full page load: this boundary sits outside
                the router (main.jsx), so a router <Link> here crashed the
                fallback itself and left a blank page. */}
            <a href="/" className="btn btn--outline-dark">Back to home</a>
          </div>
          {/* The raw message is useful to a developer and meaningless to a buyer,
              so it stays collapsed rather than in the main copy. */}
          <details className="oops__tech">
            <summary>Technical detail</summary>
            <code>{message}</code>
          </details>
        </div>
      </section>
    );
  }
}
