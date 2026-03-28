import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, MapPinned, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loading && isAuthenticated) {
    return <Navigate to="/search" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate('/search', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fcf9_0%,#edf7f2_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(17,31,26,0.12)] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="mx-auto max-w-md">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-[var(--color-secondary)]">ParkNGo</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Smart Parking</p>
                </div>
              </Link>

              <div className="mt-10">
                <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Signup</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-secondary)]">
                  Create your user account
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Start with your basic details and get instant access to booking and session tracking.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[rgba(64,138,113,0.16)] bg-white px-4 py-3.5 text-slate-800 shadow-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(64,138,113,0.12)]"
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[rgba(64,138,113,0.16)] bg-white px-4 py-3.5 text-slate-800 shadow-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(64,138,113,0.12)]"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[rgba(64,138,113,0.16)] bg-white px-4 py-3.5 text-slate-800 shadow-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(64,138,113,0.12)]"
                    placeholder="+91 98765 43210"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-[rgba(64,138,113,0.16)] bg-white px-4 py-3.5 text-slate-800 shadow-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(64,138,113,0.12)]"
                    placeholder="At least 6 characters"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-[rgba(64,138,113,0.16)] bg-white px-4 py-3.5 text-slate-800 shadow-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(64,138,113,0.12)]"
                    placeholder="Repeat your password"
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(40,90,72,0.24)] transition hover:bg-[#1f4739] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {submitting ? 'Creating account...' : 'Sign up'}
                </button>
              </form>

              <p className="mt-6 text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[var(--color-primary)]">
                  Login
                </Link>
              </p>
            </div>
          </div>

          <div className="hidden bg-[linear-gradient(160deg,#f3fbf7_0%,#e2f4eb_100%)] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">New user</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--color-secondary)]">
                Join a faster parking experience
              </h1>
              <p className="mt-4 max-w-md text-base leading-8 text-slate-600">
                Register once, save your details, and move from slot discovery to active session in a much cleaner flow.
              </p>
            </div>
            <div className="rounded-[28px] border border-[rgba(64,138,113,0.12)] bg-white/85 p-6 shadow-[0_18px_40px_rgba(17,31,26,0.06)]">
              <p className="text-sm font-medium text-slate-500">What you get</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <li>Live slot search and session tracking</li>
                <li>Cashless payments and digital receipts</li>
                <li>Quick access to booking history and profile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
