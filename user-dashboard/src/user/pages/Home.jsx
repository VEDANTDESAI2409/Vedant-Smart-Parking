import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BatteryCharging,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CheckCircle2,
  Facebook,
  Headphones,
  Linkedin,
  MapPinned,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
  Youtube,
  Zap,
} from 'lucide-react';
import HeroParkingMap from '../components/HeroParkingMap';

const navigation = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Support', href: '#support' },
];

const processSteps = [
  {
    number: '01',
    title: 'Download',
    description: 'Get started on web or mobile with your account and vehicle details ready in seconds.',
  },
  {
    number: '02',
    title: 'Find',
    description: 'See nearby parking zones, live capacity, charger availability, and entry conditions instantly.',
  },
  {
    number: '03',
    title: 'Start Session',
    description: 'Tap once to open the gate, begin parking, and pay securely without cash or paper tickets.',
  },
  {
    number: '04',
    title: 'Track',
    description: 'Monitor remaining time, extend sessions remotely, and keep every booking in one timeline.',
  },
  {
    number: '05',
    title: 'Stop',
    description: 'End the session when you leave and receive a transparent receipt with exact usage details.',
  },
];

const features = [
  {
    title: 'Cashless Payments',
    description: 'Fast digital checkout with stored cards, wallets, and automated receipts.',
    icon: CircleDollarSign,
  },
  {
    title: 'Real-time Availability',
    description: 'Drivers see live occupancy and avoid circling crowded streets or garages.',
    icon: MapPinned,
  },
  {
    title: 'EV Charging Integration',
    description: 'Reserve bays with chargers and track charging-friendly spaces alongside parking.',
    icon: BatteryCharging,
  },
  {
    title: 'Flexible Bookings',
    description: 'Book ahead, extend remotely, or switch durations based on changing plans.',
    icon: Clock3,
  },
  {
    title: 'Transparency',
    description: 'Clear pricing, session logs, and digital invoices remove guesswork at every step.',
    icon: Ticket,
  },
  {
    title: 'Seamless Access',
    description: 'Smart gate control links entry, exit, and account verification into one flow.',
    icon: Zap,
  },
];

const faqs = [
  {
    question: 'How does Smart Parking reduce wait time?',
    answer:
      'Drivers can see live availability before they arrive, reserve eligible spaces, and use cashless entry so they spend less time searching and queuing at the gate.',
  },
  {
    question: 'Can I connect this landing page to the existing admin dashboard?',
    answer:
      'Yes. The admin CTA opens the separate admin frontend while both apps still share the same backend auth and JWT storage format.',
  },
  {
    question: 'Do you support EV charging and advance bookings?',
    answer:
      'Yes. The experience highlights charger-aware spaces and flexible reservations so users can plan parking and charging together.',
  },
  {
    question: 'What happens if my parking session runs longer than expected?',
    answer:
      'Users can monitor time in real time and extend compatible sessions remotely, which helps prevent overstay surprises and improves turnover visibility.',
  },
];

