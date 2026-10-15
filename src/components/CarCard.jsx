import Carousel from './Carousel';
import { whatsappLink } from '../utils/contact';
import { formatMoney, vehicleName } from '../utils/format';
import { CarIcon, FuelIcon, GearIcon, StarIcon, WhatsAppIcon } from './icons';

function Spec({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}

// A car as shown to visitors (no login needed): photos, specs, price and customers' rating, with a
// WhatsApp enquiry instead of online booking.
export default function CarCard({ car }) {
  const name = `${vehicleName(car)} ${car.year || ''}`.trim();
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Carousel photos={car.photos} alt={vehicleName(car)} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{car.model}</p>
            <p className="truncate text-xs text-slate-500">
              {car.make} · {car.year}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            {car.pricePerDay ? (
              <>
                <p className="font-extrabold text-slate-900">{formatMoney(car.pricePerDay)}</p>
                <p className="text-[0.7rem] text-slate-500">per day</p>
              </>
            ) : (
              <p className="text-xs font-semibold text-slate-500">Price on request</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <Spec icon={CarIcon}>{car.vehicleCategory || car.vehicleType}</Spec>
          <Spec icon={GearIcon}>{car.transmission}</Spec>
          <Spec icon={FuelIcon}>{car.fuel}</Spec>
          {car.rating && (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <StarIcon className="h-3.5 w-3.5 text-amber-400" /> {car.rating.avg.toFixed(1)}
              <span className="font-normal text-slate-400">({car.rating.count})</span>
            </span>
          )}
        </div>
        <a
          href={whatsappLink(`Hi Roam Wheels! I'm interested in renting the ${name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700"
        >
          <WhatsAppIcon className="h-4 w-4" /> Enquire on WhatsApp
        </a>
      </div>
    </article>
  );
}
