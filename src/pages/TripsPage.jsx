import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile, fetchTrips, vehiclePhotoUrl } from '../api/portal';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';
import RateTripModal from '../components/RateTripModal';
import { CarIcon, CalendarIcon, ArrowRightIcon, StarIcon, WhatsAppIcon, KeyIcon, FlagIcon, AlertIcon, ClockIcon, RouteIcon, CheckIcon } from '../components/icons';
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

// Coloured edge on each card, by status.
const ACCENTS = {
  'Yet to Start': 'before:bg-primary',
  'On Trip': 'before:bg-accent',
  Completed: 'before:bg-emerald-500',
  Cancelled: 'before:bg-red-400',
};

const DAY_MS = 24 * 60 * 60 * 1000;

// A trip date (stored as midnight UTC) + 'HH:mm' as a local Date.
function tripInstant(date, time) {
  if (!date) return null;
  const d = new Date(`${String(new Date(date).toISOString()).slice(0, 10)}T${time || '00:00'}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// "2 days 4 hrs" between the trip's start and end.
function tripLength(trip) {
  const start = tripInstant(trip.startDate, trip.startTime);
  const end = tripInstant(trip.endDate, trip.endTime || trip.startTime);
  if (!start || !end || end <= start) return '';
  const days = Math.floor((end - start) / DAY_MS);
  const hours = Math.round((end - start - days * DAY_MS) / (60 * 60 * 1000));
  return [days && `${days} day${days === 1 ? '' : 's'}`, hours && `${hours} hr${hours === 1 ? '' : 's'}`].filter(Boolean).join(' ');
}

// "Starts today" / "Starts in 3 days" / "Ends tomorrow" for the trip in the spotlight.
function countdown(trip) {
  const ongoing = trip.status === 'On Trip';
  const at = ongoing ? tripInstant(trip.endDate, trip.endTime) : tripInstant(trip.startDate, trip.startTime);
  if (!at) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(at);
  day.setHours(0, 0, 0, 0);
  const days = Math.round((day - today) / DAY_MS);
  const verb = ongoing ? 'Ends' : 'Starts';
  if (days < 0) return ongoing ? 'Return due' : 'Pickup due';
  const time = ongoing ? trip.endTime : trip.startTime;
  if (days === 0) return `${verb} today${time ? `, ${formatTime(time)}` : ''}`;
  if (days === 1) return `${verb} tomorrow`;
  return `${verb} in ${days} days`;
}

function CarThumb({ vehicle, className = '' }) {
  const photo = vehicle?.photos?.[0];
  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ${className}`}>
      {photo ? (
        <img src={vehiclePhotoUrl(photo._id)} alt={vehicleName(vehicle)} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <CarIcon className="h-10 w-10 text-slate-400" />
        </span>
      )}
    </div>
  );
}

