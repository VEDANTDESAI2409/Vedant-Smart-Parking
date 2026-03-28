import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaLock, FaParking, FaShieldAlt } from 'react-icons/fa';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_24%),linear-gradient(180deg,_#07111f_0%,_#0b1728_48%,_#10233b_100%)] px-4 py-10">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute left-[8%] top-[10%] h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="absolute bottom-[8%] right-[10%] h-44 w-44 rounded-full bg-amber-400/20 blur-3xl" />

      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="hidden flex-col justify-between rounded-[40px] border border-white/10 bg-white/6 p-10 text-white shadow-[0_30px_80px_rgba(2,12,27,0.45)] backdrop-blur-2xl lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-400/18 text-teal-100">
                <FaParking />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-teal-200/85">ParkNGo</p>
                <p className="text-sm text-slate-300">Premium admin workspace</p>
              </div>
            </div>

            <h1 className="mt-8 max-w-lg text-5xl font-black tracking-tight">
              A sharper operations experience for your parking platform.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300/85">
              Same logic. Same features. A much more polished command center for managing bookings, users,
              vehicles, payments, and service locations.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/8 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200">
                  <FaShieldAlt />
                </span>
                <div>
                  <p className="text-lg font-bold">Enterprise feel</p>
                  <p className="text-sm text-slate-300/75">Cleaner hierarchy, sharper spacing, and stronger visual rhythm.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-200">
                  <FaLock />
                </span>
                <div>
                  <p className="text-lg font-bold">Protected workflow</p>
                  <p className="text-sm text-slate-300/75">Authentication and existing functionality remain unchanged.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-xl rounded-[36px] border-white/12 bg-white/92 dark:border-slate-700 dark:bg-slate-900/92">
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-900/20">
                <FaParking className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Sign in to Admin Panel
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Smart Parking System Administration
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{errors.password.message}</p>
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
