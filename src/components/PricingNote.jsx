import { ShieldCheckIcon, ChevronDownIcon } from './icons';

// What the price covers and what's extra — for guests who haven't rented a self-drive car before. Same
// facts as the FAQ. Collapsed to one line by default; `open` shows the details straight away.
const POINTS = [
  { title: 'The price shown', text: 'is the rental for the car and the time you book (per hour or per day). Longer bookings can get a better rate.' },
  { title: 'Included', text: 'zero security deposit, no kilometre limit, and 2 extra hours free when you return the car.' },
  { title: 'You pay during the trip', text: 'fuel, tolls and FASTag charges.' },
  { title: 'May be added', text: 'a small advance to confirm your booking, a convenience fee, trip protection fee, or optional doorstep delivery.' },
  { title: 'Before you pay', text: 'we share the full amount with you on WhatsApp — no surprises.' },
];

export default function PricingNote({ open = false, className = '' }) {
  return (
    <details open={open} className={`group rounded-xl bg-emerald-50/70 text-sm ring-1 ring-emerald-100 ${className}`}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 font-semibold text-emerald-800 [&::-webkit-details-marker]:hidden">
        <ShieldCheckIcon className="h-4.5 w-4.5 flex-shrink-0" />
        <span className="flex-1">Transparent pricing — no hidden charges</span>
        <span className="text-xs font-medium text-emerald-700 group-open:hidden">What&apos;s included?</span>
        <ChevronDownIcon className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="flex flex-col gap-1.5 px-3.5 pb-3 pl-10 text-xs leading-relaxed text-slate-700">
        {POINTS.map((p) => (
          <li key={p.title} className="list-disc">
            <span className="font-semibold text-slate-900">{p.title}:</span> {p.text}
          </li>
        ))}
      </ul>
    </details>
  );
}
