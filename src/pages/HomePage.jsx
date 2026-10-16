import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarCard from '../components/CarCard';
import OffersStrip from '../components/OffersStrip';
import EnquiryBar from '../components/EnquiryBar';
import ReviewsCarousel from '../components/ReviewsCarousel';
import InstagramSection from '../components/InstagramSection';
import FaqSection from '../components/FaqSection';
import { WhatsAppButton } from '../components/WhatsAppButton';
import {
  CarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  HeadsetIcon,
  PhoneIcon,
  MailIcon,
  ArrowRightIcon,
  SearchIcon,
  StarIcon,
  RouteIcon,
  UserIcon,
  CheckIcon,
} from '../components/icons';
import { fetchVehicles } from '../api/portal';
import { SUPPORT_PHONE, SUPPORT_EMAIL, phoneLink, formatPhone } from '../utils/contact';
import { SITE_METRICS } from '../utils/site';
import heroImage from '../assets/login-hero.png';

const FEATURED_COUNT = 6;
const METRIC_ICONS = [RouteIcon, UserIcon, StarIcon, CheckIcon];

// Our numbers (utils/site.js), in a band overlapping the bottom of the hero.
function MetricsBand() {
  return (
    <section aria-label="Roam Wheels in numbers" className="relative z-10 -mt-12 bg-gradient-to-b from-transparent from-50% to-slate-50 to-50% px-4 sm:-mt-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-3xl bg-primary shadow-2xl shadow-primary/25 lg:grid-cols-4">
        {SITE_METRICS.map((m, i) => {
          const Icon = METRIC_ICONS[i % METRIC_ICONS.length];
          return (
            <div
              key={m.label}
              className={`flex items-center gap-3 px-4 py-5 sm:gap-4 sm:px-7 sm:py-7 ${i % 2 ? 'border-l border-white/10' : ''} ${
                i >= 2 ? 'border-t border-white/10 lg:border-t-0' : ''
              } ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <span className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-accent sm:flex">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-2xl font-extrabold leading-none text-white sm:text-3xl">
                  {m.value}
                  {m.star && <StarIcon className="h-5 w-5 text-accent sm:h-6 sm:w-6" />}
                </p>
                <p className="mt-1.5 text-xs font-medium text-primary-100/80 sm:text-sm">{m.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// A few of our cars, right on the home page — anyone can browse, no login needed.
function FeaturedCars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Cars with photos first — they make a better first impression.
    fetchVehicles()
      .then((list) => setCars([...list].sort((a, b) => (b.photos.length > 0) - (a.photos.length > 0)).slice(0, FEATURED_COUNT)))
      .catch(() => setCars([]));
  }, []);

  if (cars !== null && cars.length === 0) return null;

  return (
    <section className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">Our fleet in Bengaluru</p>
            <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
              Self-Drive Cars in <span className="text-accent-600">Bengaluru</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">Well-kept cars for city drives and weekend getaways — pick one and tap Book Now.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(search.trim() ? `/cars?q=${encodeURIComponent(search.trim())}` : '/cars');
            }}
            className="relative w-full md:max-w-sm"
          >
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cars (e.g. SUV, Swift)"
              aria-label="Search cars"
              className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-24 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-100"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark"
            >
              Search
            </button>
          </form>
        </div>

        <OffersStrip className="mt-8" />

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars === null
            ? [0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-white" />)
            : cars.map((car) => <CarCard key={car._id} car={car} showRating={false} />)}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            View all cars <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: CarIcon, title: 'Well-Maintained Cars', text: 'Clean, safe and road-ready vehicles.' },
  { icon: ShieldCheckIcon, title: 'Flexible Rental Plans', text: 'Daily, weekly or long-term — your choice.' },
  { icon: MapPinIcon, title: 'Pickup in Whitefield', text: 'Easy pickup and drop in Whitefield, Bengaluru.' },
  { icon: HeadsetIcon, title: '24/7 Support', text: "We're always here when you need us." },
];

// Weekend getaways mentioned in the "car rental in Bengaluru" section.
const GETAWAYS = ['Nandi Hills', 'Mysuru', 'Coorg', 'Chikmagalur', 'Ooty', 'Pondicherry'];

// Who we are and where we operate — written for people searching for a car rental in Bengaluru.
function BengaluruSection() {
  return (
    <section aria-labelledby="bengaluru-heading" className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">Only in Bengaluru</p>
          <h2 id="bengaluru-heading" className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
            Self-Drive Car Rental in <span className="text-accent-600">Whitefield, Bengaluru</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Roam Wheels is a Bengaluru car rental service based in Whitefield. We rent self-drive cars only in Bengaluru (Bangalore) —
            for office commutes, airport runs, family outings and weekend road trips out of the city. Choose your car, pick your
            dates and drive it yourself, with no driver and no hidden surprises.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Popular with renters across East Bengaluru, and a great start for getaways to {GETAWAYS.slice(0, -1).join(', ')} and{' '}
            {GETAWAYS[GETAWAYS.length - 1]}.
          </p>
          <Link
            to="/cars"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dark"
          >
            See cars in Bengaluru <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Hero: Zoomcar-style centred headline + numbers, with a Mychoize-style pick-up / return bar that
          goes straight to a WhatsApp enquiry. The car photo shows through underneath. */}
      <section className="relative overflow-hidden bg-primary-50">
        <div className="absolute inset-0 bg-cover bg-[position:65%_100%] md:bg-[position:center_85%]" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 from-45% via-primary-50/85 via-70% to-primary-50/10 md:from-35% md:via-60%" />
        <Navbar overlay />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pb-72 sm:pt-32 lg:pb-80">
          <p className="flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-accent-700 shadow-sm ring-1 ring-accent-100 backdrop-blur">
            <MapPinIcon className="h-3.5 w-3.5" /> Self-drive car rentals in Bengaluru
          </p>
          <h1 className="mt-4 max-w-4xl text-[2rem] font-extrabold leading-[1.1] text-primary sm:text-5xl lg:text-6xl">
            Find the Perfect Car for Your <span className="text-accent">Next Journey</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Easy, affordable &amp; flexible. Choose your car, pick your dates, and enjoy the freedom of every journey.
          </p>

          {/* Booking bar */}
          <div className="mt-8 w-full max-w-6xl text-left">
            <div className="inline-flex rounded-t-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Self-Drive Rentals · Bengaluru</div>
            <div className="rounded-b-2xl rounded-tr-2xl bg-white p-4 shadow-xl shadow-primary/10 ring-1 ring-slate-200 sm:p-6">
              <EnquiryBar showCity />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-primary shadow-md ring-1 ring-slate-200 backdrop-blur transition-colors hover:bg-white"
              >
                <CarIcon className="h-4.5 w-4.5" /> Browse Cars
              </Link>
              {SUPPORT_PHONE && (
                <a
                  href={phoneLink()}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-primary shadow-md ring-1 ring-slate-200 backdrop-blur transition-colors hover:bg-white"
                >
                  <PhoneIcon className="h-4.5 w-4.5" /> Call {formatPhone()}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <MetricsBand />

      <FeaturedCars />

      <ReviewsCarousel />

      {/* Why choose */}
      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">
            Why Choose <span className="text-accent-600">Roam Wheels</span>?
          </h2>
          <p className="mt-2 text-sm text-slate-500">We make car rentals in Bengaluru simple, safe and convenient.</p>

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-10">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600 ring-8 ring-accent-50/60 sm:h-16 sm:w-16">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-sm font-bold text-slate-900">{title}</h3>
                <p className="mt-1 max-w-[13rem] text-xs leading-relaxed text-slate-500 lg:text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BengaluruSection />

      <InstagramSection />

      <FaqSection />

      {/* Get in touch */}
      <section id="contact" className="relative scroll-mt-20 overflow-hidden bg-primary px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-cover bg-bottom opacity-25 mix-blend-luminosity" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary-dark/90" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Get in touch</p>
          <h2 className="mt-3 text-[1.75rem] font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">Let&apos;s Get You on the Road</h2>
          <p className="mt-3 text-sm text-primary-100/90">
            Need a self-drive car in Bengaluru? Reach out to us on WhatsApp or give us a call — we&apos;ll get back to you instantly.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <WhatsAppButton />
            {SUPPORT_PHONE && (
              <a
                href={phoneLink()}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <PhoneIcon className="h-4 w-4" /> {formatPhone()}
              </a>
            )}
          </div>
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-8 inline-flex items-center gap-2 text-sm text-primary-100 hover:text-white">
              <MailIcon className="h-4 w-4" /> {SUPPORT_EMAIL}
            </a>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
