import { formatMoney } from '../utils/format';

// A car's hourly and daily rates, in the site's two brand colours: hourly in orange, daily in navy.
// `dark` is for a navy background (the car page's price panel): hourly stays orange, daily turns white.
export default function CarPrice({ car, dark = false, className = '' }) {
  const rates = [
    car.pricePerHour && { value: car.pricePerHour, unit: '/hr', tone: dark ? 'text-accent' : 'text-accent-600' },
    car.pricePerDay && { value: car.pricePerDay, unit: '/day', tone: dark ? 'text-white' : 'text-primary' },
  ].filter(Boolean);

  if (!rates.length) {
    return <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-500'} ${className}`}>Click on Book Now for price</p>;
  }
  return (
    <div className={`flex flex-wrap items-baseline gap-y-1 ${className}`}>
      {rates.map((r, i) => (
        // "₹99/hr" on one line — the unit right after the price, a little smaller.
        <p
          key={r.unit}
          className={`whitespace-nowrap leading-none ${r.tone} ${i ? `ml-3 border-l pl-3 ${dark ? 'border-white/20' : 'border-slate-200'}` : ''}`}
        >
          <span className="text-xl font-extrabold">{formatMoney(r.value)}</span>
          <span className="text-sm font-semibold">{r.unit}</span>
        </p>
      ))}
    </div>
  );
}
