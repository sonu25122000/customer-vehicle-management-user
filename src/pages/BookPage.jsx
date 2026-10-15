import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchVehicles, fetchProfile, createBooking } from '../api/portal';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Carousel from '../components/Carousel';
import { inputClass, labelClass } from '../components/ProfileForm';
import { WhatsAppButton } from '../components/WhatsAppButton';
import {
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CarIcon,
  FuelIcon,
  GearIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  AlertIcon,
} from '../components/icons';
import { TIME_OPTIONS } from '../utils/timeOptions';
import { formatDate, formatMoney, formatTime, isoDate, rentalDays, vehicleName } from '../utils/format';
import { DOCUMENTS } from '../utils/documents';

const STEPS = ['Your Details', 'Trip Dates', 'Choose Car', 'Confirm'];

function Stepper({ step }) {
  return (
    <>
      <ol className="flex items-center">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  done ? 'bg-blue-600 text-white' : active ? 'bg-navy text-white ring-4 ring-blue-100' : 'bg-white text-slate-400 ring-1 ring-slate-300'
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`hidden text-xs font-semibold sm:block ${active || done ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`mx-2 mb-0 h-0.5 flex-1 rounded sm:mb-5 ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </li>
        );
      })}
      </ol>
      {/* Step names are hidden under the circles on phones, so name the current one here. */}
      <p className="mt-3 text-center text-sm font-semibold text-slate-900 sm:hidden">
        Step {step + 1} of {STEPS.length} <span className="mx-1 text-slate-300">·</span> {STEPS[step]}
      </p>
    </>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