const pricingCards = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For drivers getting set up with seamless digital parking.',
    points: ['Live slot search', 'Digital receipts', 'Session tracking'],
  },
  {
    name: 'Smart Driver',
    price: '$9/mo',
    description: 'For frequent parkers who want faster access and flexible bookings.',
    points: ['Advance reservations', 'Remote extensions', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For operators connecting access control, analytics, and admin teams.',
    points: ['Gate integrations', 'Usage insights', 'Multi-location support'],
  },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeSection, setActiveSection] = useState('how-it-works');
  const [showIntro, setShowIntro] = useState(true);
  const userLoginUrl = '/login';
  const userSignupUrl = '/signup';

  useEffect(() => {
    const sectionIds = navigation.map((item) => item.href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.35, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    const introTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 2100);

    return () => window.clearTimeout(introTimer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      <div
        className={`intro-screen ${showIntro ? 'intro-screen-visible' : 'intro-screen-hidden'}`}
        aria-hidden={!showIntro}
      >
        <div className="intro-orb intro-orb-left" />
        <div className="intro-orb intro-orb-right" />
        <div className="intro-brand">
          <div className="intro-logo-wrap">
            <div className="intro-logo">
              <MapPinned className="h-10 w-10" />
            </div>
          </div>
          <div className="intro-copy">
            <p className="intro-kicker">Smart Parking</p>
            <h1 className="intro-title">ParkNGo</h1>
            <p className="intro-tagline">Seamless parking, smarter access, cleaner journeys.</p>
          </div>
        </div>
      </div>

      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--color-secondary)] focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <div className={showIntro ? 'page-shell page-shell-hidden' : 'page-shell page-shell-visible'}>
      <header className="reveal-down sticky top-0 z-50 border-b border-[rgba(14,165,233,0.12)] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-[0_16px_36px_rgba(40,90,72,0.24)]">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">ParkNGo</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Smart Parking</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`nav-pill text-sm font-medium transition ${
                  activeSection === item.href.slice(1)
                    ? 'active text-[var(--color-secondary)]'
                    : 'text-slate-600 hover:text-[var(--color-primary)]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/search"
              className="rounded-full border border-[rgba(14,165,233,0.16)] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Book Now
            </Link>
            <Link
              to={userLoginUrl}
              className="rounded-full bg-[var(--color-secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(9,20,19,0.28)] transition hover:bg-[#163126]"
            >
              Login / Sign Up
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(14,165,233,0.16)] text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    activeSection === item.href.slice(1)
                      ? 'bg-[rgba(14,165,233,0.1)] text-[var(--color-secondary)]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/search"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"
              >
                Book Now
              </Link>
              <Link
                to={userLoginUrl}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-[var(--color-secondary)] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Login / Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        <section className="landing-grid relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.4),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:min-h-[calc(100vh-5.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-6 lg:px-8 lg:py-6 xl:gap-8">
            <div className="flex flex-col justify-center">
              <div className="reveal-up inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(14,165,233,0.18)] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                Built for cashless parking, access control, and live availability
              </div>
              <h1 className="reveal-up reveal-delay-1 mt-3 max-w-[12ch] text-[2.9rem] font-semibold leading-[0.88] tracking-[-0.05em] text-[var(--color-secondary)] sm:text-[3.35rem] lg:max-w-[10.5ch] lg:text-[3.85rem]">
                The Smarter Way to Park
              </h1>
              <p className="reveal-up reveal-delay-2 mt-3 max-w-[40rem] text-[0.98rem] leading-6 text-slate-600 sm:text-[1.02rem]">
                Deliver seamless, cashless parking with real-time discovery, faster gate access, and
                session controls that keep drivers moving.
              </p>
              <div className="reveal-up reveal-delay-3 mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(40,90,72,0.24)] transition hover:bg-[#0369a1] sm:text-base"
                >
                  Book Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={userLoginUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(14,165,233,0.16)] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] sm:text-base"
                >
                  Login
                </Link>
              </div>
              <div className="reveal-up reveal-delay-4 mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                {[
                  ['Live slot map', Search],
                  ['Secure payment flow', ShieldCheck],
                  ['Fast entry and exit', CheckCircle2],
                ].map(([label, Icon]) => (
                  <div
                    key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,165,233,0.14)] bg-white/80 px-3 py-1.5"
                  >
                    <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                {[
                  ['98%', 'Successful gate pass-through'],
                  ['24/7', 'Live visibility on slot status'],
                  ['5 min', 'Average session start flow'],
                ].map(([stat, label], index) => (
                    <div key={label} className={`reveal-up reveal-delay-${Math.min(index + 2, 4)} hover-float rounded-[24px] border border-white/80 bg-white/90 p-3.5 shadow-[0_14px_40px_rgba(17,31,26,0.07)]`}>
                      <p className="text-lg font-semibold text-[var(--color-secondary)]">{stat}</p>
                      <p className="mt-1 text-[13px] leading-5 text-slate-500">{label}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="reveal-up reveal-delay-2 w-full max-w-[520px] lg:max-w-[540px]">
                <HeroParkingMap />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl reveal-up">
            <p className="section-kicker">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-4xl">
              From arrival to exit in five simple steps
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              A clean driver journey helps your team manage occupancy, billing, and access with fewer manual handoffs.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <div key={step.title} className={`timeline-card reveal-up reveal-delay-${(index % 5)} hover-float relative rounded-[28px] border border-[rgba(14,165,233,0.14)] bg-white p-6 shadow-[0_18px_50px_rgba(17,31,26,0.05)]`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(145deg,#0ea5e9_0%,#06b6d4_100%)] text-base font-semibold text-white shadow-[0_14px_30px_rgba(40,90,72,0.26)]">
                    {step.number}
                  </div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                    Step {index + 1}
                  </p>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-[var(--color-secondary)]">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="bg-[var(--color-muted-surface)] py-14 sm:py-16 lg:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl reveal-up">
              <p className="section-kicker">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-4xl">
                Modern parking operations without the friction
              </h2>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3 lg:mt-10">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="group reveal-up hover-float rounded-[30px] border border-white bg-white p-7 shadow-[0_18px_50px_rgba(17,31,26,0.05)] transition hover:shadow-[0_26px_60px_rgba(17,31,26,0.09)]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-[var(--color-secondary)]">{feature.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl reveal-up">
              <p className="section-kicker">Pricing</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-4xl">
                Flexible plans for drivers and operators
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              A template-ready pricing section keeps the page conversion-focused while leaving room to wire your real plans later.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingCards.map((card) => (
              <article
                key={card.name}
                className={`reveal-up hover-float rounded-[30px] border p-8 shadow-[0_18px_50px_rgba(17,31,26,0.05)] ${
                  card.featured
                    ? 'border-[rgba(14,165,233,0.3)] bg-[linear-gradient(180deg,#f4f8fd_0%,#ffffff_100%)]'
                    : 'border-[rgba(14,165,233,0.14)] bg-white'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{card.name}</p>
                <div className="mt-4 flex items-end gap-2">
                  <h3 className="text-4xl font-semibold tracking-tight text-[var(--color-secondary)]">{card.price}</h3>
                  {card.price !== 'Custom' && <span className="pb-1 text-sm text-slate-500">per user</span>}
                </div>
                <p className="mt-4 text-base leading-7 text-slate-600">{card.description}</p>
                <div className="mt-8 flex flex-col gap-3">
                  {card.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 text-sm text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
                      {point}
                    </div>
                  ))}
                </div>
                <Link
                  to={userSignupUrl}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    card.featured
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[#0369a1]'
                      : 'border border-[rgba(14,165,233,0.14)] text-slate-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                  }`}
                >
                  Choose plan
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="support" className="bg-[var(--color-muted-surface)] py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-8">
            <div className="reveal-up">
              <p className="section-kicker">Support</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-4xl">
                Answers that stay out of the way
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Keep the FAQ clean, lightweight, and easy to scan on mobile or desktop.
              </p>
              <div className="mt-8 rounded-[28px] border border-[rgba(14,165,233,0.14)] bg-white p-6 shadow-[0_16px_40px_rgba(17,31,26,0.05)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[var(--color-secondary)]">Need a guided setup?</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Your support area now gives users a clearer next step instead of ending with only FAQs.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to={userLoginUrl}
                        className="inline-flex items-center justify-center rounded-full bg-[var(--color-secondary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#163126]"
                      >
                        Login for Support
                      </Link>
                      <Link
                        to="/search"
                        className="inline-flex items-center justify-center rounded-full border border-[rgba(14,165,233,0.14)] px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        Explore booking
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <article
                    key={faq.question}
                    className="reveal-up overflow-hidden rounded-[24px] border border-[rgba(14,165,233,0.14)] bg-white shadow-[0_12px_40px_rgba(17,31,26,0.05)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-semibold text-[var(--color-secondary)] sm:text-lg">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 py-5 text-base leading-7 text-slate-600 sm:px-6">
                        {faq.answer}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="reveal-up mx-auto max-w-7xl rounded-[36px] border border-[rgba(14,165,233,0.16)] bg-[linear-gradient(135deg,#0f172a_0%,#0f3b67_100%)] px-6 py-10 text-white shadow-[0_26px_70px_rgba(9,20,19,0.18)] sm:px-10 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Ready to start
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Move drivers from search to session in a cleaner flow
              </h2>
              <p className="mt-4 text-base leading-8 text-white/72">
                The frontend now gives users repeated, clearer conversion points so they never get stuck deciding what to do next.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--color-secondary)] transition hover:bg-[var(--color-accent)]"
              >
                Book parking
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={userLoginUrl}
                className="inline-flex items-center justify-center rounded-full border border-white/14 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--color-secondary)] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.6fr))] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
                <MapPinned className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-semibold">ParkNGo</p>
                <p className="text-sm text-white/60">Parking intelligence for modern cities</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/68">
              A conversion-focused landing experience for smart parking products, ready to connect with your existing admin dashboard and booking flows.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Linkedin, Facebook, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="/"
                  onClick={(event) => event.preventDefault()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-white/25 hover:text-white"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Site Links</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/72">
              {navigation.map((item) => (
                <a key={item.label} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Product</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/72">
              <Link to="/search" className="transition hover:text-white">
                Book Now
              </Link>
              <Link to="/history" className="transition hover:text-white">
                Session History
              </Link>
              <Link to="/profile" className="transition hover:text-white">
                Account
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Compliance</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {['SOC2', 'GDPR', 'PCI DSS'].map((badge) => (
                <div
                  key={badge}
                  className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <div className="mobile-cta-bar fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-[24px] border border-[rgba(14,165,233,0.16)] bg-white/92 p-3 shadow-[0_18px_40px_rgba(17,31,26,0.12)] backdrop-blur-xl">
          <Link
            to="/search"
            className="flex-1 rounded-[18px] bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Book Now
          </Link>
          <Link
            to={userLoginUrl}
            className="flex-1 rounded-[18px] border border-[rgba(14,165,233,0.14)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-secondary)]"
          >
            Login
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;

