import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaCalendarAlt, FaLock, FaParking, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(253,224,71,0.18),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(45,212,191,0.16),_transparent_24%),linear-gradient(180deg,_#fcfdfd_0%,_#eef7f7_44%,_#f7fbff_100%)] px-4 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-100/55 to-transparent" />
      <div className="absolute left-[7%] top-[10%] h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute bottom-[8%] right-[10%] h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="hidden flex-col justify-between rounded-[40px] border border-sky-100 bg-white/78 p-10 text-slate-900 shadow-[0_30px_80px_rgba(148,163,184,0.18)] backdrop-blur-2xl lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-sky-100 bg-white/85 px-4 py-2 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-teal-400 text-white">
                <FaParking />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-teal-700">ParkNGo</p>
                <p className="text-sm text-slate-500">Admin Suite</p>
              </div>
            </div>

            <h1 className="mt-8 max-w-lg text-5xl font-black tracking-tight text-slate-900">
              Welcome back to the operations command center.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Sign in to manage bookings, monitor slot availability, review payments, and keep every service
              location aligned from one polished workspace.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.8rem] border border-sky-100 bg-white/82 p-5 shadow-[0_16px_34px_rgba(148,163,184,0.12)]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <FaShieldAlt />
                </span>
                <div>
                  <p className="text-lg font-bold text-slate-900">Trusted admin access</p>
                  <p className="text-sm text-slate-500">Secure entry into reporting, inventory, and operational controls.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.8rem] border border-sky-100 bg-white/82 p-5 shadow-[0_16px_34px_rgba(148,163,184,0.12)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <FaCalendarAlt />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Booking flow</p>
                    <p className="text-sm text-slate-500">Track reservations and daily movement at a glance.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.8rem] border border-sky-100 bg-white/82 p-5 shadow-[0_16px_34px_rgba(148,163,184,0.12)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                    <FaUsers />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-slate-900">People and places</p>
                    <p className="text-sm text-slate-500">Manage users, vehicles, and service locations cleanly.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-teal-50 p-5 shadow-[0_16px_34px_rgba(148,163,184,0.10)]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                  <FaLock />
                </span>
                <div>
                  <p className="text-lg font-bold text-slate-900">Consistent admin theme</p>
                  <p className="text-sm text-slate-500">The login experience now matches the suite you enter after authentication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-xl rounded-[36px] border-sky-100 bg-white/90 shadow-[0_28px_72px_rgba(148,163,184,0.16)]">
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-900/20">
                <FaParking className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
                Sign in to Admin Panel
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your credentials to continue to the ParkNGo Admin Suite.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-2 block w-full rounded-2xl border border-sky-100 bg-slate-50/90 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="mt-2 block w-full rounded-2xl border border-sky-100 bg-slate-50/90 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full">
                Sign in
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
