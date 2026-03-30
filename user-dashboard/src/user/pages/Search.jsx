import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Smartphone,
  TimerReset,
  Zap,
} from 'lucide-react';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, locationsAPI, paymentsAPI } from '../../services/api';

const durations = [30, 60, 120, 180, 240, 480, 1440];

const pdfEscape = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const buildReceiptPdfBlob = (receipt) => {
  const lines = [
    'Smart Parking Receipt',
    '',
    `Booking: ${receipt.bookingId}`,
    `Receipt: ${receipt.receiptNumber}`,
    `Name: ${receipt.name}`,
    `Slot: ${receipt.slot}`,
    `Location: ${receipt.location}`,
    `Date & Time: ${new Date(receipt.dateTime).toLocaleString()}`,
    `Duration: ${receipt.duration} hr`,
    `Amount: INR ${receipt.amount}`,
    `Status: ${receipt.paymentStatus}`,
  ];

  const stream = [
    'BT',
    '/F1 24 Tf',
    '50 790 Td',
    `(${pdfEscape(lines[0])}) Tj`,
    '/F1 12 Tf',
    ...lines.slice(2).flatMap((line, index) => [
      index === 0 ? '0 -40 Td' : '0 -24 Td',
      `(${pdfEscape(line)}) Tj`,
    ]),
    'ET',
  ].join('\n');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${stream.length} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000311 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${311 + String(stream.length).length}
%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const StepTitle = ({ step, title, count, caption }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{step}</p>
      <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      {caption ? <p className="mt-2 text-sm text-slate-500">{caption}</p> : null}
    </div>
    {count ? (
      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{count}</div>
    ) : null}
  </div>
);

const getDisplayGeoText = (geo) => {
  if (!geo) return '';

  return [geo.area, geo.city, geo.pincode]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ');
};

const Search = () => {
  const { user, isAuthenticated, login, register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [locationModal, setLocationModal] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [geo, setGeo] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [vehicleType, setVehicleType] = useState('car');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    durationMinutes: 60,
    paymentMethod: 'upi',
    upiApp: 'generic',
  });
  const [userForm, setUserForm] = useState({ name: '', phone: '', email: '' });
  const [authForm, setAuthForm] = useState({
    loginEmail: '',
    loginPassword: '',
    signupName: '',
    signupPhone: '',
    signupEmail: '',
    signupPassword: '',
  });
  const [activeBooking, setActiveBooking] = useState(null);
  const [paymentSession, setPaymentSession] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setUserForm({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
    });
    setAuthForm((prev) => ({
      ...prev,
      loginEmail: user.email || '',
      signupName: user.name || '',
      signupPhone: user.phone || '',
      signupEmail: user.email || '',
    }));
  }, [user]);

  const activeFloor = useMemo(
    () => floors.find((floor) => floor.floorNumber === selectedFloor) || floors[0],
    [floors, selectedFloor],
  );

  const selectedSlotLabel = selectedSlot?.slotNumber || 'Choose a slot';
  const selectedLocationLabel = selectedLocation?.name || 'Choose nearby location';
  const durationLabel =
    bookingForm.durationMinutes === 30
      ? '30 min'
      : bookingForm.durationMinutes === 1440
        ? '24 hr'
        : `${bookingForm.durationMinutes / 60} hr`;

  const reverseGeocode = async (lat, lng) => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const normalize = (value, fallback = '') => {
      const cleaned = String(value || '').trim();
      return cleaned || fallback;
    };

    try {
      if (key) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`,
        );
        const data = await response.json();
        const components = data.results?.[0]?.address_components || [];
        const pick = (type) =>
          components.find((item) => item.types.includes(type))?.long_name || '';

        return {
          city: normalize(
            pick('locality') ||
              pick('administrative_area_level_3') ||
              pick('administrative_area_level_2'),
            'Detected City',
          ),
          area: normalize(
            pick('sublocality_level_1') ||
              pick('sublocality') ||
              pick('neighborhood') ||
              pick('premise') ||
              pick('route'),
            pick('locality') || 'Detected Area',
          ),
          pincode: normalize(pick('postal_code')),
        };
      }

      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      const fallbackData = await fallbackResponse.json();
      const address = fallbackData.address || {};
      const displayNameParts = String(fallbackData.display_name || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const fallbackArea =
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.hamlet ||
        address.quarter ||
        address.city_district ||
        address.municipality ||
        address.road ||
        displayNameParts[0] ||
        address.town ||
        address.village ||
        '';

      return {
        city: normalize(
          address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            address.state_district,
          'Detected City',
        ),
        area: normalize(fallbackArea, 'Detected Area'),
        pincode: normalize(address.postcode),
      };
    } catch {
      return { city: 'Detected City', area: 'Detected Area', pincode: '' };
    }
  };

  const fetchNearbyLocations = async (lat, lng, options = {}) => {
    const { preserveSelection = true, detectedLocation = null } = options;
    const response = await locationsAPI.getNearby({
      lat,
      lng,
      radiusKm: 10,
      city: detectedLocation?.city,
      area: detectedLocation?.area,
      pincode: detectedLocation?.pincode,
    });
    const nextLocations = response.data.data.locations || [];

    setLocations(nextLocations);
    setSelectedLocation((current) => {
      if (!nextLocations.length) return null;
      if (preserveSelection && current?.id) {
        return nextLocations.find((location) => location.id === current.id) || nextLocations[0];
      }
      return nextLocations[0];
    });
  };

  const fetchBlueprint = async (locationId, options = {}) => {
    const { preserveSelection = true } = options;
    const response = await locationsAPI.getBlueprint(locationId, { vehicleType });
    const nextFloors = response.data.data.floors || [];

    setFloors(nextFloors);
    setSelectedFloor((currentFloor) =>
      nextFloors.some((floor) => floor.floorNumber === currentFloor)
        ? currentFloor
        : nextFloors[0]?.floorNumber || 1,
    );
    setSelectedSlot((currentSlot) => {
      if (!preserveSelection || !currentSlot?.id) return null;
      const flattenedSlots = nextFloors.flatMap((floor) => floor.slots || []);
      return flattenedSlots.find((slot) => slot.id === currentSlot.id) || null;
    });
  };

  useEffect(() => {
    if (!selectedLocation) {
      setFloors([]);
      setSelectedSlot(null);
      return undefined;
    }

    let cancelled = false;

    const syncBlueprint = async () => {
      try {
        setLoading(true);
        await fetchBlueprint(selectedLocation.id, { preserveSelection: true });
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Unable to load blueprint');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    syncBlueprint();

    return () => {
      cancelled = true;
    };
  }, [selectedLocation, vehicleType]);

  const loadNearby = async () => {
    setError('');
    setLocationModal(false);
    setLoading(true);

    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        }),
      );
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const detected = await reverseGeocode(lat, lng);
      setGeo({ lat, lng, ...detected });
      await fetchNearbyLocations(lat, lng, {
        preserveSelection: false,
        detectedLocation: detected,
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Location access failed');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async () => {
    try {
      setLoading(true);
      setError('');
      setReceipt(null);
      setPaymentSession(null);

      const bookingResponse = await bookingsAPI.createSmart({
        locationId: selectedLocation.id,
        parkingSlotId: selectedSlot.id,
        floor: selectedFloor,
        vehicleType,
        date: bookingForm.date,
        time: bookingForm.time,
        durationMinutes: Number(bookingForm.durationMinutes),
        city: selectedLocation.city || geo?.city,
        area: selectedLocation.area || geo?.area,
        pincode: selectedLocation.pincode || geo?.pincode,
      });

      const booking = bookingResponse.data.data.booking;
      setActiveBooking(booking);

      const paymentResponse = await paymentsAPI.initiate({
        bookingId: booking._id,
        paymentMethod: bookingForm.paymentMethod,
        upiApp: bookingForm.upiApp,
      });

      setPaymentSession(paymentResponse.data.data.session);
      setPaymentMessage('');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to continue booking');
    } finally {
      setLoading(false);
    }
  };

  const startFlow = async () => {
    if (!selectedLocation || !selectedSlot || !bookingForm.date || !bookingForm.time) {
      setError('Select location, slot, date, and time');
      return;
    }

    if (!userForm.name || !userForm.phone || !userForm.email) {
      setError('Fill your details first');
      return;
    }

    if (!isAuthenticated) {
      setAuthModal(true);
      return;
    }

    await createBooking();
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result =
        authMode === 'login'
          ? await login(authForm.loginEmail, authForm.loginPassword)
          : await register({
              name: authForm.signupName,
              phone: authForm.signupPhone,
              email: authForm.signupEmail,
              password: authForm.signupPassword,
            });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAuthModal(false);
      await createBooking();
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (status) => {
    if (!paymentSession || !activeBooking) return;

    setLoading(true);
    try {
      setError('');
      const response = await paymentsAPI.verify({
        paymentId: paymentSession.paymentId,
        bookingId: activeBooking._id,
        status,
        transactionId: status === 'success' ? `TXN_${Date.now()}` : undefined,
      });

      if (status === 'success') {
        setReceipt(response.data.data.receipt);
      } else {
        setReceipt(null);
      }

      if (status !== 'success') {
        setError(status === 'failed' ? 'Payment failed and lock released' : 'Payment pending');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const launchPaymentApp = (app) => {
    if (!paymentSession?.upiLinks?.[app]) return;
    setBookingForm((current) => ({ ...current, upiApp: app }));
    setPaymentMessage(
      `${app === 'generic' ? 'UPI app' : app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : 'Paytm'} opening request sent. Complete payment in the app, then return here and tap Success.`,
    );
    window.location.href = paymentSession.upiLinks[app];
  };

  const downloadReceiptPdf = () => {
    if (!receipt) return;
    const blob = buildReceiptPdfBlob(receipt);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receipt.receiptNumber || 'parking'}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fdf9_0%,#eef8f3_100%)] p-4 text-[var(--color-secondary)] sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(17,31,26,0.08)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <span className="inline-flex rounded-full bg-[rgba(176,228,204,0.18)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                Live Booking Desk
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Smart Parking Booking Flow</h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Find nearby parking, choose the right slot, confirm details, and finish payment from a
                cleaner dashboard-style flow.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setLocationModal(true)}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Enable Location Access
                </button>
                <button
                  type="button"
                  onClick={loadNearby}
                  className="rounded-full border border-[rgba(64,138,113,0.16)] px-5 py-3 text-sm font-semibold"
                >
                  Refresh Nearby
                </button>
                <button
                  type="button"
                  onClick={startFlow}
                  className="rounded-full border border-[rgba(64,138,113,0.16)] px-5 py-3 text-sm font-semibold"
                >
                  Proceed to Book
                </button>
              </div>

              {geo ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  Near {getDisplayGeoText(geo)}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  label: 'Selected Location',
                  value: selectedLocationLabel,
                  icon: <MapPin className="h-5 w-5" />,
                },
                {
                  label: 'Selected Slot',
                  value: selectedSlotLabel,
                  icon: <ShieldCheck className="h-5 w-5" />,
                },
                {
                  label: 'Booking Duration',
                  value: durationLabel,
                  icon: <TimerReset className="h-5 w-5" />,
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-[28px] border border-[rgba(64,138,113,0.14)] bg-[linear-gradient(180deg,#ffffff_0%,#f5fbf8_100%)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[rgba(176,228,204,0.22)] p-3 text-[var(--color-primary)]">
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {card.label}
                      </p>
                      <p className="mt-1 font-semibold">{card.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[rgba(64,138,113,0.14)] bg-white p-6 shadow-[0_18px_40px_rgba(17,31,26,0.04)]">
              <StepTitle
                step="Step 1"
                title="Nearby Locations"
                count={`${locations.length} found`}
                caption="Live options from your current location."
              />

              <div className="mt-4 space-y-3">
                {locations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[rgba(64,138,113,0.18)] px-4 py-8 text-center text-sm text-slate-500">
                    {geo
                      ? 'No nearby parking locations found. Add a Location and then create Slots for it from the admin dashboard.'
                      : 'Enable location to load nearby parking.'}
                  </div>
                ) : (
                  locations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(location);
                        setSelectedSlot(null);
                      }}
                      className={`block w-full rounded-[26px] border px-4 py-4 text-left transition-all ${
                        selectedLocation?.id === location.id
                          ? 'border-[var(--color-primary)] bg-[rgba(176,228,204,0.18)] shadow-[0_18px_36px_rgba(64,138,113,0.12)]'
                          : 'border-[rgba(64,138,113,0.12)] hover:border-[rgba(64,138,113,0.3)] hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{location.name}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {location.area}, {location.city} {location.pincode}
                          </div>
                        </div>
                        <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[var(--color-primary)] shadow-sm">
                          {location.availableSlots} free
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {location.distanceKm !== null
                          ? `${location.distanceKm} km away`
                          : location.matchType === 'pincode'
                            ? 'Pincode match'
                            : location.matchType === 'area'
                              ? 'Area match'
                              : 'City match'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-[rgba(64,138,113,0.14)] bg-white p-6 shadow-[0_18px_40px_rgba(17,31,26,0.04)]">
              <StepTitle
                step="Step 2"
                title="Booking Details"
                caption="Pick vehicle, date, payment method, and user details before lock creation."
              />

              <div className="mt-4 grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'car', label: 'Car', marker: 'C' },
                    { key: 'bike', label: 'Bike', marker: 'B' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setVehicleType(item.key)}
                      className={`rounded-[26px] border px-4 py-4 ${
                        vehicleType === item.key
                          ? 'border-[var(--color-primary)] bg-[rgba(176,228,204,0.18)] shadow-[0_16px_30px_rgba(64,138,113,0.1)]'
                          : 'border-[rgba(64,138,113,0.12)]'
                      }`}
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(176,228,204,0.24)] text-lg font-bold text-[var(--color-primary)]">
                        {item.marker}
                      </div>
                      <div className="mt-2 text-sm font-semibold">{item.label}</div>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="rounded-[26px] border border-[rgba(64,138,113,0.16)] px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Date
                    </div>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm((state) => ({ ...state, date: e.target.value }))}
                      className="w-full bg-transparent outline-none"
                    />
                  </label>

                  <label className="rounded-[26px] border border-[rgba(64,138,113,0.16)] px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      <TimerReset className="h-3.5 w-3.5" />
                      Time
                    </div>
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm((state) => ({ ...state, time: e.target.value }))}
                      className="w-full bg-transparent outline-none"
                    />
                  </label>
                </div>

                <label className="rounded-[26px] border border-[rgba(64,138,113,0.16)] px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    <TimerReset className="h-3.5 w-3.5" />
                    Duration
                  </div>
                  <select
                    value={bookingForm.durationMinutes}
                    onChange={(e) =>
                      setBookingForm((state) => ({
                        ...state,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-transparent outline-none"
                  >
                    {durations.map((value) => (
                      <option key={value} value={value}>
                        {value === 30 ? '30 min' : value === 1440 ? '24 hr' : `${value / 60} hr`}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={userForm.name}
                    onChange={(e) => setUserForm((state) => ({ ...state, name: e.target.value }))}
                    className="rounded-[26px] border border-[rgba(64,138,113,0.16)] px-4 py-3"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm((state) => ({ ...state, phone: e.target.value }))}
                    className="rounded-[26px] border border-[rgba(64,138,113,0.16)] px-4 py-3"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) => setUserForm((state) => ({ ...state, email: e.target.value }))}
                    className="rounded-[26px] border border-[rgba(64,138,113,0.16)] px-4 py-3"
                  />
                </div>

                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        key: 'upi',
                        label: 'UPI',
                        icon: <Smartphone className="mx-auto h-5 w-5 text-[var(--color-primary)]" />,
                      },
                      {
                        key: 'card',
                        label: 'Card',
                        icon: <CreditCard className="mx-auto h-5 w-5 text-[var(--color-primary)]" />,
                      },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setBookingForm((state) => ({
                            ...state,
                            paymentMethod: item.key,
                          }))
                        }
                        className={`rounded-[26px] border px-4 py-4 ${
                          bookingForm.paymentMethod === item.key
                            ? 'border-[var(--color-primary)] bg-[rgba(176,228,204,0.18)] shadow-[0_16px_30px_rgba(64,138,113,0.1)]'
                            : 'border-[rgba(64,138,113,0.12)]'
                        }`}
                      >
                        {item.icon}
                        <div className="mt-2 text-sm font-semibold">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-dashed border-[rgba(64,138,113,0.16)] bg-[rgba(176,228,204,0.08)] px-4 py-4 text-sm text-slate-600">
                  {bookingForm.paymentMethod === 'upi'
                    ? 'UPI selected. After the slot is locked, choose your app from the payment panel once and complete the payment.'
                    : 'Card selected. After the slot is locked, continue in the payment panel and verify the card result there.'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-[rgba(64,138,113,0.14)] bg-white p-6 shadow-[0_18px_40px_rgba(17,31,26,0.04)]">
              <StepTitle
                step="Step 3"
                title={selectedLocation ? selectedLocation.name : 'Blueprint View'}
                caption="Choose one available slot from the active floor."
              />

              {loading ? <Loader2 className="mt-4 h-5 w-5 animate-spin text-[var(--color-primary)]" /> : null}

              {floors.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[rgba(64,138,113,0.18)] px-4 py-10 text-center text-sm text-slate-500">
                  {selectedLocation
                    ? 'This location has no slots yet. Add parking slots for this location in the admin dashboard.'
                    : 'Select a nearby location to load slots.'}
                </div>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {floors.map((floor) => (
                      <button
                        key={floor.floorNumber}
                        type="button"
                        onClick={() => {
                          setSelectedFloor(floor.floorNumber);
                          setSelectedSlot(null);
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          selectedFloor === floor.floorNumber
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {floor.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {activeFloor?.slots?.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.isBookable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-[26px] border p-4 text-left transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'border-[var(--color-primary)] bg-[rgba(176,228,204,0.14)] shadow-[0_18px_34px_rgba(64,138,113,0.14)]'
                            : 'border-[rgba(64,138,113,0.12)]'
                        } ${
                          !slot.isBookable
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-white hover:border-[rgba(64,138,113,0.28)] hover:shadow-[0_12px_24px_rgba(17,31,26,0.06)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{slot.slotNumber}</span>
                          {slot.slotType === 'ev' ? <Zap className="h-4 w-4" /> : null}
                        </div>
                        <div className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          {slot.slotType}
                        </div>
                        <div className="mt-3 text-sm capitalize">{slot.status}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {paymentSession ? (
              <div className="rounded-[32px] border border-[rgba(64,138,113,0.14)] bg-white p-6 shadow-[0_18px_40px_rgba(17,31,26,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Step 4</p>
                    <h2 className="mt-1 text-2xl font-semibold">Payment</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Lock expires at {new Date(paymentSession.expiresAt).toLocaleTimeString()}.
                    </p>
                  </div>

                  <div className="rounded-full bg-[rgba(176,228,204,0.18)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {bookingForm.paymentMethod === 'upi' ? 'UPI checkout' : 'Card checkout'}
                  </div>
                </div>

                {bookingForm.paymentMethod === 'upi' ? (
                  <div className="mt-5 rounded-[28px] border border-[rgba(64,138,113,0.12)] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf8_100%)] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          UPI Apps
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">Choose one app to continue</h3>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                        One-time choice
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ['generic', 'Any UPI'],
                        ['gpay', 'Google Pay'],
                        ['phonepe', 'PhonePe'],
                        ['paytm', 'Paytm'],
                      ].map(([app, label]) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => launchPaymentApp(app)}
                          className={`rounded-[24px] border px-4 py-4 text-left transition-all ${
                            bookingForm.upiApp === app
                              ? 'border-[var(--color-primary)] bg-[rgba(176,228,204,0.14)]'
                              : 'border-[rgba(64,138,113,0.12)] hover:border-[rgba(64,138,113,0.28)] hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-sm font-semibold">{label}</div>
                          <div className="mt-1 text-xs text-slate-500">Tap to open and pay</div>
                        </button>
                      ))}
                    </div>

                    {paymentMessage ? (
                      <div className="mt-4 rounded-[22px] bg-[rgba(176,228,204,0.12)] px-4 py-3 text-sm text-slate-600">
                        {paymentMessage}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[28px] border border-[rgba(64,138,113,0.12)] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf8_100%)] p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Card Checkout
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">Card payment ready</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Use the verification controls below to confirm the card transaction result.
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Verification Result
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => verifyPayment('success')}
                      className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
                    >
                      Success
                    </button>
                    <button
                      type="button"
                      onClick={() => verifyPayment('pending')}
                      className="rounded-full border px-5 py-3 text-sm font-semibold"
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => verifyPayment('failed')}
                      className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600"
                    >
                      Failed
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {receipt ? (
              <div className="rounded-[32px] border border-[rgba(64,138,113,0.16)] bg-[linear-gradient(160deg,#0c1816_0%,#17322a_100%)] p-6 text-white shadow-[0_24px_70px_rgba(12,24,22,0.28)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Booking Complete
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">Receipt</h2>
                  </div>
                  <button
                    type="button"
                    onClick={downloadReceiptPdf}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary)]"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    {[
                      ['Booking ID', receipt.bookingId],
                      ['Receipt No', receipt.receiptNumber],
                      ['Customer', receipt.name],
                      ['Slot', receipt.slot],
                      ['Location', receipt.location],
                      ['Amount', `INR ${receipt.amount}`],
                      ['Duration', `${receipt.duration} hr`],
                      ['Status', receipt.paymentStatus],
                    ].map(([label, value]) => (
                      <div key={label} className="px-5 py-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                          {label}
                        </div>
                        <div className="mt-2 text-xl font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal isOpen={locationModal} onClose={() => setLocationModal(false)} title="Enable Location Access">
        <p className="text-sm leading-7 text-slate-600">
          We use browser geolocation to detect your current place, reverse geocode city, area, and
          pincode, and then load matching nearby parking locations from the backend.
        </p>
        <button
          type="button"
          onClick={loadNearby}
          className="mt-4 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
        >
          Allow Location Access
        </button>
      </Modal>

      <Modal isOpen={authModal} onClose={() => setAuthModal(false)} title="Login First" size="lg">
        <div className="mb-4 flex gap-3">
          {['login', 'signup'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                authMode === mode ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <form onSubmit={submitAuth} className="grid gap-4">
          {authMode === 'login' ? (
            <>
              <input
                type="email"
                placeholder="Email"
                value={authForm.loginEmail}
                onChange={(e) => setAuthForm((state) => ({ ...state, loginEmail: e.target.value }))}
                className="rounded-2xl border border-[rgba(64,138,113,0.16)] px-4 py-3"
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.loginPassword}
                onChange={(e) => setAuthForm((state) => ({ ...state, loginPassword: e.target.value }))}
                className="rounded-2xl border border-[rgba(64,138,113,0.16)] px-4 py-3"
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Name"
                value={authForm.signupName}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupName: e.target.value }))}
                className="rounded-2xl border border-[rgba(64,138,113,0.16)] px-4 py-3"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={authForm.signupPhone}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupPhone: e.target.value }))}
                className="rounded-2xl border border-[rgba(64,138,113,0.16)] px-4 py-3"
              />
              <input
                type="email"
                placeholder="Email"
                value={authForm.signupEmail}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupEmail: e.target.value }))}
                className="rounded-2xl border border-[rgba(64,138,113,0.16)] px-4 py-3"
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.signupPassword}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupPassword: e.target.value }))}
                className="rounded-2xl border border-[rgba(64,138,113,0.16)] px-4 py-3"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            {loading ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : authMode === 'login' ? (
              'Login and Continue'
            ) : (
              'Create Account and Continue'
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Search;
