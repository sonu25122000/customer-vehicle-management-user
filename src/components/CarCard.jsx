import { Link, useNavigate } from 'react-router-dom';
import Carousel from './Carousel';
import { openEnquiry } from './EnquiryModal';
import CarPrice from './CarPrice';
import CallButton from './CallButton';
import { vehicleName } from '../utils/format';
import { parkingArea } from '../utils/location';
import { CarIcon, FuelIcon, GearIcon, StarIcon, WhatsAppIcon, ArrowRightIcon, MapPinIcon, SparkIcon } from './icons';

function Spec({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <Icon className="h-4 w-4 text-slate-400" /> {children}
    </span>
  );
}

// Guests' rating of the car after their trips, or — before anyone has rated it — a "New" badge.
function Rating({ rating }) {
  if (!rating) {
    return (
      <span
        className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-1 text-[0.7rem] font-bold text-emerald-700 ring-1 ring-emerald-100"
        title="No ratings yet — be the first to rate it after your trip"
      >
        <SparkIcon className="h-3.5 w-3.5" /> New
      </span>
    );
  }
  return (
    <span
      className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-accent-50 px-2 py-1 text-xs font-bold text-slate-800 ring-1 ring-accent-100"
      title={`Rated ${rating.avg.toFixed(1)} out of 5 by ${rating.count} guest${rating.count === 1 ? '' : 's'}`}
    >
      <StarIcon className="h-3.5 w-3.5 text-accent" /> {rating.avg.toFixed(1)}
      <span className="font-medium text-slate-500">({rating.count})</span>
    </span>
  );
}

// A car as shown to visitors (no login needed): photos in the site-wide 4:3 frame, specs, price and the
// customers' rating, with a WhatsApp enquiry (dates picked in a pop-up) instead of online booking, and a
// Call button beside it.
// layout="list" is the wide card on the Cars page (photo on the left from tablet up); "grid" stacks.
// The whole card opens the car's page — except its buttons and links (Book Now, Call, photo arrows).
export default function CarCard({ car, layout = 'grid' }) {
  const navigate = useNavigate();
  const name = `${vehicleName(car)} ${car.year || ''}`.trim();
  const list = layout === 'list';
  const parking = parkingArea(car.parkingLocation);

  return (
    <article
      onClick={(e) => {
        if (!e.target.closest('a, button, input, label, select')) navigate(`/cars/${car._id}`);
      }}
      className={`group flex cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg ${
        list ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      <Link to={`/cars/${car._id}`} className={`block flex-shrink-0 ${list ? 'sm:w-64 sm:p-3 lg:w-72' : ''}`} aria-label={`${name} details`}>
        <Carousel photos={car.photos} alt={vehicleName(car)} className={`aspect-[4/3] ${list ? 'sm:rounded-xl' : ''}`} />
      </Link>
      <div className={`flex flex-1 flex-col p-4 ${list ? 'sm:py-4 sm:pl-2 sm:pr-5' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/cars/${car._id}`} className="block truncate text-lg font-extrabold text-primary hover:text-accent-700">
              {vehicleName(car)}
              {car.vehicleCategory && <span className="ml-1.5 text-xs font-medium lowercase text-slate-500">{car.vehicleCategory}</span>}
            </Link>
            <p className="text-xs text-slate-500">{car.year} model</p>
          </div>
          <Rating rating={car.rating} />
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          <Spec icon={GearIcon}>{car.transmission}</Spec>
          <Spec icon={FuelIcon}>{car.fuel}</Spec>
          <Spec icon={CarIcon}>{car.vehicleType}</Spec>
        </div>
        <p className="mt-2.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-600" title={car.parkingLocation?.address || undefined}>
          <MapPinIcon className="h-4 w-4 flex-shrink-0 text-accent-600" />
          <span className="truncate">
            <span className="font-semibold text-slate-700">Parking:</span> {parking}
          </span>
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <CarPrice car={car} />
            {list && (
              <Link to={`/cars/${car._id}`} className="hidden items-center gap-1 text-sm font-bold text-accent-600 hover:underline sm:inline-flex">
                Details <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => openEnquiry(name)}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-accent/25 transition-colors hover:bg-accent-600"
            >
              <WhatsAppIcon className="h-4 w-4" /> Book Now
            </button>
            <CallButton />
          </div>
        </div>
      </div>
    </article>
  );
}
