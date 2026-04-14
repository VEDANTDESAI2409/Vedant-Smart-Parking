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
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, locationsAPI, paymentsAPI, vehiclesAPI } from '../../services/api';
import ParkingLotSlotMap from '../components/ParkingLotSlotMap';

const durations = [30, 60, 120, 180, 240, 480, 1440];
const USE_NEW_SLOT_STEP_MAP = true;

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const oneYearFromTodayInput = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return toDateInputValue(date);
};

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
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, login, register } = useAuth();
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
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
  const [vehicles, setVehicles] = useState([]);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [useExistingVehicle, setUseExistingVehicle] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [slotMapModalOpen, setSlotMapModalOpen] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const [pendingBooking, setPendingBooking] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    fuelType: 'petrol',
    registrationExpiry: oneYearFromTodayInput(),
    isDefault: true,
  });

  const desiredVehicleType = vehicleType === 'bike' ? 'motorcycle' : 'car';
  const compatibleVehicles = useMemo(
    () => vehicles.filter((item) => (item?.vehicleType || '').toLowerCase() === desiredVehicleType),
    [vehicles, desiredVehicleType],
  );

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

  useEffect(() => {
    if (paymentSession) {
      setPaymentModal(true);
    }
  }, [paymentSession]);

  useEffect(() => {
    let cancelled = false;

    const loadVehicles = async () => {
      if (!isAuthenticated) {
        setVehicles([]);
        setSelectedVehicleId('');
        return;
      }

      try {
        const response = await vehiclesAPI.getAll({ limit: 250 });
        const list = response?.data?.data?.vehicles || response?.data?.vehicles || [];
        if (!cancelled) {
          setVehicles(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        if (!cancelled) {
          setVehicles([]);
        }
      }
    };

    loadVehicles();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!compatibleVehicles.length) {
      setSelectedVehicleId('');
      setUseExistingVehicle(false);
      return;
    }

    const selectedStillValid = compatibleVehicles.some((item) => String(item?._id) === String(selectedVehicleId));
    if (selectedVehicleId && selectedStillValid) {
      setUseExistingVehicle(true);
      return;
    }

    const preferred = compatibleVehicles.find((item) => item?.isDefault) || compatibleVehicles[0];
    setSelectedVehicleId(preferred?._id || '');
    setUseExistingVehicle(true);
  }, [compatibleVehicles, isAuthenticated, selectedVehicleId]);

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
      return null;
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

  useEffect(() => {
    const parkingLotId = searchParams.get('parkingLot');
    if (!parkingLotId) return;

    let cancelled = false;

    const loadSelectedParkingLot = async () => {
      try {
        setLoading(true);
        const response = await locationsAPI.getPublicById(parkingLotId);
        const location = response?.data?.data;
        if (!location || cancelled) return;

        const normalizedLocation = {
          ...location,
          id: location.id || location._id,
        };

        setLocations((current) => {
          const exists = current.some((item) => String(item.id || item._id) === String(normalizedLocation.id));
          return exists ? current : [normalizedLocation, ...current];
        });
        setSelectedLocation(normalizedLocation);
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || 'Unable to load the selected parking location.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSelectedParkingLot();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

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

  const createBooking = async ({ vehicleIdOverride } = {}) => {
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
        vehicleId: vehicleIdOverride || selectedVehicleId || undefined,
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
      setPaymentModal(true);
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

    if (!selectedVehicleId) {
      setVehicleError('');
      setPendingBooking(true);
      setVehicleModal(true);
      return;
    }

    await createBooking();
  };

  const submitVehicle = async (event) => {
    event.preventDefault();
    setVehicleError('');

    if (useExistingVehicle) {
      if (!selectedVehicleId) {
        setVehicleError('Select a vehicle');
        return;
      }

      setVehicleModal(false);
      if (pendingBooking) {
        setPendingBooking(false);
        await createBooking({ vehicleIdOverride: selectedVehicleId });
      }
      return;
    }

    if (
      !vehicleForm.licensePlate ||
      !vehicleForm.make ||
      !vehicleForm.model ||
      !vehicleForm.year ||
      !vehicleForm.color ||
      !vehicleForm.registrationExpiry
    ) {
      setVehicleError('Fill all vehicle fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        licensePlate: String(vehicleForm.licensePlate).toUpperCase().replace(/\s/g, ''),
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: Number(vehicleForm.year),
        color: vehicleForm.color,
        vehicleType: desiredVehicleType,
        fuelType: vehicleForm.fuelType,
        registrationExpiry: vehicleForm.registrationExpiry,
        isDefault: Boolean(vehicleForm.isDefault),
      };

      const response = await vehiclesAPI.create(payload);
      const created = response?.data?.data?.vehicle;
      if (!created?._id) {
        throw new Error('Vehicle creation failed');
      }

      setVehicles((prev) => [created, ...prev]);
      setSelectedVehicleId(created._id);
      setVehicleModal(false);
      setUseExistingVehicle(true);

      if (pendingBooking) {
        setPendingBooking(false);
        await createBooking({ vehicleIdOverride: created._id });
      }
    } catch (e) {
      setVehicleError(e.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setAuthMessage('');

    try {
      if (authMode === 'login') {
        const result = await login(authForm.loginEmail, authForm.loginPassword);

        if (!result.success) {
          setError(result.error);
          return;
        }

        setAuthModal(false);
        await createBooking();
        return;
      }

      const result = await register({
              name: authForm.signupName,
              phone: authForm.signupPhone,
              email: authForm.signupEmail,
              password: authForm.signupPassword,
            });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAuthMode('login');
      setAuthMessage(result.message || 'Account created successfully. Please login to continue booking.');
      setAuthForm((state) => ({
        ...state,
        loginEmail: state.signupEmail,
        loginPassword: '',
      }));
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
        setPaymentModal(false);
        setPaymentSession(null);
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

  if (slotMapModalOpen) {
    return (
      <div className="bg-slate-50 min-h-screen py-6">
        <div className="w-full max-w-6xl mx-auto px-4">
          <ParkingLotSlotMap
            floors={floors}
            activeFloorNumber={selectedFloor}
            onSelectFloorNumber={(floorNumber) => {
              setSelectedFloor(floorNumber);
              setSelectedSlot(null);
              setActiveBooking(null);
              setPaymentSession(null);
              setReceipt(null);
            }}
            slots={activeFloor?.slots || []}
            vehicleType={vehicleType}
            selectedSlotId={selectedSlot?.id}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setActiveBooking(null);
              setPaymentSession(null);
              setReceipt(null);
            }}
            title="Parking Blueprint"
            entryLabel="ENTRY"
            variant="blueprint"
            onBack={() => setSlotMapModalOpen(false)}
            onNext={() => {
              if (!selectedSlot) return;
              setSlotMapModalOpen(false);
              setTimeout(() => {
                document
                  .getElementById('booking-details')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
            nextDisabled={!selectedSlot}
            nextLabel={selectedSlot ? 'Done' : 'Select a slot'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 border border-blue-200">
                Smart Booking
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Book Parking in Steps</h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Enable location first, then choose a parking place, pick a slot, and complete your booking with payment.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setLocationModal(true)}
                  className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  Enable Location Access
                </button>
                <button
                  type="button"
                  onClick={loadNearby}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors duration-200"
                >
                  Refresh Nearby
                </button>
              </div>

              {geo ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-blue-600" />
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
                  className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        {card.label}
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">{card.value}</p>
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
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <StepTitle
                step="Step 1"
                title="Choose Location"
                count={geo ? `${locations.length} found` : null}
                caption={
                  geo
                    ? 'Location access is enabled. Select one nearby parking location to unlock slot selection.'
                    : 'Enable location access first to load nearby parking options.'
                }
              />

              <div className="mt-4 space-y-3">
                {locations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
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
                        setActiveBooking(null);
                        setPaymentSession(null);
                        setReceipt(null);
                      }}
                      className={`block w-full rounded-[20px] border px-4 py-4 text-left transition-all duration-200 ${
                        selectedLocation?.id === location.id
                          ? 'border-blue-400 bg-blue-50 shadow-md'
                          : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{location.name}</div>
                          <div className="mt-1 text-sm text-slate-600">
                            {location.area}, {location.city} {location.pincode}
                          </div>
                        </div>
                        <div className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                          {location.availableSlots} free
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
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

            {selectedSlot ? (
              <div id="booking-details" className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <StepTitle
                step="Step 3"
                title="Booking Details"
                caption="The slot is selected. Now add your timing, profile, and payment method before creating the booking."
              />

              <div className="mt-4 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                      Date
                    </div>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm((state) => ({ ...state, date: e.target.value }))}
                      className="w-full bg-transparent outline-none text-slate-900 font-semibold"
                    />
                  </label>

                  <label className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      <TimerReset className="h-3.5 w-3.5 text-blue-600" />
                      Time
                    </div>
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm((state) => ({ ...state, time: e.target.value }))}
                      className="w-full bg-transparent outline-none text-slate-900 font-semibold"
                    />
                  </label>
                </div>

                <label className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <TimerReset className="h-3.5 w-3.5 text-blue-600" />
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
                    className="w-full bg-transparent outline-none text-slate-900 font-semibold"
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
                    className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm((state) => ({ ...state, phone: e.target.value }))}
                    className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) => setUserForm((state) => ({ ...state, email: e.target.value }))}
                    className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                  />
                </div>

                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        key: 'upi',
                        label: 'UPI',
                        icon: <Smartphone className="mx-auto h-5 w-5 text-blue-600" />,
                      },
                      {
                        key: 'card',
                        label: 'Card',
                        icon: <CreditCard className="mx-auto h-5 w-5 text-blue-600" />,
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
                        className={`rounded-[20px] border px-4 py-4 transition-all duration-200 ${
                          bookingForm.paymentMethod === item.key
                            ? 'border-blue-400 bg-blue-50 shadow-sm'
                            : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.icon}
                        <div className="mt-2 text-sm font-semibold text-slate-900">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[20px] border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
                  {bookingForm.paymentMethod === 'upi'
                    ? 'UPI selected. After the slot is locked, choose your app from the payment panel once and complete the payment.'
                    : 'Card selected. After the slot is locked, continue in the payment panel and verify the card result there.'}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={startFlow}
                    className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                  >
                    Continue to Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors duration-200"
                  >
                    Change Slot
                  </button>
                </div>
              </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            {selectedLocation ? (
              <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <StepTitle
                step="Step 2"
                title={selectedLocation.name}
                caption="Choose one available slot from the active floor to unlock booking details."
              />

              <div className="mt-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Vehicle Filter</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Pick car or bike first so we show the right slot options.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'car', label: 'Car', marker: 'C' },
                      { key: 'bike', label: 'Bike', marker: 'B' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setVehicleType(item.key);
                          setSelectedSlot(null);
                          setActiveBooking(null);
                          setPaymentSession(null);
                          setReceipt(null);
                        }}
                        className={`rounded-[18px] border px-4 py-3 transition-all duration-200 ${
                          vehicleType === item.key
                            ? 'border-blue-400 bg-blue-100 text-blue-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'
                        }`}
                      >
                        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-sm font-bold text-slate-700">
                          {item.marker}
                        </div>
                        <div className="mt-2 text-sm font-semibold">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? <Loader2 className="mt-4 h-5 w-5 animate-spin text-blue-600" /> : null}

	              {floors.length === 0 ? (
	                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
	                  {selectedLocation
	                    ? 'This location has no slots yet. Add parking slots for this location in the admin dashboard.'
	                    : 'Select a nearby location to load slots.'}
	                </div>
	              ) : (
	                USE_NEW_SLOT_STEP_MAP ? (
	                  <div className="mt-4 space-y-3">
	                    <div className="rounded-[24px] border border-[rgba(14,165,233,0.14)] bg-[var(--color-muted-surface)] p-4">
	                      <div className="flex flex-wrap items-center justify-between gap-3">
	                        <div>
	                          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Slot map</div>
	                          <div className="mt-1 text-sm font-semibold text-slate-800">
	                            {selectedSlot ? `Selected: ${selectedSlot.slotNumber}` : 'No slot selected yet'}
	                          </div>
	                        </div>
	                        <button
	                          type="button"
	                          onClick={() => setSlotMapModalOpen(true)}
	                          className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0369a1]"
	                        >
	                          Open full screen map
	                        </button>
	                      </div>
	                    </div>

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
                          setActiveBooking(null);
                          setPaymentSession(null);
                          setReceipt(null);
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                          selectedFloor === floor.floorNumber
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'
                        }`}
                      >
                        {floor.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
                    {(() => {
                      const collator = new Intl.Collator(undefined, {
                        numeric: true,
                        sensitivity: 'base',
                      });

                      const slotsSorted = (activeFloor?.slots || [])
                        .slice()
                        .sort((a, b) => collator.compare(String(a?.slotNumber || ''), String(b?.slotNumber || '')));

                      const openCount = slotsSorted.filter((slot) => slot?.isBookable).length;
                      const busyCount = slotsSorted.length - openCount;
                      const evCount = slotsSorted.filter((slot) => slot?.slotType === 'ev').length;

                      const previewOpen = slotsSorted.filter((slot) => slot?.isBookable).slice(0, 4);
                      const previewBusy = slotsSorted.filter((slot) => !slot?.isBookable).slice(0, 4);
                      const previewEv = slotsSorted.filter((slot) => slot?.slotType === 'ev').slice(0, 4);

                      return (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
                            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                              SLOT BLUEPRINT
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-200">
                                Open {openCount}
                              </span>
                              <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-700 border border-slate-200">
                                Busy {busyCount}
                              </span>
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                                EV {evCount}
                              </span>
                              {selectedSlot ? (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                  Selected: {selectedSlot.slotNumber}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="relative p-4 md:p-6 bg-white border border-slate-200 shadow-md rounded-[24px]">
                            <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              {slotsSorted.map((slot, index) => {
                                const isOpen = !!slot.isBookable;
                                const isSelected = selectedSlot?.id === slot.id;
                                const isEv = slot.slotType === 'ev';

                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    disabled={!slot.isBookable}
                                    onClick={() => {
                                      setSelectedSlot(slot);
                                      setActiveBooking(null);
                                      setPaymentSession(null);
                                      setReceipt(null);
                                    }}
                                    className={`group relative flex h-28 flex-col justify-between overflow-hidden rounded-3xl border px-6 py-5 text-left transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-300/60 ${
                                      isSelected
                                        ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 shadow-sm'
                                        : isOpen
                                          ? 'border-blue-100 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm'
                                          : 'border-slate-100 bg-slate-50'
                                    } ${!slot.isBookable ? 'cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99] active:shadow-none'}`}
                                    title={`${slot.slotNumber} • ${isOpen ? 'Open' : 'Busy'} • ${slot.slotType}`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold uppercase tracking-[0.26em] text-slate-400">
                                          SLOT {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <div className={`mt-1 truncate text-lg font-semibold leading-tight tracking-tight ${
                                          isSelected ? 'text-blue-700' : isOpen ? 'text-slate-900' : 'text-slate-600'
                                        }`}>
                                          {slot.slotNumber}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {isEv ? (
                                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 border border-blue-200">
                                            EV <Zap className="ml-1 h-3 w-3" />
                                          </span>
                                        ) : null}
                                        <span
                                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.18em] border ${
                                            isOpen
                                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                                              : 'bg-slate-50 text-slate-600 border-slate-200'
                                          }`}
                                        >
                                          {isOpen ? 'OPEN' : 'BUSY'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`h-2.5 w-2.5 rounded-full ${
                                            isOpen ? 'bg-blue-500' : 'bg-slate-300'
                                          } shadow-sm`}
                                        />
                                        <span className={`text-sm font-semibold ${
                                          isSelected ? 'text-blue-600' : isOpen ? 'text-slate-600' : 'text-slate-500'
                                        }`}>
                                          {isOpen ? 'Free' : 'Occupied'}
                                        </span>
                                      </div>
                                      <span className={`text-sm font-semibold ${
                                        isSelected ? 'text-blue-700 font-bold' : isOpen ? 'text-slate-500' : 'text-slate-400'
                                      }`}>
                                        {isSelected ? '✓ Selected' : isOpen ? 'Select' : '—'}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="relative mt-5 grid gap-3 lg:grid-cols-3">
                              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                  <div className="text-sm font-bold text-slate-900">Available</div>
                                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 border border-blue-200">
                                    {openCount} free
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {previewOpen.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className="flex h-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors duration-150"
                                    >
                                      {slot.slotNumber}
                                    </div>
                                  ))}
                                  {previewOpen.length === 0 ? (
                                    <div className="col-span-4 text-xs font-medium text-slate-500 py-2">
                                      No free slots
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                  <div className="text-sm font-bold text-slate-900">Occupied</div>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200">
                                    {busyCount} busy
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {previewBusy.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 opacity-70"
                                    >
                                      {slot.slotNumber}
                                    </div>
                                  ))}
                                  {previewBusy.length === 0 ? (
                                    <div className="col-span-4 text-xs font-medium text-slate-500 py-2">
                                      No occupied slots
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                  <div className="text-sm font-bold text-slate-900">EV Charging</div>
                                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 border border-blue-200">
                                    {evCount}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {previewEv.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className="flex h-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors duration-150"
                                    >
                                      {slot.slotNumber}
                                    </div>
                                  ))}
                                  {previewEv.length === 0 ? (
                                    <div className="col-span-4 text-xs font-medium text-slate-500 py-2">
                                      No EV slots
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
                )
              )}
              </div>
            ) : null}

            {receipt ? (
              <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Booking complete</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">Receipt</h2>
                  </div>
                  <button
                    type="button"
                    onClick={downloadReceiptPdf}
                    className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-100 bg-gradient-to-br from-blue-50 to-white">
                  <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">

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
                      <div key={label} className="px-6 py-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          {label}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal isOpen={paymentModal} onClose={() => setPaymentModal(false)} title="Payment" size="full">
        {paymentSession && (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Step 5</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Payment</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Lock expires at {new Date(paymentSession.expiresAt).toLocaleTimeString()}.
                </p>
              </div>

              <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                {bookingForm.paymentMethod === 'upi' ? 'UPI checkout' : 'Card checkout'}
              </div>
            </div>

            {bookingForm.paymentMethod === 'upi' ? (
              <div className="mt-5 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      UPI Apps
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">Choose one app to continue</h3>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
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
                      className={`rounded-[20px] border px-4 py-4 text-left transition-all duration-200 ${
                        bookingForm.upiApp === app
                          ? 'border-blue-400 bg-blue-50 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-900">{label}</div>
                      <div className="mt-1 text-xs text-slate-600">Tap to open and pay</div>
                    </button>
                  ))}
                </div>

                {paymentMessage ? (
                  <div className="mt-4 rounded-[22px] bg-[rgba(186,230,253,0.12)] px-4 py-3 text-sm text-slate-600">
                    {paymentMessage}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Card Checkout
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">Card payment ready</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Use the verification controls below to confirm the card transaction result.
                </p>
              </div>
            )}

            <div className="mt-5">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Verification Result
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => verifyPayment('success')}
                  className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => verifyPayment('pending')}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors duration-200"
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => verifyPayment('failed')}
                  className="rounded-full border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors duration-200"
                >
                  Failed
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

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
              onClick={() => {
                setAuthMode(mode);
                setError('');
                setAuthMessage('');
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                authMode === mode ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {authMessage ? (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {authMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={submitAuth} className="grid gap-4">
          {authMode === 'login' ? (
            <>
              <input
                type="email"
                placeholder="Email"
                value={authForm.loginEmail}
                onChange={(e) => setAuthForm((state) => ({ ...state, loginEmail: e.target.value }))}
                className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.loginPassword}
                onChange={(e) => setAuthForm((state) => ({ ...state, loginPassword: e.target.value }))}
                className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Name"
                value={authForm.signupName}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupName: e.target.value }))}
                className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={authForm.signupPhone}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupPhone: e.target.value }))}
                className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
              />
              <input
                type="email"
                placeholder="Email"
                value={authForm.signupEmail}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupEmail: e.target.value }))}
                className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.signupPassword}
                onChange={(e) => setAuthForm((state) => ({ ...state, signupPassword: e.target.value }))}
                className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
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

      <Modal
        isOpen={vehicleModal}
        onClose={() => {
          setVehicleModal(false);
          setPendingBooking(false);
        }}
        title="Vehicle Details"
        size="lg"
      >
        <p className="mb-4 text-sm leading-7 text-slate-600">
          Add your vehicle once and it will automatically appear in the Admin Vehicle Registry. We will reuse your
          saved vehicle for future bookings.
        </p>

        {compatibleVehicles.length ? (
          <div className="mb-4 flex gap-3">
            {[
              { key: 'existing', label: 'Use saved vehicle' },
              { key: 'new', label: 'Add new vehicle' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setUseExistingVehicle(item.key === 'existing')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  useExistingVehicle === (item.key === 'existing')
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {vehicleError ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {vehicleError}
          </div>
        ) : null}

        <form onSubmit={submitVehicle} className="grid gap-4">
          {useExistingVehicle && compatibleVehicles.length ? (
            <>
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Saved vehicles</div>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full rounded-[16px] border border-slate-100 bg-white px-4 py-3 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                >
                  <option value="">Select vehicle</option>
                  {compatibleVehicles.map((item) => (
                    <option key={item._id} value={item._id}>
                      {(item.licensePlate || 'UNKNOWN').toUpperCase()} • {item.make} {item.model}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Vehicle type</div>
                  <input
                    value={desiredVehicleType}
                    readOnly
                    className="w-full rounded-[16px] border border-slate-100 bg-slate-50 px-4 py-3 uppercase text-slate-600"
                  />
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Fuel type</div>
                  <select
                    value={vehicleForm.fuelType}
                    onChange={(e) => setVehicleForm((state) => ({ ...state, fuelType: e.target.value }))}
                    className="w-full rounded-[16px] border border-slate-100 bg-white px-4 py-3 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                  >
                    {['petrol', 'diesel', 'cng', 'electric', 'hybrid', 'other'].map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="License plate (e.g. GJ05AB1234)"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm((state) => ({ ...state, licensePlate: e.target.value }))}
                  className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 font-mono uppercase placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                />
                <input
                  type="text"
                  placeholder="Color (e.g. Black)"
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm((state) => ({ ...state, color: e.target.value }))}
                  className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Make (e.g. Honda)"
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm((state) => ({ ...state, make: e.target.value }))}
                  className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. City)"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm((state) => ({ ...state, model: e.target.value }))}
                  className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                />
                <input
                  type="number"
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm((state) => ({ ...state, year: e.target.value }))}
                  className="rounded-[16px] border border-slate-100 bg-white px-4 py-3 placeholder-slate-500 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                />
              </div>

              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Registration expiry</div>
                <input
                  type="date"
                  value={vehicleForm.registrationExpiry}
                  onChange={(e) => setVehicleForm((state) => ({ ...state, registrationExpiry: e.target.value }))}
                  className="w-full rounded-[16px] border border-slate-100 bg-white px-4 py-3 text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={vehicleForm.isDefault}
                  onChange={(e) => setVehicleForm((state) => ({ ...state, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Set as my default vehicle
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {useExistingVehicle && compatibleVehicles.length ? 'Continue' : 'Save vehicle & continue'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Search;

