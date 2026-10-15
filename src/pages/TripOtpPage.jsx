import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile, fetchTrip, submitTripOtp, vehiclePhotoUrl } from '../api/portal';
import { errorMessage } from '../api/client';
import { verificationMessage, verificationSummary } from '../utils/documents';
import { formatDate, formatTime, vehicleName } from '../utils/format';
import { ArrowLeftIcon, CarIcon, CheckIcon, KeyIcon, FlagIcon, WhatsAppIcon } from '../components/icons';
import { whatsappLink } from '../utils/contact';

const OTP_LENGTH = 6;

// Six single-digit boxes that behave like one field: typing moves forward, backspace moves back, and
// pasting a whole code fills every box.
function OtpInput({ value, onChange, disabled, autoFocus }) {
  const refs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '');

  function setAt(index, digit) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, OTP_LENGTH));
  }

  function handleChange(index, raw) {
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      setAt(index, '');
      return;
    }
    if (clean.length > 1) {
      // Pasted or autofilled several digits.
      const merged = (digits.slice(0, index).join('') + clean).slice(0, OTP_LENGTH);
      onChange(merged);
      refs.current[Math.min(merged.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    setAt(index, clean);
    if (index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      setAt(index - 1, '');
      refs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={OTP_LENGTH}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="h-13 w-11 rounded-xl border border-slate-300 bg-white text-center font-mono text-2xl font-bold text-slate-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 sm:h-14 sm:w-12"
        />
      ))}
    </div>
  );
}

// /trips/:id/start and /trips/:id/end — the customer enters the OTP our team shares at pickup / return.
export default function TripOtpPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isStart = mode === 'start';
  const [trip, setTrip] = useState(null);
  const [blocked, setBlocked] = useState(null); // redirect target when this step isn't possible
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchTrip(id), isStart ? fetchProfile() : null])
      .then(([t, profile]) => {
        if (cancelled) return;
        const neededStatus = isStart ? 'Yet to Start' : 'On Trip';
        if (t.status !== neededStatus) {
          toast.error(isStart ? 'This trip has already started or is closed.' : 'Only an ongoing trip can be ended.');
          setBlocked('/trips');
          return;
        }
        // Starting needs a verified profile — send them to finish verification first.
        if (profile && profile.profileVerified !== 'Accepted') {
          toast(verificationMessage(verificationSummary(profile)), { icon: '🪪', duration: 5000 });
          setBlocked(`/documents?trip=${t._id}`);
          return;
        }
        setTrip(t);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(errorMessage(err, 'Could not load this trip'));
        setBlocked('/trips');
      });
    return () => {
      cancelled = true;
    };
  }, [id, isStart]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter all ${OTP_LENGTH} digits`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitTripOtp(id, mode, otp);
      setDone(res);
    } catch (err) {
      if (err?.response?.data?.code === 'PROFILE_NOT_VERIFIED') {
        toast(err.response.data.message, { icon: '🪪', duration: 5000 });
        navigate(`/documents?trip=${id}`, { replace: true });
        return;
      }
      toast.error(errorMessage(err, 'That OTP did not work'));
      setOtp('');
    } finally {
      setSubmitting(false);
    }
  }

  if (blocked) return <Navigate to={blocked} replace />;

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-12 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{isStart ? 'Trip Started!' : 'Trip Completed!'}</h1>
        <p className="mt-2 text-sm text-slate-500">{done.message}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/trips"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
          >
            {isStart ? 'Go to My Trips' : 'Rate your ride in My Trips'}
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const photo = trip.vehicle?.photos?.[0];
  const Icon = isStart ? KeyIcon : FlagIcon;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6 sm:pt-10">
      <Link to="/trips" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600">
        <ArrowLeftIcon className="h-4 w-4" /> My Trips
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 p-4">
          <div className="aspect-[4/3] w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {photo ? (
              <img src={vehiclePhotoUrl(photo._id)} alt={vehicleName(trip.vehicle)} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <CarIcon className="h-8 w-8 text-slate-400" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">
              {vehicleName(trip.vehicle)} <span className="font-medium text-slate-500">{trip.vehicle?.year}</span>
            </p>
            <p className="font-mono text-xs font-semibold text-slate-500">{trip.tripId}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatDate(trip.startDate)} {formatTime(trip.startTime)} → {formatDate(trip.endDate)} {formatTime(trip.endTime)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/60">
            <Icon className="h-6 w-6" />
          </span>
          <div className="text-center">
            <h1 className="text-lg font-extrabold text-slate-900">{isStart ? 'Enter the start OTP' : 'Enter the end OTP'}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isStart
                ? 'Our team will share a 6-digit OTP when you pick up the car.'
                : 'Our team will share a 6-digit OTP when you return the car.'}
            </p>
          </div>
          <OtpInput value={otp} onChange={setOtp} disabled={submitting} autoFocus />
          <button
            type="submit"
            disabled={submitting || otp.length !== OTP_LENGTH}
            className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Checking...' : isStart ? 'Start Trip' : 'End Trip'}
          </button>
          <a
            href={whatsappLink(`Hi Roam Wheels! Please share the ${mode} OTP for my trip ${trip.tripId}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            <WhatsAppIcon className="h-4 w-4" /> Don&apos;t have the OTP? Ask us on WhatsApp
          </a>
        </form>
      </div>
    </div>
  );
}
