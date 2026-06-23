import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'Admin123456' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from || '/', { replace: true });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <div className="section-header">
        <div>
          <h1>Login</h1>
          <p>Use the seeded admin account or your own registered editor account.</p>
        </div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="muted">
        Need an account? <Link to="/register">Create one here</Link>.
      </p>
    </section>
  );
}
