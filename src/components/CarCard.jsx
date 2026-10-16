import { useState } from 'react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
import Modal from './Modal';
import EnquiryBar from './EnquiryBar';
import { formatMoney, vehicleName } from '../utils/format';
import { parkingArea } from '../utils/location';
import { CarIcon, FuelIcon, GearIcon, StarIcon, WhatsAppIcon, ArrowRightIcon, MapPinIcon } from './icons';

function Spec({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <Icon className="h-4 w-4 text-slate-400" /> {children}
    </span>
  );
}

function Rating({ rating }) {
  if (!rating) return <span className="text-xs font-semibold text-emerald-700">New</span>;
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
      <StarIcon className="h-3.5 w-3.5 text-amber-400" /> {rating.avg.toFixed(1)}
      <span className="font-normal text-slate-400">({rating.count})</span>
    </span>
  );
}

// A car as shown to visitors (no login needed): photos in the site-wide 4:3 frame, specs, price and the
// customers' rating, with a WhatsApp enquiry (dates picked in a pop-up) instead of online booking.
// layout="list" is the wide card on the Cars page (photo on the left from tablet up); "grid" stacks.
// showRating={false} leaves the rating out (the home page doesn't show ratings).
export default function CarCard({ car, layout = 'grid', showRating = true }) {
  const [enquiring, setEnquiring] = useState(false);
  const name = `${vehicleName(car)} ${car.year || ''}`.trim();
  const list = layout === 'list';
  const parking = parkingArea(car.parkingLocation);

  return (
    <article
      className={`group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg ${
        list ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      <Link to={`/cars/${car._id}`} className={`block flex-shrink-0 ${list ? 'sm:w-64 sm:p-3 lg:w-72' : ''}`} aria-label={`${name} details`}>
        <Carousel photos={car.photos} alt={vehicleName(car)} className={`aspect-[4/3] ${list ? 'sm:rounded-xl' : ''}`} />
      </Link>
      <div className={`flex flex-1 flex-col p-4 ${list ? 'sm:py-4 sm:pl-2 sm:pr-5' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/cars/${car._id}`} className="block truncate text-lg font-extrabold text-navy hover:text-blue-700">
              {vehicleName(car)}
              {car.vehicleCategory && <span className="ml-1.5 text-xs font-medium lowercase text-slate-500">{car.vehicleCategory}</span>}
            </Link>
            <p className="text-xs text-slate-500">{car.year} model</p>
          </div>
          {showRating && <Rating rating={car.rating} />}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          <Spec icon={GearIcon}>{car.transmission}</Spec>
          <Spec icon={FuelIcon}>{car.fuel}</Spec>
          <Spec icon={CarIcon}>{car.vehicleType}</Spec>
        </div>
        <p className="mt-2.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-600" title={car.parkingLocation?.address || undefined}>
          <MapPinIcon className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <span className="truncate">
            <span className="font-semibold text-slate-700">Parking:</span> {parking}
          </span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {car.pricePerDay ? (
              <>
                <p className="text-xl font-extrabold leading-none text-slate-900">{formatMoney(car.pricePerDay)}</p>
                <p className="mt-1 text-[0.7rem] text-slate-500">per day</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-slate-500">Price on request</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {list && (
              <Link to={`/cars/${car._id}`} className="hidden items-center gap-1 text-sm font-bold text-blue-600 hover:underline sm:inline-flex">
                Details <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setEnquiring(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-navy/20 transition-colors hover:bg-ink"
            >
              <WhatsAppIcon className="h-4 w-4" /> Enquire
            </button>
          </div>
        </div>
      </div>

      {enquiring && (
        <Modal title={`Enquire about the ${name}`} onClose={() => setEnquiring(false)}>
          <p className="mb-4 text-sm text-slate-500">Pick your dates — we&apos;ll open WhatsApp with them filled in.</p>
          <EnquiryBar carName={name} compact />
        </Modal>
      )}
    </article>
  );
}
