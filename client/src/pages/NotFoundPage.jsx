import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="card empty-state">
      <h1>Page not found</h1>
      <p>The page you requested does not exist in this application.</p>
      <Link className="button primary" to="/">
        Return to dashboard
      </Link>
    </section>
  );
}
