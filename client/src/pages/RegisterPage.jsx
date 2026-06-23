import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await register(form);
      navigate('/', { replace: true });
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
          <h1>Create Account</h1>
          <p>Register a new editor account to manage content, taxonomy and uploads.</p>
        </div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
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
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Go to login</Link>.
      </p>
    </section>
  );
}
