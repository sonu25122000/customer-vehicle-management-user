import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from './icons';

// Our own calendar instead of <input type="date">: iPhone Safari's native picker ignores `min`, so
// customers could pick a past pick-up or a return before the pick-up. Here the days before `min` are
// greyed out and can't be tapped, on every device. Values are "YYYY-MM-DD" strings, like the native input.
// On phones it opens as a bottom sheet; on bigger screens as a pop-over under the field.

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const POPOVER_WIDTH = 304;
const POPOVER_HEIGHT = 350;

const pad = (n) => String(n).padStart(2, '0');
const toIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parse(value) {
  const [y, m, d] = value.split('-').map(Number);
  return { y, m: m - 1, d };
}

function todayIso() {
  const t = new Date();
  return toIso(t.getFullYear(), t.getMonth(), t.getDate());
}

function displayDate(value) {
  if (!value) return 'Select date';
  const { y, m, d } = parse(value);
  const date = new Date(y, m, d);
  const weekday = date.toLocaleDateString('en-IN', { weekday: 'short' });
  const month = date.toLocaleDateString('en-IN', { month: 'short' });
  return `${weekday}, ${d} ${month} ${y}`;
}

function Calendar({ value, min, rangeStart, onPick }) {
  const start = parse(value || min || todayIso());
  const [view, setView] = useState({ y: start.y, m: start.m });
  const today = todayIso();

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const prevDisabled = Boolean(min) && toIso(view.y, view.m, 1) <= `${min.slice(0, 8)}01`;
  const monthName = new Date(view.y, view.m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const shift = (delta) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={prevDisabled}
          aria-label="Previous month"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <p className="text-sm font-bold text-primary">{monthName}</p>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-slate-100"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[0.7rem] font-bold uppercase text-slate-400">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;
          const iso = toIso(view.y, view.m, day);
          const disabled = Boolean(min) && iso < min;
          const selected = iso === value;
          const inRange = Boolean(rangeStart) && Boolean(value) && iso > rangeStart && iso < value;
          const isRangeStart = Boolean(rangeStart) && iso === rangeStart;
          return (
            <span key={iso} className={`flex justify-center ${inRange ? 'bg-accent-50' : ''}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(iso)}
                aria-label={displayDate(iso)}
                aria-pressed={selected}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  selected
                    ? 'bg-accent text-primary shadow-md shadow-accent/30'
                    : disabled
                      ? 'cursor-not-allowed text-slate-300 line-through decoration-slate-300'
                      : isRangeStart
                        ? 'cursor-pointer bg-primary text-white'
                        : 'cursor-pointer text-slate-800 hover:bg-accent-50'
                }`}
              >
                {day}
                {iso === today && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function DatePicker({ value, min, rangeStart, onChange, label = 'Date', className = '' }) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState(null); // { sheet: true } or { sheet: false, top, left }
  const button = useRef(null);

  function place() {
    const r = button.current.getBoundingClientRect();
    if (window.innerWidth < 640) return setLayout({ sheet: true });
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POPOVER_WIDTH - 8));
    const below = r.bottom + 6;
    const top = below + POPOVER_HEIGHT > window.innerHeight && r.top - POPOVER_HEIGHT - 6 > 0 ? r.top - POPOVER_HEIGHT - 6 : below;
    return setLayout({ sheet: false, top, left });
  }

  // While open: Escape closes, the pop-over follows the field when the page scrolls, and the page
  // behind a bottom sheet doesn't scroll.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onScroll = () => place();
    const onResize = () => setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    const previous = document.body.style.overflow;
    if (layout?.sheet) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = previous;
    };
  }, [open, layout?.sheet]);

  function pick(iso) {
    onChange(iso);
    setOpen(false);
    button.current?.focus();
  }

  const calendar = <Calendar value={value} min={min} rangeStart={rangeStart} onPick={pick} />;

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={`${label}: ${displayDate(value)}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          place();
          setOpen(true);
        }}
        className={`flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border bg-white py-2.5 pl-3 pr-2 text-left text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-100 ${
          open ? 'border-accent ring-2 ring-accent-100' : 'border-slate-300'
        } ${className}`}
      >
        <CalendarIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span className="truncate">{displayDate(value)}</span>
      </button>

      {open &&
        layout &&
        createPortal(
          layout.sheet ? (
            <div className="fixed inset-0 z-[60] flex items-end bg-primary-dark/50" onClick={() => setOpen(false)}>
              <div
                role="dialog"
                aria-modal="true"
                aria-label={label}
                onClick={(e) => e.stopPropagation()}
                className="animate-sheet-up w-full rounded-t-3xl bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
              >
                <span className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-slate-200" />
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-base font-bold text-primary">{label}</p>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="mx-auto max-w-sm">{calendar}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
              <div
                role="dialog"
                aria-label={label}
                style={{ top: layout.top, left: layout.left, width: POPOVER_WIDTH }}
                className="fixed z-[61] rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-slate-200"
              >
                {calendar}
              </div>
            </>
          ),
          document.body
        )}
    </>
  );
}
