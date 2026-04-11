import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinned, Navigation, ParkingSquare } from 'lucide-react';
import { locationsAPI } from '../../services/api';
import { suratDemoParkingLots } from '../data/suratParkingLots';

const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 };

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0b1412' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1412' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ea79f' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1f322e' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#11201d' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7e9a92' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#17302b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d3a34' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9cb5ae' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#13211e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#081f2d' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6f95a7' }] },
];

const renderStatus = (status) => {
  switch (status) {
    case Status.LOADING:
      return <MapStatus title="Loading map" description="Connecting to Google Maps..." />;
    case Status.FAILURE:
      return (
        <MapStatus
          title="Map unavailable"
          description="Check your Google Maps API key and network configuration."
          tone="error"
        />
      );
    default:
      return <MapStatus title="Preparing map" description="Starting the live parking view..." />;
  }
};

const createParkingPin = () => {
  const pin = document.createElement('div');
  pin.style.width = '44px';
  pin.style.height = '44px';
  pin.style.borderRadius = '999px';
  pin.style.background = 'linear-gradient(180deg, #ff5a5f 0%, #d9363e 100%)';
  pin.style.border = '3px solid rgba(255,255,255,0.96)';
  pin.style.boxShadow = '0 14px 28px rgba(9,20,19,0.35)';
  pin.style.display = 'flex';
  pin.style.alignItems = 'center';
  pin.style.justifyContent = 'center';
  pin.style.color = '#ffffff';
  pin.style.fontSize = '20px';
  pin.style.fontWeight = '700';
  pin.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
  pin.textContent = 'P';
  return pin;
};

const createUserPin = () => {
  const pin = document.createElement('div');
  pin.style.width = '18px';
  pin.style.height = '18px';
  pin.style.borderRadius = '999px';
  pin.style.background = '#60a5fa';
  pin.style.border = '3px solid rgba(255,255,255,0.96)';
  pin.style.boxShadow = '0 0 0 8px rgba(96,165,250,0.16)';
  return pin;
};

const projectPoint = (lat, lng) => {
  const bounds = {
    minLat: 21.12,
    maxLat: 21.24,
    minLng: 72.74,
    maxLng: 72.86,
  };

  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;

  return {
    left: `${Math.min(94, Math.max(6, x))}%`,
    top: `${Math.min(90, Math.max(10, y))}%`,
  };
};

