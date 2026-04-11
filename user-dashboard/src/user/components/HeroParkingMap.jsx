import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { Crosshair, MapPinned } from 'lucide-react';
import { locationsAPI } from '../../services/api';
import { suratDemoParkingLots } from '../data/suratParkingLots';

const DEFAULT_CENTER = [23.0225, 72.5714];
const DEFAULT_ZOOM = 13;
const USER_ZOOM = 15;

const parkingIcon = L.divIcon({
  className: 'leaflet-parking-marker',
  html: '<span>P</span>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -18],
});

const userIcon = L.divIcon({
  className: 'leaflet-user-marker',
  html: '<span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const getAvailabilityLabel = (location) => {
  if (typeof location?.availableSlots === 'number') {
    return `${location.availableSlots} slots available`;
  }

  if (typeof location?.status === 'string') {
    return location.status;
  }

  if (location?.status === true) {
    return 'Active service';
  }

  return 'Availability updating';
};

const MapViewportController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom, {
      duration: 1.1,
    });
  }, [center, map, zoom]);

  return null;
};

const ParkingMarkers = ({ parkingLocations }) => {
  const navigate = useNavigate();

  return (
    <>
      {parkingLocations.map((location) => (
        <Marker
          key={location._id || `${location.lat}-${location.lng}`}
          position={[location.lat, location.lng]}
          icon={parkingIcon}
          eventHandlers={{
            dblclick: () => navigate(`/search?parkingLot=${location._id || location.id}`),
          }}
        >
          <Popup>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900">{location.name}</p>
                <p className="text-xs text-slate-600">{location.area || location.city || 'Parking service area'}</p>
                <p className="text-xs font-medium text-cyan-700">{location.availabilityLabel}</p>
              </div>
              <Link
                to={`/search?parkingLot=${location._id || location.id}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 px-3 py-2 text-xs font-semibold text-white transition hover:brightness-105"
              >
                Book at {location.name}
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const HeroParkingMap = () => {
  const [publicLocations, setPublicLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [geoMessage, setGeoMessage] = useState('Enable location to center the map on your current position.');

  useEffect(() => {
    let cancelled = false;

    const fetchPublicLocations = async () => {
      try {
        setLoading(true);
        const response = await locationsAPI.getPublic();
        const list = response?.data?.data?.locations || [];
        if (!cancelled) {
          setPublicLocations(Array.isArray(list) ? list : []);
          setError('');
        }
      } catch (fetchError) {
        if (!cancelled) {
          setPublicLocations([]);
          setError('Live locations are unavailable, so demo parking services are shown.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPublicLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported in this browser.');
      return;
    }

    setGeoMessage('Detecting your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition = [position.coords.latitude, position.coords.longitude];
        setUserPosition(nextPosition);
        setGeoMessage('Map centered on your current location.');
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setGeoMessage('Location permission denied. Showing the default service area.');
          return;
        }

        setGeoMessage('Unable to detect your location right now. Showing the default service area.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const parkingLocations = useMemo(() => {
    const resolved = publicLocations.length ? publicLocations : suratDemoParkingLots;

    return resolved
      .filter((location) => Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng)))
      .map((location) => ({
        ...location,
        lat: Number(location.lat),
        lng: Number(location.lng),
        availabilityLabel: getAvailabilityLabel(location),
      }));
  }, [publicLocations]);

  const mapCenter = userPosition || (parkingLocations[0] ? [parkingLocations[0].lat, parkingLocations[0].lng] : DEFAULT_CENTER);

  return (
    <div className="w-full rounded-[30px] border border-[rgba(14,165,233,0.14)] bg-[linear-gradient(145deg,#ffffff_0%,#edf4fd_100%)] p-3 shadow-[0_34px_80px_rgba(17,31,26,0.12)] sm:p-3.5">
      <div className="overflow-hidden rounded-[26px] border border-[rgba(14,165,233,0.16)] bg-white">
        <div className="flex items-center justify-between border-b border-[rgba(14,165,233,0.12)] px-4 py-2.5 text-slate-900">
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.3em] text-slate-400">Live parking map</p>
            <h3 className="mt-1 text-[1.3rem] font-semibold tracking-[-0.03em]">Active parking services</h3>
          </div>
          <div className="rounded-full border border-[rgba(14,165,233,0.14)] bg-sky-50 px-3 py-1.5 text-right">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-slate-400">Map layer</p>
            <p className="mt-1 text-xs font-semibold text-[var(--color-secondary)] sm:text-sm">OpenStreetMap</p>
          </div>
        </div>

        <div className="relative">
          <div className="h-[300px] w-full lg:h-[320px]">
            <MapContainer
              center={mapCenter}
              zoom={userPosition ? USER_ZOOM : DEFAULT_ZOOM}
              scrollWheelZoom
              className="hero-leaflet-map h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapViewportController center={mapCenter} zoom={userPosition ? USER_ZOOM : DEFAULT_ZOOM} />

              {userPosition ? (
                <Marker position={userPosition} icon={userIcon}>
                  <Popup>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">Your location</p>
                      <p className="text-xs text-slate-600">Map auto-centered using browser geolocation.</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null}

              <ParkingMarkers parkingLocations={parkingLocations} />
            </MapContainer>
          </div>

          <div className="absolute left-3 top-3 rounded-2xl border border-[rgba(14,165,233,0.14)] bg-white/92 px-3 py-2 text-slate-900 shadow-[0_16px_34px_rgba(148,163,184,0.18)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyan-600">
              <Crosshair className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]">Location status</p>
            </div>
            <p className="mt-1.5 max-w-[220px] text-xs leading-5 text-slate-600">{geoMessage}</p>
          </div>
        </div>

        <div className="grid gap-2 border-t border-[rgba(14,165,233,0.12)] px-3 py-2.5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <button
            type="button"
            onClick={requestUserLocation}
            className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-[rgba(14,165,233,0.14)] bg-sky-50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-cyan-500 hover:bg-cyan-100"
          >
            <MapPinned className="h-4 w-4 text-cyan-600" />
            Use my location
          </button>

          <p className="text-xs leading-5 text-slate-600">
            Click a marker popup button to jump straight into booking for that parking location.
          </p>

          <div className="rounded-full border border-[rgba(14,165,233,0.14)] bg-sky-50 px-3 py-2 text-xs font-semibold text-slate-600">
            {loading ? 'Loading markers...' : `${parkingLocations.length} active services`}
          </div>
        </div>

        {error ? (
          <div className="border-t border-[rgba(14,165,233,0.12)] px-3 py-2.5 text-xs text-amber-700">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HeroParkingMap;
