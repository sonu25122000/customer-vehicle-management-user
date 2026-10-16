import { useTripDates, durationText } from '../utils/tripDates';
import { whatsappLink } from '../utils/contact';
import { formatDate, formatTime, isoDate } from '../utils/format';
import { TIME_OPTIONS, startTimeOptions, endTimeOptions } from '../utils/timeOptions';
import { trackEvent } from '../utils/analytics';
import { CITIES, DEFAULT_CITY } from '../utils/site';
import { ClockIcon, MapPinIcon, WhatsAppIcon } from './icons';
import DatePicker from './DatePicker';

function enquiryMessage(dates, carName) {
  const when = `from ${formatDate(dates.startDate)}, ${formatTime(dates.startTime)} to ${formatDate(dates.endDate)}, ${formatTime(dates.endTime)}`;
  const duration = durationText(dates);
  return `Hi Roam Wheels! I'd like to rent ${carName ? `the ${carName}` : 'a car'} in ${DEFAULT_CITY} ${when}${duration ? ` (${duration})` : ''}. Is it available?`;
}

function nextDay(date) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// The city we rent cars in — just Bengaluru for now (utils/site.js).
function CityField() {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-bold text-primary">City</span>
      <span className="relative">
        <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-600" />
        <select
          value={DEFAULT_CITY}
          onChange={() => {}}
          aria-label="City"
          className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-accent focus:ring-2 focus:ring-accent-100"
        >
          {CITIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </span>
    </label>
  );
}

function DateTimeField({ label, date, time, minDate, rangeStart, allowedTimes, onDate, onTime }) {
  const allowed = new Set(allowedTimes.map((t) => t.value));
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-bold text-primary">{label}</span>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <DatePicker value={date} min={minDate} rangeStart={rangeStart} onChange={onDate} label={`${label} date`} />
        <label className="relative">
          <span className="sr-only">{label} time</span>
          <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={time}
            onChange={(e) => onTime(e.target.value)}
            className="w-full min-w-[7.75rem] cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-2 text-sm font-semibold text-slate-800 outline-none focus:border-accent focus:ring-2 focus:ring-accent-100"
          >
            {/* Slots that can't be picked (already passed, or not after the pick-up) stay visible, greyed out. */}
            {TIME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value} disabled={!allowed.has(t.value)}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

// Pick-up and return date + time, then "Book Now", which opens WhatsApp with those dates (and the car, if given)
// written into the message. `compact` stacks everything for narrow spots (car page sidebar, modal);
// `showCity` adds the city picker in front (home page).
export default function EnquiryBar({ carName = '', compact = false, showCity = false, className = '' }) {
  const [dates, setDates] = useTripDates();
  const duration = durationText(dates);
  const startSlots = startTimeOptions(dates.startDate);
  const startOk = startSlots.some((t) => t.value === dates.startTime);
  const valid = startOk && Boolean(duration);

  function set(field, value) {
    setDates((prev) => {
      const next = { ...prev, [field]: value };
      // Typed-in dates skip the date picker's min, so clamp: no pick-up in the past…
      if (!next.startDate || next.startDate < isoDate(0)) next.startDate = isoDate(0);
      // …and no pick-up time that has already passed (late at night that means tomorrow).
      if (field.startsWith('start') && !startTimeOptions(next.startDate).some((t) => t.value === next.startTime)) {
        const slots = startTimeOptions(next.startDate);
        if (slots.length) next.startTime = slots[0].value;
        else next.startDate = nextDay(next.startDate);
      }
      // The return can't be before the pick-up date, and on the same day has to be after the pick-up time.
      const returnOk = next.endDate >= next.startDate && endTimeOptions(next).some((t) => t.value === next.endTime);
      if (!returnOk) {
        if (field.startsWith('end')) {
          // They picked a return before the pick-up: the pick-up day, at the first slot after the pick-up time.
          if (!next.endDate || next.endDate < next.startDate) next.endDate = next.startDate;
          const slots = endTimeOptions(next);
          if (slots.length && !slots.some((t) => t.value === next.endTime)) next.endTime = slots[0].value;
          else if (!slots.length) {
            next.endDate = nextDay(next.startDate);
            next.endTime = next.startTime;
          }
        } else {
          // The pick-up moved past the return: return a day after the pick-up, same time.
          next.endDate = nextDay(next.startDate);
          next.endTime = next.startTime;
        }
      }
      return next;
    });
  }

  return (
    <div className={className}>
      <div
        className={`grid gap-4 ${
          compact
            ? 'grid-cols-1'
            : showCity
              ? 'grid-cols-1 md:grid-cols-2 md:items-end xl:grid-cols-[10.5rem_1fr_1fr_auto]'
              : 'grid-cols-1 md:grid-cols-[1fr_1fr_auto] md:items-end'
        }`}
      >
        {showCity && <CityField />}
        <DateTimeField
          label="Pick-Up"
          date={dates.startDate}
          time={dates.startTime}
          // Today only while it still has a pick-up slot left (late at night the earliest is tomorrow).
          minDate={startTimeOptions(isoDate(0)).length ? isoDate(0) : isoDate(1)}
          allowedTimes={startSlots}
          onDate={(v) => set('startDate', v)}
          onTime={(v) => set('startTime', v)}
        />
        <DateTimeField
          label="Return"
          date={dates.endDate}
          time={dates.endTime}
          minDate={dates.startDate}
          rangeStart={dates.startDate}
          allowedTimes={endTimeOptions(dates)}
          onDate={(v) => set('endDate', v)}
          onTime={(v) => set('endTime', v)}
        />
        <a
          href={valid ? whatsappLink(enquiryMessage(dates, carName)) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!valid}
          onClick={(e) => {
            if (!valid) e.preventDefault();
            else trackEvent('whatsapp_enquiry', { car: carName || 'any', days: duration });
          }}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold shadow-lg transition-colors ${
            valid ? 'bg-accent text-primary shadow-accent/30 hover:bg-accent-600' : 'cursor-not-allowed bg-slate-300 text-slate-600 shadow-none'
          }`}
        >
          <WhatsAppIcon className="h-5 w-5" /> Book Now
        </a>
      </div>
      <p className={`mt-2.5 text-xs font-semibold ${valid ? 'text-slate-600' : 'text-red-600'}`}>
        {valid
          ? `Duration: ${duration}`
          : !startOk
            ? 'That pick-up time has passed — please choose a later time.'
            : 'The return has to be after the pick-up.'}
      </p>
    </div>
  );
}
