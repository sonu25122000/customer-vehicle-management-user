import { useTripDates, durationText } from '../utils/tripDates';
import { whatsappLink } from '../utils/contact';
import { formatDate, formatTime, isoDate } from '../utils/format';
import { TIME_OPTIONS } from '../utils/timeOptions';
import { trackEvent } from '../utils/analytics';
import { CalendarIcon, ClockIcon, WhatsAppIcon } from './icons';

function enquiryMessage(dates, carName) {
  const when = `from ${formatDate(dates.startDate)}, ${formatTime(dates.startTime)} to ${formatDate(dates.endDate)}, ${formatTime(dates.endTime)}`;
  const duration = durationText(dates);
  return `Hi Roam Wheels! I'd like to rent ${carName ? `the ${carName}` : 'a car'} ${when}${duration ? ` (${duration})` : ''}. Is it available?`;
}

function DateTimeField({ label, date, time, minDate, onDate, onTime }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-bold text-navy">{label}</span>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="relative">
          <span className="sr-only">{label} date</span>
          <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => onDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="relative">
          <span className="sr-only">{label} time</span>
          <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={time}
            onChange={(e) => onTime(e.target.value)}
            className="w-full min-w-[7.75rem] cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

// Pick-up and return date + time, then "Enquire on WhatsApp" with those dates (and the car, if given)
// written into the message. `compact` stacks everything for narrow spots (car page sidebar, modal).
export default function EnquiryBar({ carName = '', compact = false, className = '' }) {
  const [dates, setDates] = useTripDates();
  const duration = durationText(dates);
  const valid = Boolean(duration);

  function set(field, value) {
    setDates((prev) => {
      const next = { ...prev, [field]: value };
      // Keep the return after the pick-up when the pick-up moves past it.
      if (next.endDate < next.startDate || (next.endDate === next.startDate && next.endTime <= next.startTime)) {
        next.endDate = next.startDate;
        const later = TIME_OPTIONS.find((t) => t.value > next.startTime);
        if (later) next.endTime = later.value;
        else {
          const d = new Date(`${next.startDate}T00:00:00`);
          d.setDate(d.getDate() + 1);
          next.endDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
      return next;
    });
  }

  return (
    <div className={className}>
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-[1fr_1fr_auto] md:items-end'}`}>
        <DateTimeField
          label="Pick-Up"
          date={dates.startDate}
          time={dates.startTime}
          minDate={isoDate(0)}
          onDate={(v) => set('startDate', v)}
          onTime={(v) => set('startTime', v)}
        />
        <DateTimeField
          label="Return"
          date={dates.endDate}
          time={dates.endTime}
          minDate={dates.startDate}
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
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-lg transition-colors ${
            valid ? 'bg-navy shadow-navy/25 hover:bg-ink' : 'cursor-not-allowed bg-slate-400 shadow-none'
          }`}
        >
          <WhatsAppIcon className="h-5 w-5" /> Enquire on WhatsApp
        </a>
      </div>
      <p className={`mt-2.5 text-xs font-semibold ${valid ? 'text-slate-600' : 'text-red-600'}`}>
        {valid ? `Duration: ${duration}` : 'The return has to be after the pick-up.'}
      </p>
    </div>
  );
}
