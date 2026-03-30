import React, { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Loader2,
  Mail,
  MapPinned,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MODE_COPY = {
  login: {
    title: 'Login',
    subtitle: 'Welcome back!',
    helper: 'If you already have an account, choose phone or email and continue with OTP.',
    cta: 'Send OTP',
    switchText: "Don't have an account?",
    switchAction: 'Signup',
  },
  signup: {
    title: 'Signup',
    subtitle: 'Create your account',
    helper: 'New users can register with name, phone number, and email before OTP verification.',
    cta: 'Create Account',
    switchText: 'Already have an account?',
    switchAction: 'Login',
  },
};

const CHANNELS = [
  { key: 'phone', label: 'Phone', icon: Smartphone },
  { key: 'email', label: 'Email', icon: Mail },
];

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [channel, setChannel] = useState('phone');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loginForm, setLoginForm] = useState({
    phone: '',
    email: '',
    otp: '',
  });
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    otp: '',
  });

  const copy = useMemo(() => MODE_COPY[mode], [mode]);

  if (!loading && isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setOtpSent(false);
    setOtpVerified(false);
    setError('');
    setInfo('');
    setSearchParams(nextMode === 'signup' ? { mode: 'signup' } : {});
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupForm((current) => ({ ...current, [name]: value }));
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    const activeForm = mode === 'login' ? loginForm : signupForm;
    const channelValue = channel === 'phone' ? activeForm.phone : activeForm.email;

    if (mode === 'signup' && (!signupForm.name || !signupForm.phone || !signupForm.email)) {
      setError('Please enter name, phone number, and email first.');
      return;
    }

    if (!channelValue) {
      setError(channel === 'phone' ? 'Please enter your phone number.' : 'Please enter your email.');
      return;
    }

    setSendingOtp(true);

    window.setTimeout(() => {
      setSendingOtp(false);
      setOtpSent(true);
      setOtpVerified(false);
      setInfo(
        `Demo OTP sent via ${channel === 'phone' ? 'phone' : 'email'}. We will connect Twilio/Firebase next. Use 123456 to preview the verification state.`,
      );
    }, 900);
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    const otpValue = mode === 'login' ? loginForm.otp : signupForm.otp;

    if (!otpSent) {
      setError('Send OTP first.');
      return;
    }

    if (!otpValue) {
      setError('Please enter the OTP.');
      return;
    }

    setVerifyingOtp(true);

    window.setTimeout(() => {
      setVerifyingOtp(false);

      if (otpValue !== '123456') {
        setOtpVerified(false);
        setError('Invalid OTP. For now, use demo OTP 123456.');
        return;
      }

      setOtpVerified(true);
      setInfo(
        mode === 'login'
          ? 'UI login flow verified. Next we will connect real OTP and session creation.'
          : 'UI signup flow verified. Next we will connect real OTP and account creation.',
      );
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(91,104,255,0.22),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(0,169,255,0.18),_transparent_22%),linear-gradient(180deg,#111c43_0%,#1a2550_100%)] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute left-[10%] top-[14%] h-56 w-56 rounded-full bg-[#6078ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[8%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden rounded-[38px] border border-white/10 bg-white/5 p-10 shadow-[0_30px_80px_rgba(4,10,32,0.28)] backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">ParkNGo</p>
                <p className="text-sm text-white/68">OTP-ready user access</p>
              </div>
            </div>

            <h1 className="mt-8 text-5xl font-black tracking-tight">
              One polished auth flow for new and returning users.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/72">
              This screen is now designed for real OTP login and signup. Once you send the Twilio and
              Firebase details, we will connect the exact production flow behind this UI.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/14 text-cyan-200">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold">SMS / Email OTP</p>
                  <p className="text-sm text-white/62">Ready for Twilio and Firebase-based verification.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/14 text-violet-200">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold">New user signup</p>
                  <p className="text-sm text-white/62">Collects name, phone number, and email before verification.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-gradient-to-r from-white/8 to-white/4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/14 text-emerald-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold">Current mode</p>
                  <p className="text-sm text-white/62">
                    Demo OTP is active for UI preview. Real provider integration comes next.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl rounded-[36px] border border-white/10 bg-[rgba(40,55,97,0.78)] p-6 shadow-[0_28px_72px_rgba(4,10,32,0.34)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight">{copy.title}</h2>
              <p className="mt-2 text-lg text-white/72">{copy.subtitle}</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-[24px] bg-white/6 p-2">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchMode(item)}
                className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                  mode === item
                    ? 'bg-[linear-gradient(90deg,#4e5bda_0%,#296fa4_100%)] text-white shadow-[0_16px_34px_rgba(35,64,148,0.3)]'
                    : 'text-white/62 hover:text-white'
                }`}
              >
                {MODE_COPY[item].label}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm leading-7 text-white/64">{copy.helper}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-[24px] bg-[#1f2a4a]/72 p-2">
            {CHANNELS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setChannel(item.key);
                    setError('');
                    setInfo('');
                    setOtpSent(false);
                    setOtpVerified(false);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-[18px] px-4 py-4 text-lg font-semibold transition ${
                    channel === item.key
                      ? 'bg-[linear-gradient(90deg,#4753c2_0%,#365e99_100%)] text-white shadow-[0_14px_28px_rgba(34,52,120,0.28)]'
                      : 'text-white/70 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="mt-5 rounded-[22px] border border-red-400/35 bg-[rgba(116,31,49,0.34)] px-5 py-4 text-base font-medium text-red-100">
              {error}
            </div>
          ) : null}

          {info ? (
            <div className="mt-5 rounded-[22px] border border-cyan-400/25 bg-[rgba(28,56,80,0.42)] px-5 py-4 text-sm leading-7 text-cyan-100">
              {info}
            </div>
          ) : null}

          {mode === 'signup' ? (
            <form className="mt-5 space-y-5" onSubmit={handleSendOtp}>
              <input
                type="text"
                name="name"
                value={signupForm.name}
                onChange={handleSignupChange}
                placeholder="Full name"
                className="w-full rounded-[22px] border border-white/10 bg-[#22304e] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/42 focus:border-cyan-300/50"
              />
              <input
                type="tel"
                name="phone"
                value={signupForm.phone}
                onChange={handleSignupChange}
                placeholder="Phone number"
                className="w-full rounded-[22px] border border-white/10 bg-[#22304e] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/42 focus:border-cyan-300/50"
              />
              <input
                type="email"
                name="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                placeholder="Email address"
                className="w-full rounded-[22px] border border-white/10 bg-[#22304e] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/42 focus:border-cyan-300/50"
              />

              <button
                type="submit"
                disabled={sendingOtp}
                className="inline-flex w-full items-center justify-center rounded-[22px] bg-[linear-gradient(90deg,#5561d8_0%,#1d79b6_100%)] px-6 py-4 text-2xl font-bold text-white shadow-[0_18px_40px_rgba(34,52,120,0.34)] transition hover:brightness-105 disabled:opacity-75"
              >
                {sendingOtp ? <Loader2 className="h-6 w-6 animate-spin" /> : copy.cta}
              </button>
            </form>
          ) : (
            <form className="mt-5 space-y-5" onSubmit={handleSendOtp}>
              <input
                type={channel === 'phone' ? 'tel' : 'email'}
                name={channel}
                value={loginForm[channel]}
                onChange={handleLoginChange}
                placeholder={channel === 'phone' ? 'Phone number' : 'Email address'}
                className="w-full rounded-[22px] border border-white/10 bg-[#22304e] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/42 focus:border-cyan-300/50"
              />

              <button
                type="submit"
                disabled={sendingOtp}
                className="inline-flex w-full items-center justify-center rounded-[22px] bg-[linear-gradient(90deg,#5561d8_0%,#1d79b6_100%)] px-6 py-4 text-2xl font-bold text-white shadow-[0_18px_40px_rgba(34,52,120,0.34)] transition hover:brightness-105 disabled:opacity-75"
              >
                {sendingOtp ? <Loader2 className="h-6 w-6 animate-spin" /> : copy.cta}
              </button>
            </form>
          )}

          {otpSent ? (
            <form className="mt-5 space-y-5" onSubmit={handleVerifyOtp}>
              <input
                type="text"
                maxLength={6}
                name="otp"
                value={mode === 'login' ? loginForm.otp : signupForm.otp}
                onChange={mode === 'login' ? handleLoginChange : handleSignupChange}
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-[22px] border border-white/10 bg-[#22304e] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/42 focus:border-cyan-300/50"
              />

              <button
                type="submit"
                disabled={verifyingOtp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-emerald-300/26 bg-emerald-500/14 px-6 py-4 text-lg font-semibold text-emerald-100 transition hover:bg-emerald-500/18 disabled:opacity-75"
              >
                {verifyingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : <BadgeCheck className="h-5 w-5" />}
                {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : null}

          <p className="mt-6 text-center text-base text-white/72">
            {copy.switchText}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="font-semibold text-cyan-200"
            >
              {copy.switchAction}
            </button>
          </p>

          <div className="my-6 flex items-center gap-4 text-white/40">
            <div className="h-px flex-1 bg-white/14" />
            <span className="text-xl font-medium">Or</span>
            <div className="h-px flex-1 bg-white/14" />
          </div>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/8 px-6 py-4 text-xl font-semibold text-white/88 transition hover:bg-white/10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900">G</span>
            Login with Google
          </button>

          <p className="mt-5 text-sm leading-7 text-white/56">
            For now, OTP is demo-only in the UI. Once you send the Twilio and Firebase details, I’ll
            connect real SMS and email/Google verification on top of this design.
          </p>

          {otpVerified ? (
            <div className="mt-5 rounded-[22px] border border-emerald-300/26 bg-emerald-500/12 px-5 py-4 text-sm leading-7 text-emerald-100">
              OTP UI flow is verified successfully. The next step is integrating Twilio/Firebase so this
              screen can create real sessions and accounts.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Login;