// Pick-up -> return, with the trip length in the middle.
function Timeline({ trip, dark = false }) {
  const muted = dark ? 'text-primary-100/70' : 'text-slate-400';
  const strong = dark ? 'text-white' : 'text-slate-900';
  const sub = dark ? 'text-primary-100' : 'text-slate-500';
  const length = tripLength(trip);
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="min-w-0">
        <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${muted}`}>Pick-up</p>
        <p className={`truncate text-sm font-bold ${strong}`}>{formatDate(trip.startDate)}</p>
        <p className={`text-xs ${sub}`}>{formatTime(trip.startTime) || '—'}</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className={`flex items-center gap-1 ${dark ? 'text-primary-200' : 'text-slate-300'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="h-px w-8 bg-current sm:w-12" />
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
        {length && <span className={`whitespace-nowrap text-[0.65rem] font-semibold ${sub}`}>{length}</span>}
      </div>
      <div className="min-w-0 text-right">
        <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${muted}`}>Return</p>
        <p className={`truncate text-sm font-bold ${strong}`}>{formatDate(trip.endDate)}</p>
        <p className={`text-xs ${sub}`}>{formatTime(trip.endTime) || '—'}</p>
      </div>
    </div>
  );
}

function ActionButton({ trip, verified, onStart }) {
  const navigate = useNavigate();
  if (trip.status === 'Yet to Start') {
    return (
      <button
        onClick={() => onStart(trip)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-accent/25 transition-colors hover:bg-accent-600"
        title={verified ? 'Enter the start OTP from our team' : 'Verify your profile first'}
      >
        <KeyIcon className="h-4 w-4" /> Start Trip
      </button>
    );
  }
  if (trip.status === 'On Trip') {
    return (
      <button
        onClick={() => navigate(`/trips/${trip._id}/end`)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-accent/25 transition-colors hover:bg-accent-600"
      >
        <FlagIcon className="h-4 w-4" /> End Trip
      </button>
    );
  }
  return null;
}

// The trip that matters right now: the ongoing one, or else the next upcoming one.
function Spotlight({ trip, verified, onStart }) {
  const ongoing = trip.status === 'On Trip';
  return (
    <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4 text-white shadow-xl shadow-primary/20 sm:p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,17rem)_1fr] md:items-center">
        <CarThumb vehicle={trip.vehicle} className="ring-4 ring-white/10" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${ongoing ? 'bg-accent text-primary' : 'bg-white/15 text-white'}`}>
              {ongoing ? <RouteIcon className="h-3.5 w-3.5" /> : <ClockIcon className="h-3.5 w-3.5" />}
              {ongoing ? 'On the road' : 'Next trip'}
            </span>
            <span className="text-sm font-semibold text-primary-100">{countdown(trip)}</span>
          </div>
          <h2 className="mt-3 truncate text-xl font-extrabold sm:text-2xl">
            {vehicleName(trip.vehicle) || 'Your car'} {trip.vehicle?.year && <span className="font-semibold text-primary-200">{trip.vehicle.year}</span>}
          </h2>
          <p className="font-mono text-xs tracking-wide text-primary-200">{trip.tripId}</p>
          <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <Timeline trip={trip} dark />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ActionButton trip={trip} verified={verified} onStart={onStart} />
            <p className="text-xs text-primary-100">
              {ongoing
                ? 'When you hand the car back, ask our team for the end OTP.'
                : verified
                  ? 'At pick-up, ask our team for the start OTP.'
                  : 'Verify your profile before pick-up to start this trip.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TripCard({ trip, verified, onStart, onRate }) {
  const due = Math.max((Number(trip.amount) || 0) - (Number(trip.advance) || 0), 0);
  const priced = Number(trip.amount) > 0 || trip.status !== 'Yet to Start';

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow before:absolute before:inset-y-0 before:left-0 before:w-1 hover:shadow-md ${
        ACCENTS[trip.status] || 'before:bg-slate-300'
      }`}
    >
      <div className="flex gap-3 p-3 pl-4 sm:gap-4 sm:p-4 sm:pl-5">
        <CarThumb vehicle={trip.vehicle} className="w-28 flex-shrink-0 sm:w-36" />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-extrabold leading-snug text-primary">
                {vehicleName(trip.vehicle) || 'Car'} {trip.vehicle?.year && <span className="font-medium text-slate-400">{trip.vehicle.year}</span>}
              </p>
              <p className="font-mono text-[0.7rem] font-semibold tracking-wide text-slate-400">{trip.tripId}</p>
            </div>
            <StatusChip status={trip.status} />
          </div>
          <div className="mt-auto pt-3">
            <Timeline trip={trip} />
          </div>
        </div>
      </div>

      {trip.status === 'Completed' && (
        <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-xl bg-amber-50/70 px-4 py-2.5 sm:mx-5">
          {trip.customerRatedAt ? (
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-semibold">Your rating</span>
              <span className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} className={`h-4 w-4 ${n <= trip.rating ? 'text-accent' : 'text-slate-200'}`} />
                ))}
              </span>
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-amber-900">How was your trip?</p>
              <button
                onClick={() => onRate(trip)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-primary hover:bg-accent-600"
              >
                <StarIcon className="h-4 w-4" /> Rate trip
              </button>
            </>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
          <span className="text-slate-500">
            Total <span className="font-extrabold text-slate-900">{priced ? formatMoney(trip.amount) : 'To be confirmed'}</span>
          </span>
          {Number(trip.advance) > 0 && trip.status !== 'Cancelled' && (
            <span className="text-slate-500">
              Due <span className="font-bold text-slate-900">{formatMoney(due)}</span>
            </span>
          )}
          {Number(trip.couponDiscount) > 0 && (
            <span className="text-xs font-semibold text-emerald-700">
              {trip.couponCode} saved {formatMoney(trip.couponDiscount)}
            </span>
          )}
          {trip.status === 'Cancelled' && Number(trip.refundAmount) > 0 && (
            <span className="text-slate-500">
              Refund <span className="font-bold text-emerald-700">{formatMoney(trip.refundAmount)}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={whatsappLink(`Hi Roam Wheels! I have a question about my trip ${trip.tripId}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-accent-600 hover:underline"
          >
            <WhatsAppIcon className="h-4 w-4" /> Help
          </a>
          <ActionButton trip={trip} verified={verified} onStart={onStart} />
        </div>
      </div>
    </article>
  );
}

