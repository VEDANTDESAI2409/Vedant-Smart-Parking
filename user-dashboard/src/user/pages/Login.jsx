import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Loader2, Mail, Smartphone } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { firebaseAuth, googleProvider, hasFirebaseConfig } from '../../config/firebase';

const MODE_COPY = {
  login: {
    label: 'Login',
    title: 'Login',
    subtitle: 'Welcome back!',
    helper: 'If you already have an account, choose phone or email and continue with OTP.',
    cta: 'Send OTP',
    switchText: "Don't have an account?",
    switchAction: 'Signup',
  },
  signup: {
    label: 'Signup',
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
  const {
    isAuthenticated,
    loading,
    sendOtp,
    signup,
    login,
    verifyLogin,
    loginWithGoogle,
    getPendingBooking,
  } = useAuth();
  const navigate = useNavigate();
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
  const redirectPath = getPendingBooking() ? '/search?resumeBooking=1' : '/profile';

  useEffect(() => {
    const nextMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    setMode(nextMode);
  }, [searchParams]);

  const handleGoogleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    try {
      if (!hasFirebaseConfig || !firebaseAuth) {
        throw new Error('Firebase Google login is not available');
      }

      setInfo('Signing in with Google...');
      const popupResult = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await popupResult.user.getIdToken();
      const googleName = popupResult.user.displayName || '';
      const googleEmail = popupResult.user.email || '';

      setInfo('Authenticating with server...');
      const session = await loginWithGoogle({ idToken });

      if (!session?.token || !session?.user) {
        throw new Error('Invalid session response');
      }

      // For signup mode, populate form fields and show data fetched message
      if (mode === 'signup') {
        setSignupForm((current) => ({
          ...current,
          name: session.user.name || googleName || '',
          email: session.user.email || googleEmail || '',
        }));
        setInfo(
          'Account created successfully! Your details have been auto-filled. You are now logged in.'
        );
        // Auto-redirect after a brief moment
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1500);
      } else {
        // For login mode, just redirect
        setInfo('Login successful! Redirecting...');
        setLoginForm((current) => ({
          ...current,
          email: session.user.email || googleEmail || '',
        }));
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      }
    } catch (googleError) {
      console.error('Google login error:', googleError);
      setError(
        googleError.response?.data?.message ||
          googleError.message ||
          'Google authentication failed. Please try again.'
      );
      setInfo('');
    }
  };

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
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

    if (channel !== 'phone') {
      setError('Phone OTP is supported in this flow. Please use phone.');
      return;
    }

    const activeForm = mode === 'login' ? loginForm : signupForm;
    const phone = activeForm.phone;

    if (mode === 'signup' && (!signupForm.name || !signupForm.phone || !signupForm.email)) {
      setError('Please enter name, phone number, and email first.');
      return;
    }

    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    setSendingOtp(true);

    try {
      if (mode === 'login') {
        const response = await login({ phone });
        setInfo(response?.message || 'OTP sent successfully.');
      } else {
        const response = await sendOtp({ phone });
        setInfo(response?.message || 'OTP sent successfully.');
      }

      setOtpSent(true);
      setOtpVerified(false);
    } catch (apiError) {
      setOtpSent(false);
      setError(apiError.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
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

    try {
      if (mode === 'login') {
        const response = await verifyLogin({
          phone: loginForm.phone,
          otp: otpValue,
        });

        setOtpVerified(true);
        setInfo(response?.message || 'Login successful.');
        navigate(redirectPath, { replace: true });
        return;
      }

      const response = await signup({
        name: signupForm.name,
        phone: signupForm.phone,
        email: signupForm.email,
        otp: otpValue,
      });

      setOtpVerified(true);
      setInfo(response?.message || 'Signup successful.');
      navigate(redirectPath, { replace: true });
    } catch (apiError) {
      setOtpVerified(false);
      setError(apiError.response?.data?.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="full-page-view relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(253,224,71,0.16),_transparent_22%),linear-gradient(180deg,_#fcfdfd_0%,_#eef7f7_44%,_#f7fbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-100/55 to-transparent" />
      <div className="pointer-events-none absolute left-[7%] top-[10%] h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[10%] h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="page-container relative flex w-full justify-center">
        <div className="w-full max-w-xl rounded-[30px] border border-sky-100 bg-white/88 p-4 shadow-[0_28px_72px_rgba(148,163,184,0.16)] backdrop-blur-2xl sm:p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-600">User Access</p>
              <h2 className="mt-2 text-[1.8rem] font-black tracking-tight text-slate-900 sm:text-[2.1rem]">{copy.title}</h2>
              <p className="mt-1.5 text-sm text-slate-600 sm:text-base">{copy.subtitle}</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-[20px] bg-sky-50 p-1.5">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchMode(item)}
                className={`rounded-[16px] px-4 py-2.5 text-sm font-semibold transition ${
                  mode === item
                    ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 text-white shadow-[0_14px_28px_rgba(14,165,233,0.18)]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {MODE_COPY[item].label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm leading-5 text-slate-600">{copy.helper}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-[20px] bg-slate-100/90 p-1.5">
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
                  className={`flex items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-semibold transition sm:text-base ${
                    channel === item.key
                      ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 text-white shadow-[0_14px_28px_rgba(14,165,233,0.18)]'
                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          {info ? (
            <div className="mt-3 rounded-[18px] border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm leading-5 text-cyan-700">
              {info}
            </div>
          ) : null}

          {mode === 'signup' ? (
            <form className="mt-4 space-y-3" onSubmit={handleSendOtp}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  value={signupForm.name}
                  onChange={handleSignupChange}
                  placeholder="Full name"
                  className="w-full rounded-[18px] border border-sky-100 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
                />
                <input
                  type="tel"
                  name="phone"
                  value={signupForm.phone}
                  onChange={handleSignupChange}
                  placeholder="Phone number"
                  className="w-full rounded-[18px] border border-sky-100 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
                />
              </div>
              <input
                type="email"
                name="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                placeholder="Email address"
                className="w-full rounded-[18px] border border-sky-100 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
              />

              <button
                type="submit"
                disabled={sendingOtp}
                className="inline-flex w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 px-5 py-2.5 text-base font-bold text-white shadow-[0_14px_28px_rgba(14,165,233,0.18)] transition hover:brightness-105 disabled:opacity-75 sm:text-lg"
              >
                {sendingOtp ? <Loader2 className="h-6 w-6 animate-spin" /> : copy.cta}
              </button>
            </form>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={handleSendOtp}>
              <input
                type={channel === 'phone' ? 'tel' : 'email'}
                name={channel}
                value={loginForm[channel]}
                onChange={handleLoginChange}
                placeholder={channel === 'phone' ? 'Phone number' : 'Email address'}
                className="w-full rounded-[18px] border border-sky-100 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
              />

              <button
                type="submit"
                disabled={sendingOtp}
                className="inline-flex w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 px-5 py-2.5 text-base font-bold text-white shadow-[0_14px_28px_rgba(14,165,233,0.18)] transition hover:brightness-105 disabled:opacity-75 sm:text-lg"
              >
                {sendingOtp ? <Loader2 className="h-6 w-6 animate-spin" /> : copy.cta}
              </button>
            </form>
          )}

          {otpSent ? (
            <form className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleVerifyOtp}>
              <input
                type="text"
                maxLength={6}
                name="otp"
                value={mode === 'login' ? loginForm.otp : signupForm.otp}
                onChange={mode === 'login' ? handleLoginChange : handleSignupChange}
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-[18px] border border-sky-100 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 sm:text-base"
              />

              <button
                type="submit"
                disabled={verifyingOtp}
                className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-cyan-200 bg-cyan-50 px-5 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:opacity-75 sm:text-base"
              >
                {verifyingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : <BadgeCheck className="h-5 w-5" />}
                {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : null}

          <p className="mt-4 text-center text-sm text-slate-600 sm:text-base">
            {copy.switchText}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="font-semibold text-cyan-600"
            >
              {copy.switchAction}
            </button>
          </p>

          <div className="my-3 flex items-center gap-3 text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-base font-medium">Or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="inline-flex w-full items-center justify-center gap-3 rounded-[18px] border border-sky-100 bg-white px-5 py-2.5 text-base font-semibold text-slate-800 transition hover:border-cyan-500 hover:bg-cyan-50 sm:text-lg"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900">G</span>
            Login with Google
          </button>

          {otpVerified ? (
            <div className="mt-3 rounded-[18px] border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm leading-5 text-cyan-700">
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
