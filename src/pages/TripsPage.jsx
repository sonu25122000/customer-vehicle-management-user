import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile, fetchTrips, vehiclePhotoUrl } from '../api/portal';
import { errorMessage } from '../api/client';
import StatusChip from '../components/StatusChip';
import RateTripModal from '../components/RateTripModal';
import { CarIcon, CalendarIcon, ArrowRightIcon, StarIcon, WhatsAppIcon, KeyIcon, FlagIcon, AlertIcon } from '../components/icons';
import { formatDate, formatTime, formatMoney, vehicleName } from '../utils/format';
import { whatsappLink } from '../utils/contact';
import { verificationMessage, verificationSummary } from '../utils/documents';
import { BOOKING_ENABLED } from '../utils/features';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'Yet to Start', label: 'Upcoming' },
  { key: 'On Trip', label: 'Ongoing' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
];

function CarThumb({ vehicle }) {
  const photo = vehicle?.photos?.[0];
  if (!photo) {
    return (
      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <CarIcon className="h-10 w-10 text-slate-400" />
      </span>
    );
  }
  return <img src={vehiclePhotoUrl(photo._id)} alt={vehicleName(vehicle)} loading="lazy" className="h-full w-full object-cover" />;
}

function TripCard({ trip, verified, onStart, onRate }) {
  const navigate = useNavigate();
  const due = Math.max((Number(trip.amount) || 0) - (Number(trip.advance) || 0), 0);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[8rem_1fr] items-center border-b border-slate-100 sm:grid-cols-[10.5rem_1fr]">
        {/* Same 4:3 frame as every car photo on the site. */}
        <div className="relative m-3 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          <CarThumb vehicle={trip.vehicle} />
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-2 py-3 pl-1 pr-4 sm:pr-5">
          <div className="min-w-0">
            <p className="truncate font-bold leading-snug text-slate-900">
              {vehicleName(trip.vehicle) || 'Car'} {trip.vehicle?.year && <span className="font-medium text-slate-500">{trip.vehicle.year}</span>}
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs font-semibold tracking-wide text-slate-500">{trip.tripId}</p>
              <StatusChip status={trip.status} />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">Start</p>
              <p className="text-sm font-semibold text-slate-900">{formatDate(trip.startDate)}</p>
              <p className="text-xs text-slate-500">{formatTime(trip.startTime)}</p>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-slate-300" />
            <div className="text-right">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">End</p>
              <p className="text-sm font-semibold text-slate-900">{formatDate(trip.endDate)}</p>
              <p className="text-xs text-slate-500">{formatTime(trip.endTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {trip.status === 'Yet to Start' && (
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-slate-500">
            {verified ? 'At pickup, ask our team for the start OTP.' : 'Verify your profile to be able to start this trip.'}
          </p>
          <button
            onClick={() => onStart(trip)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
          >
            <KeyIcon className="h-4 w-4" /> Start Trip
          </button>
        </div>
      )}
      {trip.status === 'On Trip' && (
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-slate-500">When you return the car, ask our team for the end OTP.</p>
          <button
            onClick={() => navigate(`/trips/${trip._id}/end`)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-ink"
          >
            <FlagIcon className="h-4 w-4" /> End Trip
          </button>
        </div>
      )}
      {trip.status === 'Completed' && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          {trip.customerRatedAt ? (
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              You rated this trip
              <span className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} className={`h-4 w-4 ${n <= trip.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                ))}
              </span>
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-500">How was your trip?</p>
              <button
                onClick={() => onRate(trip)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
              >
                <StarIcon className="h-4 w-4" /> Rate your trip
              </button>
            </>
          )}
        </div>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 bg-slate-50 px-4 py-3 text-sm sm:px-5">
        <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-1">
          <span className="text-slate-500">
            Amount{' '}
            <span className="font-bold text-slate-900">
              {Number(trip.amount) > 0 || trip.status !== 'Yet to Start' ? formatMoney(trip.amount) : 'To be confirmed'}
            </span>
          </span>
          {Number(trip.advance) > 0 && (
            <span className="text-slate-500">
              Due <span className="font-bold text-slate-900">{formatMoney(due)}</span>
            </span>
          )}
          {trip.status === 'Cancelled' && Number(trip.refundAmount) > 0 && (
            <span className="text-slate-500">
              Refund <span className="font-bold text-emerald-700">{formatMoney(trip.refundAmount)}</span>
            </span>
          )}
        </div>
        <a
          href={whatsappLink(`Hi Roam Wheels! I have a question about my trip ${trip.tripId}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-blue-600 hover:underline"
        >
          <WhatsAppIcon className="h-4 w-4" /> Need help?
        </a>
      </div>
    </article>
  );
}

export default function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('all');
  const [rating, setRating] = useState(null);

  useEffect(() => {
    fetchTrips()
      .then(setTrips)
      .catch((err) => {
        toast.error(errorMessage(err, 'Could not load your trips'));
        setTrips([]);
      });
    fetchProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const summary = profile ? verificationSummary(profile) : null;
  const verified = Boolean(summary?.verified);
  const hasUpcoming = (trips || []).some((t) => t.status === 'Yet to Start');
  const visible = (trips || []).filter((t) => tab === 'all' || t.status === tab);
  const countFor = (key) => (trips || []).filter((t) => key === 'all' || t.status === key).length;

  // Verified -> the OTP page. Not verified (yet) -> the documents page, with a note saying why.
  function handleStart(trip) {
    if (verified) {
      navigate(`/trips/${trip._id}/start`);
      return;
    }
    toast(summary ? verificationMessage(summary) : 'Please verify your profile to start your trip.', { icon: '🪪', duration: 5000 });
    navigate(`/documents?trip=${trip._id}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">My Trips</h1>
        {BOOKING_ENABLED ? (
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
          >
            <CalendarIcon className="h-4 w-4" /> Book a Car
          </Link>
        ) : (
          <Link to="/cars" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline">
            Browse cars <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>

      {summary && !verified && hasUpcoming && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <AlertIcon className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
            {verificationMessage(summary)}
          </p>
          <Link to="/documents" className="flex-shrink-0 font-bold underline">
            {summary.missing.length || summary.rejected.length ? 'Upload documents' : 'View status'}
          </Link>
        </div>
      )}

      <div className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.key ? 'bg-navy text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
              {trips && <span className="ml-1.5 opacity-70">{countFor(t.key)}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        {trips === null ? (
          [0, 1].map((i) => <div key={i} className="h-52 animate-pulse rounded-2xl bg-white" />)
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center lg:col-span-2">
            <CarIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">{tab === 'all' ? 'No trips yet' : 'No trips here'}</p>
            <p className="mt-1 text-sm text-slate-500">Your bookings will show up here.</p>
            <Link to={BOOKING_ENABLED ? '/book' : '/cars'} className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
              {BOOKING_ENABLED ? 'Book your first ride →' : 'Browse our cars →'}
            </Link>
          </div>
        ) : (
          visible.map((t) => <TripCard key={t._id} trip={t} verified={verified} onStart={handleStart} onRate={setRating} />)
        )}
      </div>

      {rating && (
        <RateTripModal
          trip={rating}
          onClose={() => setRating(null)}
          onRated={(updated) => {
            setTrips((list) => list.map((t) => (t._id === updated._id ? updated : t)));
            setRating(null);
          }}
        />
      )}
    </div>
  );
}
