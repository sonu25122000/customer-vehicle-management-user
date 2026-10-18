import { formatMoney } from '../utils/format';

// A car's hourly and daily rates, in the site's two brand colours: hourly in orange, daily in navy.
// `dark` is for a navy background (the car page's price panel): hourly stays orange, daily turns white.
export default function CarPrice({ car, dark = false, className = '' }) {
  const rates = [
    car.pricePerHour && { value: car.pricePerHour, unit: 'per hour', tone: dark ? 'text-accent' : 'text-accent-600' },
    car.pricePerDay && { value: car.pricePerDay, unit: 'per day', tone: dark ? 'text-white' : 'text-primary' },
  ].filter(Boolean);

  if (!rates.length) {
    return <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-500'} ${className}`}>Price on request</p>;
  }
  return (
    <div className={`flex items-end ${className}`}>
      {rates.map((r, i) => (
        <div key={r.unit} className={i ? `ml-3 border-l pl-3 ${dark ? 'border-white/20' : 'border-slate-200'}` : ''}>
          <p className={`text-xl font-extrabold leading-none ${r.tone}`}>{formatMoney(r.value)}</p>
          <p className={`mt-1 text-[0.7rem] ${dark ? 'text-primary-100' : 'text-slate-500'}`}>{r.unit}</p>
        </div>
      ))}
    </div>
  );
}