// `sticky`: on phones the bar stays pinned to the bottom of the screen (used under the long car list),
// bleeding to the edges of the surrounding card (p-5).
function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled, loading, sticky }) {
  return (
    <div
      className={`mt-6 flex items-center justify-between gap-3 ${
        sticky
          ? 'sticky bottom-0 z-10 -mx-5 -mb-5 rounded-b-2xl border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none'
          : ''
      }`}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        type={onNext ? 'button' : 'submit'}
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:py-2.5"
      >
        {loading ? 'Please wait...' : nextLabel} {!loading && <ArrowRightIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

// Half-hour slots; on today's date only slots at least 30 minutes from now.
function startTimeOptions(date) {
  if (date !== isoDate(0)) return TIME_OPTIONS;
  const now = new Date();
  const minMinutes = now.getHours() * 60 + now.getMinutes() + 30;
  return TIME_OPTIONS.filter((t) => {
    const [h, m] = t.value.split(':').map(Number);
    return h * 60 + m >= minMinutes;
  });
}

function DatesStep({ dates, setDates, onBack, onNext }) {
  const startOptions = startTimeOptions(dates.startDate);
  const endOptions = dates.endDate === dates.startDate ? TIME_OPTIONS.filter((t) => t.value > dates.startTime) : TIME_OPTIONS;
  const days = rentalDays(dates.startDate, dates.startTime, dates.endDate, dates.endTime);

  function set(field, value) {
    setDates((d) => {
      const next = { ...d, [field]: value };
      if (field === 'startDate' && next.endDate < value) next.endDate = value;
      return next;
    });
  }

  function handleNext() {
    if (!dates.startTime || !startOptions.some((t) => t.value === dates.startTime)) {
      toast.error('Pick a start time in the future');
      return;
    }
    if (!days) {
      toast.error('The end must be after the start');
      return;
    }
    onNext();
  }

  return (
    <Card title="When do you need the car?" subtitle="Pick your pickup and drop-off date and time.">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
          <legend className="sr-only">Start</legend>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CalendarIcon className="h-4 w-4 text-blue-600" /> Start
          </p>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Start Date</span>
            <input type="date" className={inputClass} min={isoDate(0)} value={dates.startDate} onChange={(e) => set('startDate', e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Start Time</span>
            <select className={inputClass} value={dates.startTime} onChange={(e) => set('startTime', e.target.value)}>
              <option value="">Select time</option>
              {startOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
        <fieldset className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
          <legend className="sr-only">End</legend>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CalendarIcon className="h-4 w-4 text-blue-600" /> End
          </p>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>End Date</span>
            <input type="date" className={inputClass} min={dates.startDate || isoDate(0)} value={dates.endDate} onChange={(e) => set('endDate', e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>End Time</span>
            <select className={inputClass} value={dates.endTime} onChange={(e) => set('endTime', e.target.value)}>
              <option value="">Select time</option>
              {endOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>
      {days > 0 && (
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
          Rental duration: <span className="font-bold">{days} day{days === 1 ? '' : 's'}</span>
        </p>
      )}
      <NavButtons onBack={onBack} onNext={handleNext} nextLabel="Find Cars" />
    </Card>
  );
}

function Spec({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}

function CarsStep({ dates, selected, onSelect, onBack, onNext }) {
  const [vehicles, setVehicles] = useState(null);
  const days = rentalDays(dates.startDate, dates.startTime, dates.endDate, dates.endTime);

  // This step only mounts once the dates are chosen, so they can't change while it's showing.
  useEffect(() => {
    fetchVehicles({ startDate: dates.startDate, endDate: dates.endDate })
      .then(setVehicles)
      .catch((err) => {
        toast.error(errorMessage(err, 'Could not load cars'));
        setVehicles([]);
      });
  }, [dates.startDate, dates.endDate]);

  return (
    <Card
      title="Choose your car"
      subtitle={`Available from ${formatDate(dates.startDate)} ${formatTime(dates.startTime)} to ${formatDate(dates.endDate)} ${formatTime(dates.endTime)}`}
    >
      {vehicles === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <CarIcon className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No cars available for these dates</p>
          <p className="mt-1 text-sm text-slate-500">Try different dates, or message us and we&apos;ll help.</p>
          <WhatsAppButton className="mt-5" message={`Hi Roam Wheels! I'm looking for a car from ${dates.startDate} to ${dates.endDate}.`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => {
            const isSelected = selected?._id === v._id;
            return (
              // A div, not a <button>: the carousel inside has its own buttons.
              <div
                key={v._id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onSelect(v)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelect(v);
                  }
                }}
                className={`cursor-pointer overflow-hidden rounded-xl border-2 bg-white text-left outline-none transition-all focus-visible:ring-4 focus-visible:ring-blue-200 ${
                  isSelected ? 'border-blue-600 shadow-lg shadow-blue-600/15' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="relative">
                  <Carousel photos={v.photos} alt={vehicleName(v)} />
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{v.model}</p>
                      <p className="truncate text-xs text-slate-500">
                        {v.make} · {v.year}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {v.pricePerDay ? (
                        <>
                          <p className="font-extrabold text-slate-900">{formatMoney(v.pricePerDay)}</p>
                          <p className="text-[0.7rem] text-slate-500">per day</p>
                        </>
                      ) : (
                        <p className="text-xs font-semibold text-slate-500">Price on request</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                    <Spec icon={CarIcon}>{v.vehicleType}</Spec>
                    <Spec icon={GearIcon}>{v.transmission}</Spec>
                    <Spec icon={FuelIcon}>{v.fuel}</Spec>
                  </div>
                  {v.pricePerDay > 0 && (
                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {days} day{days === 1 ? '' : 's'} total: <span className="font-bold text-slate-900">{formatMoney(days * v.pricePerDay)}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!selected} nextLabel="Review Booking" sticky />
    </Card>
  );
}

function SummaryRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{children}</span>
    </div>
  );
}

function ConfirmStep({ customer, profile, vehicle, dates, onBack, onConfirm, submitting }) {
  const days = rentalDays(dates.startDate, dates.startTime, dates.endDate, dates.endTime);
  const total = vehicle.pricePerDay ? days * vehicle.pricePerDay : 0;
  const onFile = profile?.documents?.map((d) => d.type) || [];
  const missingDocs = DOCUMENTS.filter((d) => !onFile.includes(d.type));

  return (
    // Phone/tablet: one column. Desktop: details on the left, price summary + Confirm button in a sticky sidebar.
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="flex flex-col gap-5">
          {/* Profile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your profile</h2>
              <p className="mt-0.5 text-sm text-slate-500">Booking will be made under these details.</p>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: UserIcon, label: 'Name', value: customer.name },
                { icon: PhoneIcon, label: 'Mobile', value: `+91 ${customer.mobile1}` },
                { icon: MailIcon, label: 'Email', value: customer.email || 'Not added', wide: true },
              ].map(({ icon: Icon, label, value, wide }) => (
                <div key={label} className={`flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ${wide ? 'sm:col-span-2' : ''}`}>
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="break-all text-sm font-semibold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {profile && profile.profileVerified !== 'Accepted' && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
                <AlertIcon className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
                <p>
                  {missingDocs.length
                    ? `Please upload your ${missingDocs.map((d) => d.label).join(', ')} before your trip starts — verification is required to start the trip. `
                    : 'Your documents are being reviewed. '}
                  <Link to="/profile" className="font-bold underline">
                    Go to profile
                  </Link>
                </p>
              </div>
            )}
          </div>


        {/* Car */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr]">
            <Carousel photos={vehicle.photos} alt={vehicleName(vehicle)} className="aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-56" />
            <div className="p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{vehicle.vehicleType}</p>
              <h2 className="text-xl font-extrabold text-slate-900">{vehicle.model}</h2>
              <p className="text-sm text-slate-500">
                {vehicle.make} · {vehicle.year}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[vehicle.vehicleCategory, vehicle.transmission, vehicle.fuel].filter(Boolean).map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-bold text-slate-900">Trip summary</h2>
        <div className="mt-2 divide-y divide-slate-100">
          <SummaryRow label="Start">
            {formatDate(dates.startDate)}, {formatTime(dates.startTime)}
          </SummaryRow>
          <SummaryRow label="End">
            {formatDate(dates.endDate)}, {formatTime(dates.endTime)}
          </SummaryRow>
          <SummaryRow label="Duration">
            {days} day{days === 1 ? '' : 's'}
          </SummaryRow>
          {vehicle.pricePerDay > 0 && (
            <SummaryRow label="Price">
              {formatMoney(vehicle.pricePerDay)} × {days}
            </SummaryRow>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-white">
          <span className="text-sm font-semibold text-blue-100">Total Amount</span>
          <span className="text-xl font-extrabold">{total ? formatMoney(total) : 'To be confirmed'}</span>
        </div>
        {!total && <p className="mt-2 text-xs text-slate-500">Our team will confirm the price for this car on WhatsApp.</p>}
        <NavButtons onBack={onBack} onNext={onConfirm} nextLabel="Confirm Booking" loading={submitting} />
      </aside>
    </div>
  );
}

export default function BookPage() {
  const { customer } = useAuth();
  const [step, setStep] = useState(0);
  const [dates, setDates] = useState({ startDate: isoDate(1), startTime: '10:00', endDate: isoDate(2), endTime: '10:00' });
  const [vehicle, setVehicle] = useState(null);
  const [profile, setProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const result = await createBooking({ vehicle: vehicle._id, ...dates });
      setBooked(result.data);
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(errorMessage(err, 'Booking failed'));
      // The car may have just been taken — send them back to pick again.
      if (err?.response?.status === 409) {
        setVehicle(null);
        setStep(2);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (booked) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Booking Confirmed!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your {vehicleName(booked.vehicle)} is booked from {formatDate(booked.startDate)} to {formatDate(booked.endDate)}.
        </p>
        <p className="mt-4 inline-block rounded-lg bg-slate-100 px-4 py-2 font-mono text-lg font-bold tracking-wider text-slate-800">{booked.tripId}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <WhatsAppButton
            label="Share on WhatsApp"
            message={`Hi Roam Wheels! I just booked trip ${booked.tripId} (${vehicleName(booked.vehicle)}, ${booked.startDate.slice(0, 10)} ${booked.startTime} to ${booked.endDate.slice(0, 10)} ${booked.endTime}).`}
          />
          <Link to="/trips" className="text-sm font-bold text-blue-600 hover:underline">
            View My Trips →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Book a Car</h1>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
        <Stepper step={step} />
      </div>

      <div className="mt-5">
        {/* Profile details can't be edited while booking — the booking is made under them as they are. */}
        {step === 0 && (
          <Card title="Your details" subtitle="Your booking will be made under these details.">
            <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: UserIcon, label: 'Name', value: customer.name },
                { icon: PhoneIcon, label: 'Mobile', value: `+91 ${customer.mobile1}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="break-all text-sm font-semibold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">These details can&apos;t be changed while booking.</p>
            <NavButtons onNext={() => setStep(1)} />
          </Card>
        )}
        {step === 1 && (
          <DatesStep
            dates={dates}
            setDates={(update) => {
              // A car picked for other dates may not be free for the new ones.
              setDates(update);
              setVehicle(null);
            }}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <CarsStep
            dates={dates}
            selected={vehicle}
            onSelect={setVehicle}
            onBack={() => setStep(1)}
            onNext={() => vehicle && setStep(3)}
          />
        )}
        {step === 3 && vehicle && (
          <ConfirmStep
            customer={customer}
            profile={profile}
            vehicle={vehicle}
            dates={dates}
            onBack={() => setStep(2)}
            onConfirm={handleConfirm}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
