import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">MERN Starter New Web</p>
          <Link to="/" className="brand-link">
            Editorial Content Console
          </Link>
          <p className="subtitle">
            Manage posts, statuses, categories, tags and publishing flow from a single modern dashboard.
          </p>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          {isAuthenticated ? <NavLink to="/posts/new">Create Post</NavLink> : null}
          {isAuthenticated ? <NavLink to="/manage/taxonomy">Manage Taxonomy</NavLink> : null}
          {!isAuthenticated ? <NavLink to="/login">Login</NavLink> : null}
          {!isAuthenticated ? <NavLink to="/register">Register</NavLink> : null}
        </nav>
        <div className="auth-summary">
          {isAuthenticated ? (
            <>
              <span className="muted-light">
                Signed in as <strong>{user?.name}</strong>
              </span>
              <button className="button ghost-light" onClick={logout} type="button">
                Logout
              </button>
            </>
          ) : (
            <span className="muted-light">Browse public content or sign in to manage posts.</span>
          )}
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}