const SuratFallbackMap = ({ parkingLots }) => (
  <div className="relative h-full min-h-[440px] w-full overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#dce8dd_0%,#cfd9d0_100%)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.82),_transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0)_36%)]" />
    <div className="absolute inset-0 opacity-[0.96]">
      <svg viewBox="0 0 1000 640" className="h-full w-full">
        <rect width="1000" height="640" fill="#d8e2d8" />
        <g opacity="0.9">
          <rect x="38" y="44" width="164" height="112" rx="26" fill="#d2ddd2" />
          <rect x="238" y="62" width="182" height="126" rx="28" fill="#d4dfd4" />
          <rect x="458" y="56" width="228" height="118" rx="30" fill="#d3ddd3" />
          <rect x="726" y="48" width="226" height="132" rx="34" fill="#d5dfd5" />
          <rect x="58" y="212" width="212" height="138" rx="34" fill="#d3ddd3" />
          <rect x="302" y="222" width="178" height="112" rx="28" fill="#d6e1d6" />
          <rect x="514" y="214" width="180" height="124" rx="32" fill="#d1dbd1" />
          <rect x="728" y="220" width="194" height="142" rx="34" fill="#d4ded4" />
          <rect x="72" y="402" width="210" height="148" rx="36" fill="#d5dfd5" />
          <rect x="326" y="396" width="162" height="138" rx="32" fill="#d2ddd2" />
          <rect x="528" y="390" width="176" height="154" rx="36" fill="#d7e2d7" />
          <rect x="742" y="406" width="164" height="128" rx="32" fill="#d3ddd3" />
        </g>

        <g opacity="0.34">
          <path d="M44 170 H952" stroke="#f4f7f3" strokeWidth="12" strokeLinecap="round" />
          <path d="M40 372 H956" stroke="#eef3ef" strokeWidth="10" strokeLinecap="round" />
          <path d="M224 48 V580" stroke="#eef3ef" strokeWidth="10" strokeLinecap="round" />
          <path d="M498 40 V598" stroke="#f4f7f3" strokeWidth="12" strokeLinecap="round" />
          <path d="M710 46 V586" stroke="#eef3ef" strokeWidth="10" strokeLinecap="round" />
        </g>

        <g>
          <path d="M40 312 C150 282, 282 254, 430 236 C604 214, 780 198, 958 164" stroke="#f8faf8" strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M52 318 C162 288, 292 262, 434 244 C612 222, 790 204, 968 170" stroke="#cfd6cf" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M190 82 C286 162, 350 226, 418 306 S576 444, 708 548" stroke="#fbfdfb" strokeWidth="26" fill="none" strokeLinecap="round" />
          <path d="M190 82 C282 158, 346 226, 414 304 S572 442, 702 542" stroke="#cfd6cf" strokeWidth="11" fill="none" strokeLinecap="round" />
          <path d="M586 38 C614 116, 636 196, 658 280 C682 368, 706 450, 750 604" stroke="#f6f9f6" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M586 38 C612 116, 632 194, 654 278 C678 366, 700 448, 744 600" stroke="#ced5ce" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M74 112 C160 152, 230 190, 316 238" stroke="#f8faf8" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M744 260 C810 298, 858 342, 922 412" stroke="#f8faf8" strokeWidth="18" fill="none" strokeLinecap="round" />
        </g>

        <g opacity="0.85">
          <path d="M530 8 C550 116, 560 216, 574 334 C586 438, 610 536, 650 644" stroke="#8fc6df" strokeWidth="46" fill="none" strokeLinecap="round" />
          <path d="M530 8 C550 116, 560 216, 574 334 C586 438, 610 536, 650 644" stroke="#6aa9c9" strokeWidth="24" fill="none" strokeLinecap="round" opacity="0.55" />
        </g>

        <g opacity="0.52" fill="#95a596" fontSize="18" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700" letterSpacing="3">
          <text x="110" y="118">ADAJAN</text>
          <text x="764" y="132">VARACHHA</text>
          <text x="118" y="468">ATHWA</text>
          <text x="772" y="472">KATARGAM</text>
          <text x="606" y="118">TAPTI RIVER</text>
        </g>
      </svg>
    </div>

    <div className="absolute left-4 right-4 top-4 flex flex-wrap items-start justify-between gap-3 sm:left-5 sm:right-5 sm:top-5">
      <div className="rounded-2xl border border-[#ffffff]/55 bg-[rgba(249,252,248,0.84)] px-4 py-3 text-[#23342d] shadow-[0_14px_30px_rgba(32,45,38,0.14)] backdrop-blur-md">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#2f6c59]">Surat preview</p>
        <p className="mt-1.5 text-sm font-semibold">Built-in parking map while Google Maps is unavailable</p>
      </div>
      <div className="rounded-2xl border border-[#ffffff]/55 bg-[rgba(249,252,248,0.84)] px-4 py-3 text-right text-[#23342d] shadow-[0_14px_30px_rgba(32,45,38,0.14)] backdrop-blur-md">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">Area coverage</p>
        <p className="mt-1.5 text-sm font-semibold">Central Surat districts</p>
      </div>
    </div>

    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 sm:bottom-5 sm:left-5 sm:right-5">
      <div className="rounded-2xl border border-[#ffffff]/55 bg-[rgba(249,252,248,0.88)] px-4 py-3 text-[#23342d] shadow-[0_14px_30px_rgba(32,45,38,0.14)] backdrop-blur-md">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">Legend</p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#de4b50]" />
          Parking destination
        </div>
      </div>
      <div className="rounded-2xl border border-[#ffffff]/55 bg-[rgba(249,252,248,0.88)] px-4 py-3 text-[#23342d] shadow-[0_14px_30px_rgba(32,45,38,0.14)] backdrop-blur-md">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">Mode</p>
        <p className="mt-1.5 text-sm font-semibold">Static navigation-style map</p>
      </div>
    </div>

    {parkingLots.map((lot) => {
      const point = projectPoint(lot.lat, lot.lng);

      return (
        <Link
          key={lot._id}
          to={`/parking/${lot._id}`}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={point}
        >
          <div className="relative">
            <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(222,75,80,0.18)] blur-md transition duration-200 group-hover:bg-[rgba(222,75,80,0.26)]" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[linear-gradient(180deg,#ff6469_0%,#d83e45_100%)] text-white shadow-[0_16px_30px_rgba(71,34,36,0.26)] transition-transform duration-200 group-hover:scale-105">
              <span className="text-lg font-black">P</span>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-[calc(100%+0.7rem)] hidden w-44 -translate-x-1/2 rounded-2xl border border-white/80 bg-[rgba(248,251,247,0.94)] px-3 py-2 text-center text-[#23342d] shadow-[0_18px_34px_rgba(32,45,38,0.16)] backdrop-blur-md group-hover:block">
              <p className="text-xs font-semibold">{lot.name}</p>
              <p className="mt-1 text-[11px] text-slate-500">{lot.area}</p>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
);

const MapCanvas = ({ onPermissionStateChange, userLocation, enableLiveUpdate }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [lotsError, setLotsError] = useState('');
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLots(true);
        let response;

        if (enableLiveUpdate && userLocation) {
          // Fetch nearby locations if user location is available
          response = await locationsAPI.getNearby({
            lat: userLocation.lat,
            lng: userLocation.lng,
            radiusKm: 15, // Search radius in km
          });
        } else {
          // Fallback to all public locations
          response = await locationsAPI.getPublic();
        }

        const list = response?.data?.data?.locations || [];
        setParkingLots(Array.isArray(list) ? list : []);
        setLotsError('');
      } catch (error) {
        console.error('Error fetching parking locations:', error);
        setParkingLots([]);
        setLotsError('Unable to load parking locations from the server.');
      } finally {
        setLoadingLots(false);
      }
    };

    fetchLocations();
  }, [userLocation, enableLiveUpdate]);

  useEffect(() => {
    let map;
    let mounted = true;
    let userMarker;
    const lotMarkers = [];

    const initialize = async () => {
      if (!mapRef.current || !window.google?.maps || loadingLots) return;

      try {
        const { Map } = await window.google.maps.importLibrary('maps');
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');

        if (!mounted || !mapRef.current) return;

        const googleMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || null;
        const mapOptions = {
          center: DEFAULT_CENTER,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
        };

        if (googleMapId) {
          mapOptions.mapId = googleMapId;
        } else {
          mapOptions.styles = DARK_MAP_STYLES;
        }

        map = new Map(mapRef.current, mapOptions);

      parkingLots.forEach((lot) => {
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: lot.lat, lng: lot.lng },
          title: lot.name,
          content: createParkingPin(),
        });

        marker.addEventListener('gmp-click', () => {
          navigate(`/parking/${lot._id || lot.id}`);
        });

        lotMarkers.push(marker);
      });

      if (!navigator.geolocation) {
        onPermissionStateChange({
          kind: 'unsupported',
          message: 'Browser geolocation is not supported on this device.',
          location: null,
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!mounted || !map) return;

          const userCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(userCenter);
          map.setZoom(14);

          userMarker = new AdvancedMarkerElement({
            map,
            position: userCenter,
            title: 'Your location',
            content: createUserPin(),
          });

          onPermissionStateChange({
            kind: 'granted',
            message: 'Showing parking lots near your current location.',
            location: userCenter,
          });
        },
        (error) => {
          if (!mounted || !map) return;

          let message = 'Location access was unavailable. Showing our default service area.';

          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied. Showing our default service area instead.';
          }

          onPermissionStateChange({
            kind: 'denied',
            message,
            location: null,
          });

          map.setCenter(DEFAULT_CENTER);
          map.setZoom(13);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    } catch (error) {
      console.error('Google Maps initialization failed:', error);
      if (mounted) {
        setMapError(true);
      }
    }
    };

    initialize();

    return () => {
      mounted = false;
      if (userMarker?.map) {
        userMarker.map = null;
      }
      lotMarkers.forEach((marker) => {
        if (marker?.map) {
          marker.map = null;
        }
      });
    };
  }, [loadingLots, navigate, onPermissionStateChange, parkingLots, userLocation, enableLiveUpdate]);

  if (loadingLots) {
    return <MapStatus title="Loading locations" description="Fetching admin-added parking locations..." />;
  }

  if (mapError) {
    return (
      <div className="w-full rounded-[40px] border border-[rgba(64,138,113,0.14)] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f5_100%)] p-4 shadow-[0_34px_80px_rgba(17,31,26,0.12)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(64,138,113,0.12)] px-1 pb-4">
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.3em] text-slate-400">Live parking map</p>
            <h3 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.03em] text-[var(--color-secondary)]">Nearby parking lots</h3>
          </div>
          <div className="rounded-full border border-[rgba(64,138,113,0.14)] bg-white px-4 py-2 text-right">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-400">Fallback mode</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-secondary)]">Google Maps failed</p>
          </div>
        </div>

        <SuratFallbackMap parkingLots={parkingLots.length ? parkingLots : suratDemoParkingLots} />

        <div className="mt-4 rounded-2xl border border-[rgba(64,138,113,0.14)] bg-white px-4 py-3">
          <p className="text-xs leading-6 text-slate-600">
            Google Maps failed to initialize. Check your `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID`, or switch to fallback mode.
          </p>
        </div>
      </div>
    );
  }

  if (lotsError || !parkingLots.length) {
    return (
      <div className="w-full rounded-[40px] border border-[rgba(64,138,113,0.14)] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f5_100%)] p-4 shadow-[0_34px_80px_rgba(17,31,26,0.12)] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.3em] text-slate-500">Live parking map</p>
            <h3 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.03em] text-[var(--color-secondary)]">Nearby parking lots</h3>
          </div>
          <div className="rounded-full bg-[var(--color-secondary)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-secondary)]">Fallback preview</div>
        </div>

        <SuratFallbackMap parkingLots={suratDemoParkingLots} />

        <div className="mt-4 rounded-2xl border border-[rgba(64,138,113,0.14)] bg-white px-4 py-3 text-sm text-slate-600">
          {lotsError ? (
            <p>Unable to load parking locations from server. Showing demo map with animated car behavior until data is available.</p>
          ) : (
            <p>No locations found yet. Showing demo map with animated car parking flow while you add locations in admin.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapRef} className="h-full min-h-[420px] w-full rounded-[32px]" />
      <div className="grid gap-3 border-t border-white/10 px-4 py-4 sm:grid-cols-3">
        {parkingLots.map((lot) => (
          <Link
            key={lot._id || lot.id}
            to={`/parking/${lot._id || lot.id}`}
            className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white transition hover:border-[rgba(176,228,204,0.45)] hover:bg-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{lot.area || lot.name}</p>
              <ParkingSquare className="h-4 w-4 text-[#ff696d]" />
            </div>
            <p className="mt-2 text-xs leading-6 text-white/65">
              {[lot.city, lot.pincode].filter(Boolean).join(', ') || 'Live location'}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              {lot.distanceKm && (
                <p className="text-xs font-medium text-[var(--color-accent)]">
                  📍 {lot.distanceKm} km away
                </p>
              )}
              {lot.availableSlots !== undefined && (
                <p className={`text-xs font-medium ${
                  lot.availableSlots > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lot.availableSlots} slots available
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

const MapStatus = ({ title, description, tone = 'default' }) => (
  <div
    className={`flex h-full min-h-[420px] w-full flex-col items-center justify-center rounded-[32px] px-8 text-center ${
      tone === 'error'
        ? 'bg-[linear-gradient(180deg,#211111_0%,#140c0c_100%)] text-white'
        : 'bg-[linear-gradient(180deg,#10201d_0%,#0b1715_100%)] text-white'
    }`}
  >
    <MapPinned className="h-12 w-12 text-[var(--color-accent)]" />
    <p className="mt-5 text-2xl font-semibold">{title}</p>
    <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">{description}</p>
  </div>
);

const HeroParkingMap = () => {
  const [permissionState, setPermissionState] = useState({
    kind: 'idle',
    message: 'Requesting your location for a more accurate parking view.',
    location: null,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [enableLiveUpdate, setEnableLiveUpdate] = useState(true);
  const [publicLocations, setPublicLocations] = useState([]);
  const [loadingPublicLocations, setLoadingPublicLocations] = useState(true);
  const [mapApiFailed, setMapApiFailed] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchPublicLocations = async () => {
      try {
        setLoadingPublicLocations(true);
        const response = await locationsAPI.getPublic();
        const list = response?.data?.data?.locations || [];
        setPublicLocations(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching public locations for hero map:', error);
        setPublicLocations([]);
      } finally {
        setLoadingPublicLocations(false);
      }
    };

    fetchPublicLocations();
  }, []);

  useEffect(() => {
    const authFailureHandler = () => {
      console.error('Google Maps auth failure detected. Falling back to the demo map.');
      setMapApiFailed(true);
    };

    window.gm_authFailure = authFailureHandler;

    return () => {
      if (window.gm_authFailure === authFailureHandler) {
        window.gm_authFailure = undefined;
      }
    };
  }, []);

  const handlePermissionStateChange = (newState) => {
    setPermissionState(newState);
    if (newState.location) {
      setUserLocation(newState.location);
      setEnableLiveUpdate(true); // Auto-enable live updates when location is granted
    }
  };

  const resolvedLocations = publicLocations.length ? publicLocations : suratDemoParkingLots;

  if (!apiKey || mapApiFailed) {
    return (
      <div className="w-full rounded-[40px] border border-[rgba(64,138,113,0.14)] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f5_100%)] p-4 shadow-[0_34px_80px_rgba(17,31,26,0.12)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(64,138,113,0.12)] px-1 pb-4">
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.3em] text-slate-400">Live parking map</p>
            <h3 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.03em] text-[var(--color-secondary)]">Nearby parking lots</h3>
          </div>
          <div className="rounded-full border border-[rgba(64,138,113,0.14)] bg-white px-4 py-2 text-right">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-400">Fallback mode</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-secondary)]">Surat preview</p>
          </div>
        </div>

        <SuratFallbackMap parkingLots={resolvedLocations} />

        <div className="mt-4 rounded-2xl border border-[rgba(64,138,113,0.14)] bg-white px-4 py-3">
          <p className="text-xs leading-6 text-slate-600">
            {loadingPublicLocations
              ? 'Checking for admin-added locations...'
              : publicLocations.length
              ? 'Active admin locations are ready. Add your Google Maps key later to switch from the fallback map to the live Google map.'
              : 'No active admin locations were found yet, so Surat demo parking points are shown for now.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[40px] border border-white/80 bg-[linear-gradient(145deg,#ffffff_0%,#edf4f1_100%)] p-4 shadow-[0_34px_80px_rgba(17,31,26,0.12)] sm:p-5">
      <div className="overflow-hidden rounded-[34px] border border-[rgba(176,228,204,0.45)] bg-[#081412]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.3em] text-white/45">Live parking map</p>
            <h3 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.03em]">Nearby parking lots</h3>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-right">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-white/45">Dark mode</p>
            <p className="mt-1 text-sm font-semibold text-white/88">Google Maps</p>
          </div>
        </div>

        <div className="relative">
          <Wrapper apiKey={apiKey} version="weekly" libraries={['marker']} render={renderStatus}>
            <MapCanvas 
              onPermissionStateChange={handlePermissionStateChange} 
              userLocation={userLocation}
              enableLiveUpdate={enableLiveUpdate}
            />
          </Wrapper>

          <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-[rgba(8,20,18,0.85)] px-4 py-3 text-white shadow-[0_16px_34px_rgba(9,20,19,0.35)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-[var(--color-accent)]">
              <Navigation className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                {permissionState.kind === 'granted' ? 'Live centered' : 'Location status'}
              </p>
            </div>
            <p className="mt-2 max-w-[240px] text-xs leading-6 text-white/72">{permissionState.message}</p>
            {permissionState.kind === 'granted' && (
              <button
                onClick={() => setEnableLiveUpdate(!enableLiveUpdate)}
                className="mt-3 w-full rounded-lg bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
              >
                {enableLiveUpdate ? '📍 Live Enabled' : '📍 Live Disabled'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroParkingMap;
