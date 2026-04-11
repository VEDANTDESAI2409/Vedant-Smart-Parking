import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaParking } from 'react-icons/fa';
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
    <div className="full-page-view relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(253,224,71,0.16),_transparent_22%),linear-gradient(180deg,_#fcfdfd_0%,_#eef7f7_44%,_#f7fbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-100/55 to-transparent" />
      <div className="pointer-events-none absolute left-[7%] top-[10%] h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[10%] h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="page-container relative flex w-full justify-center">
        <Card className="w-full max-w-xl rounded-[30px] border-sky-100 bg-white/88 p-4 text-slate-900 shadow-[0_28px_72px_rgba(148,163,184,0.16)] backdrop-blur-2xl sm:p-5 lg:p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-600">Control Center</p>
                <h2 className="mt-2 text-[1.8rem] font-black tracking-tight text-slate-900 sm:text-[2.1rem]">Admin Login</h2>
                <p className="mt-1.5 text-sm text-slate-600 sm:text-base">Welcome back to the dashboard.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-500 to-teal-400 text-white shadow-[0_16px_36px_rgba(40,90,72,0.24)]">
                <FaParking className="h-5 w-5" />
              </div>
            </div>

            <div className="h-3 rounded-full bg-sky-100">
              <div className="h-full w-[58%] rounded-full bg-[linear-gradient(90deg,#0ea5e9_0%,#14b8a6_100%)]" />
            </div>

            <p className="text-sm leading-5 text-slate-600">
              Use your admin credentials to continue into the ParkNGo dashboard.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
                  className="mt-2 block w-full rounded-[18px] border border-sky-100 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
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
                  className="mt-2 block w-full rounded-[18px] border border-sky-100 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full rounded-[18px] border-0 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 px-5 py-2.5 text-base font-bold text-white shadow-[0_14px_28px_rgba(14,165,233,0.18)] hover:brightness-105">
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
