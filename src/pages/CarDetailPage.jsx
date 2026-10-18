import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Carousel from '../components/Carousel';
import EnquiryBar from '../components/EnquiryBar';
import CarPrice from '../components/CarPrice';
import CallButton from '../components/CallButton';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ArrowLeftIcon, CarIcon, FuelIcon, GearIcon, StarIcon, CalendarIcon, QuoteIcon, MapPinIcon, ArrowRightIcon } from '../components/icons';
import { fetchVehicle, fetchVehicleReviews } from '../api/portal';
import { vehicleName } from '../utils/format';
import { mapsEmbedUrl, mapsLink, parkingArea } from '../utils/location';
import { DEFAULT_TITLE } from '../utils/site';

// Where the car is parked — the pickup point, with a map.
function ParkingLocation({ location }) {
  return (
    <section className="mt-10" aria-labelledby="parking-heading">
      <h2 id="parking-heading" className="text-xl font-extrabold text-primary sm:text-2xl">
        Parking Location
      </h2>
      <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-center gap-3 p-5 sm:p-6">
          <p className="flex items-start gap-2.5 text-sm font-semibold text-slate-900">
            <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-600" />
            {parkingArea(location)}
          </p>
          <p className="text-xs text-slate-500">Pick up and drop off the car here, in Bengaluru.</p>
          <a
            href={mapsLink(location)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-accent-600 hover:underline"
          >
            Open in Google Maps <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
        <iframe
          title="Parking location map"
          src={mapsEmbedUrl(location)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-56 w-full border-0 md:h-64"
        />
      </div>
    </section>
  );
}

function Stars({ value, size = 'h-4 w-4' }) {
  return (
    <span className="flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`${size} ${n <= Math.round(value) ? 'text-accent' : 'text-slate-200'}`} />
      ))}
    </span>
  );
}

function formatReviewDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '';
}

// "Our Reviews" — what customers said about this car after their trips (their one trip rating + review).
function CarReviews({ carId, rating }) {
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    fetchVehicleReviews(carId)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [carId]);

  const written = (reviews || []).filter((r) => r.review);
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, count: (reviews || []).filter((r) => r.rating === n).length }));
  const total = reviews?.length || 0;

  return (
    <section className="mt-10" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl font-extrabold text-primary sm:text-2xl">
        Our Reviews
      </h2>
      {reviews === null ? (
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-white" />
      ) : !total ? (
        <p className="mt-3 rounded-2xl bg-white px-5 py-6 text-sm text-slate-500 ring-1 ring-slate-200">
          No reviews yet — guests can rate this car after their trip.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <p className="text-4xl font-extrabold text-primary">{(rating?.avg ?? 0).toFixed(1)}</p>
            <Stars value={rating?.avg ?? 0} size="h-5 w-5" />
            <p className="mt-1 text-sm text-slate-500">
              {total} rating{total === 1 ? '' : 's'}
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              {breakdown.map(({ n, count }) => (
                <div key={n} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-3">{n}</span>
                  <StarIcon className="h-3 w-3 text-accent" />
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${(count / total) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-slate-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {(written.length ? written : reviews).slice(0, 20).map((r) => (
              <li key={r._id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{r.name.charAt(0)}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-400">{formatReviewDate(r.ratedAt)}</p>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.review && (
                  <p className="mt-3 flex gap-2 text-sm leading-relaxed text-slate-700">
                    <QuoteIcon className="h-4 w-4 flex-shrink-0 text-accent-300" /> {r.review}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// One car: photos, specs and price, a WhatsApp enquiry with dates, and customers' reviews.
export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(undefined);

  useEffect(() => {
    setCar(undefined);
    fetchVehicle(id)
      .then(setCar)
      .catch(() => setCar(null));
  }, [id]);

  useEffect(() => {
    if (car) document.title = `${vehicleName(car)} ${car.year} on Rent in Bengaluru | RoamWheels`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [car]);

  if (car === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="aspect-[4/3] max-w-2xl animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }
  if (car === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CarIcon className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-3 text-xl font-extrabold text-primary">This car isn&apos;t available</h1>
        <p className="mt-1 text-sm text-slate-500">It may have been taken off the site. Have a look at our other cars.</p>
        <Link to="/cars" className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white">
          Browse cars
        </Link>
      </div>
    );
  }

  const name = `${vehicleName(car)} ${car.year || ''}`.trim();
  const specs = [
    { icon: CarIcon, label: 'Segment', value: car.vehicleCategory || car.vehicleType },
    { icon: GearIcon, label: 'Transmission', value: car.transmission },
    { icon: FuelIcon, label: 'Fuel', value: car.fuel },
    { icon: CalendarIcon, label: 'Model year', value: car.year },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-5 sm:px-6 sm:pt-8 lg:px-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/cars" className="inline-flex items-center gap-1 font-semibold text-accent-600 hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> All cars
        </Link>
        <span>/</span>
        <span className="truncate">{vehicleName(car)}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <Carousel photos={car.photos} alt={vehicleName(car)} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-accent-600">{car.make}</p>
            <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">{car.model}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {car.rating ? (
                <>
                  <Stars value={car.rating.avg} />
                  <span className="font-bold text-slate-800">{car.rating.avg.toFixed(1)}</span>
                  <a href="#reviews-heading" className="text-slate-500 hover:underline">
                    ({car.rating.count} review{car.rating.count === 1 ? '' : 's'})
                  </a>
                </>
              ) : (
                <span className="font-semibold text-emerald-700">New on Roam Wheels</span>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
                  <Icon className="h-5 w-5 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="truncate text-sm font-semibold text-slate-900">{value || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-white">
              <span className="text-sm text-primary-100">Price</span>
              <CarPrice car={car} dark />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="mb-4 text-base font-bold text-primary">Check availability</h2>
            <EnquiryBar carName={name} compact showCall />
          </div>
        </div>
      </div>

      <ParkingLocation location={car.parkingLocation} />

      <CarReviews carId={car._id} rating={car.rating} />

      <div className="mt-10 rounded-2xl bg-white px-6 py-8 text-center ring-1 ring-slate-200">
        <p className="font-bold text-slate-900">Questions about the {name}?</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <WhatsAppButton message={`Hi Roam Wheels! I have a question about the ${name}.`} />
          <CallButton label="Call Us" className="py-2.5" />
        </div>
      </div>
    </div>
  );
}
