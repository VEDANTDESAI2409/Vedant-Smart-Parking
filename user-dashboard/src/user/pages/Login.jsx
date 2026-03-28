import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, MapPinned } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/search';

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await login(form.email, form.password);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fcf9_0%,#edf7f2_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(17,31,26,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-[linear-gradient(160deg,#091413_0%,#17342d_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(176,228,204,0.18)]">
                <MapPinned className="h-7 w-7 text-[var(--color-accent)]" />
              </div>
              <p className="mt-8 text-sm uppercase tracking-[0.28em] text-white/55">User access</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Welcome back to ParkNGo</h1>
              <p className="mt-4 max-w-md text-base leading-8 text-white/72">
                Log in to manage bookings, track sessions, and access your parking history from one place.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/65">New here?</p>
              <p className="mt-2 text-2xl font-semibold">Create an account and start parking faster.</p>
              <Link
                to="/signup"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--color-secondary)]"
              >
                Create account
              </Link>
            </div>
          </div>

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
                <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Login</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-secondary)]">
                  Sign in to your account
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Use your user email and password to continue.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                  <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[rgba(64,138,113,0.16)] bg-white px-4 py-3.5 text-slate-800 shadow-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(64,138,113,0.12)]"
                    placeholder="Enter your password"
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
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  {submitting ? 'Signing in...' : 'Login'}
                </button>
              </form>

              <p className="mt-6 text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="font-semibold text-[var(--color-primary)]">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