// Phones: icon above the number, centred (three side by side don't fit in a row). Bigger screens: side by side.
function Stat({ icon: Icon, value, label, tone }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-2xl bg-white px-2 py-3 text-center shadow-sm ring-1 ring-slate-200 sm:flex-row sm:gap-3 sm:px-4 sm:text-left">
      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-extrabold leading-none text-slate-900">{value}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Set by the end-trip page: open the rating pop-up for that trip as soon as the trips load.
  const rateTripId = location.state?.rateTripId;
  const { customer } = useAuth();
  const [trips, setTrips] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('all');
  const [rating, setRating] = useState(null);

  useEffect(() => {
    if (!rateTripId || !trips) return;
    const ended = trips.find((t) => t._id === rateTripId);
    if (ended?.status === 'Completed' && !ended.customerRatedAt) setRating(ended);
    // Only once — not again on refresh or when coming back to this page.
    navigate(location.pathname, { replace: true, state: null });
  }, [rateTripId, trips, navigate, location.pathname]);

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
  const list = trips || [];
  const hasUpcoming = list.some((t) => t.status === 'Yet to Start');
  const countFor = (key) => list.filter((t) => key === 'all' || t.status === key).length;
  const visible = list.filter((t) => tab === 'all' || t.status === tab);

  // Ongoing trip first, otherwise the soonest upcoming one.
  const upcoming = list
    .filter((t) => t.status === 'Yet to Start')
    .sort((a, b) => (tripInstant(a.startDate, a.startTime) || 0) - (tripInstant(b.startDate, b.startTime) || 0));
  const spotlight = list.find((t) => t.status === 'On Trip') || upcoming[0] || null;

  // Verified -> the OTP page. Not verified (yet) -> the documents page, with a note saying why.
  function handleStart(trip) {
    if (verified) {
      navigate(`/trips/${trip._id}/start`);
      return;
    }
    toast(summary ? verificationMessage(summary) : 'Please verify your profile to start your trip.', { icon: '🪪', duration: 5000 });
    navigate(`/documents?trip=${trip._id}`);
  }

  const firstName = customer?.name?.trim().split(/\s+/)[0];

  return (
    <div className="bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-600">{firstName ? `Hi ${firstName},` : 'Welcome back,'}</p>
            <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">My Trips</h1>
          </div>
          {BOOKING_ENABLED ? (
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-accent/20 hover:bg-accent-600"
            >
              <CalendarIcon className="h-4 w-4" /> Book a Car
            </Link>
          ) : (
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <CarIcon className="h-4 w-4" /> Browse cars
            </Link>
          )}
        </div>

        {trips && list.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat icon={ClockIcon} value={countFor('Yet to Start')} label="Upcoming" tone="bg-accent-50 text-accent-600" />
            <Stat icon={RouteIcon} value={countFor('On Trip')} label="Ongoing" tone="bg-amber-50 text-amber-600" />
            <Stat icon={CheckIcon} value={countFor('Completed')} label="Completed" tone="bg-emerald-50 text-emerald-600" />
          </div>
        )}

        {summary && !verified && hasUpcoming && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <AlertIcon className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
              {verificationMessage(summary)}
            </p>
            <Link to="/documents" className="flex-shrink-0 font-bold underline">
              {summary.missing.length || summary.rejected.length ? 'Upload documents' : 'View status'}
            </Link>
          </div>
        )}

        {spotlight && <Spotlight trip={spotlight} verified={verified} onStart={handleStart} />}

        <div className="no-scrollbar -mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  tab === t.key ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
                {trips && <span className={`ml-1.5 text-xs ${tab === t.key ? 'text-primary-200' : 'text-slate-400'}`}>{countFor(t.key)}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          {trips === null ? (
            [0, 1].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-white" />)
          ) : visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center lg:col-span-2">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-50">
                <CarIcon className="h-8 w-8 text-accent-600" />
              </span>
              <p className="mt-4 text-lg font-bold text-slate-800">{tab === 'all' ? 'No trips yet' : 'No trips here'}</p>
              <p className="mt-1 text-sm text-slate-500">Your bookings with Roam Wheels will show up here.</p>
              <Link
                to={BOOKING_ENABLED ? '/book' : '/cars'}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
              >
                {BOOKING_ENABLED ? 'Book your first ride' : 'Browse our cars'} <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            visible.map((t) => <TripCard key={t._id} trip={t} verified={verified} onStart={handleStart} onRate={setRating} />)
          )}
        </div>
      </div>

      {rating && (
        <RateTripModal
          trip={rating}
          onClose={() => setRating(null)}
          onRated={(updated) => {
            setTrips((all) => all.map((t) => (t._id === updated._id ? updated : t)));
            setRating(null);
          }}
        />
      )}
    </div>
  );
}
