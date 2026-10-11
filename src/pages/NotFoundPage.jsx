import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="notfound">
      <div className="container">
        <div className="notfound-code">404</div>
        <h2 className="section-title">This page walked off the job</h2>
        <p className="muted" style={{ margin: '0 auto 26px' }}>
          The page you are looking for does not exist or has moved.
        </p>
        <Link to="/" className="btn btn--primary">Back to home</Link>
      </div>
    </section>
  );
}
