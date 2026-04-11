import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPinned, ParkingSquare } from 'lucide-react';
import { locationsAPI } from '../../services/api';
import { getSuratDemoParkingLotById } from '../data/suratParkingLots';

const ParkingLotDetails = () => {
  const { parkingLotId } = useParams();
  const [parkingLot, setParkingLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchParkingLot = async () => {
      try {
        setLoading(true);
        const response = await locationsAPI.getPublicById(parkingLotId);
        setParkingLot(response?.data?.data || null);
        setNotFound(false);
      } catch (error) {
        console.error('Error fetching parking lot details:', error);
        const fallbackLot = getSuratDemoParkingLotById(parkingLotId);
        setParkingLot(fallbackLot);
        setNotFound(!fallbackLot);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLot();
  }, [parkingLotId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] px-4 py-12 text-[var(--color-ink)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[36px] border border-[rgba(14,165,233,0.16)] bg-white px-8 py-12 shadow-[0_20px_60px_rgba(17,31,26,0.08)]">
          <p className="text-lg font-semibold text-[var(--color-secondary)]">Loading parking lot details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !parkingLot) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] px-4 py-12 text-[var(--color-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(14,165,233,0.16)] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mt-8 overflow-hidden rounded-[36px] border border-[rgba(14,165,233,0.16)] bg-white shadow-[0_20px_60px_rgba(17,31,26,0.08)]">
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#0f3b67_100%)] px-8 py-10 text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-accent)]">Parking details</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{parkingLot.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
              Discover parking access details for this admin-managed location.
            </p>
          </div>

          <div className="grid gap-6 px-8 py-8 md:grid-cols-3">
            <div className="rounded-[28px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Address context</p>
              <div className="mt-4 flex items-start gap-3 text-slate-700">
                <MapPinned className="mt-1 h-5 w-5 text-[var(--color-primary)]" />
                <p className="text-sm leading-7">{[parkingLot.area, parkingLot.city, parkingLot.state].filter(Boolean).join(', ')}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Pincode</p>
              <div className="mt-4 flex items-center gap-3 text-slate-700">
                <ParkingSquare className="h-5 w-5 text-[var(--color-primary)]" />
                <p className="text-sm leading-7">{parkingLot.pincode || 'Not provided'}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Coordinates</p>
              <p className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[var(--color-secondary)]">
                {parkingLot.lat}, {parkingLot.lng}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 px-8 py-8">
            <Link
              to={`/search?parkingLot=${parkingLot._id}`}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0369a1]"
            >
              Explore booking options
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLotDetails;

