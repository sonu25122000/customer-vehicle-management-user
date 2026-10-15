import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarCard from '../components/CarCard';
import OffersStrip from '../components/OffersStrip';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CarIcon, ShieldCheckIcon, MapPinIcon, HeadsetIcon, PhoneIcon, MailIcon, ArrowRightIcon, SearchIcon } from '../components/icons';
import { fetchVehicles } from '../api/portal';
import { SUPPORT_PHONE, SUPPORT_EMAIL } from '../utils/contact';
import heroImage from '../assets/login-hero.png';

const FEATURED_COUNT = 6;

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
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Explore <span className="text-blue-600">Our Cars</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">Well-kept cars for every trip — have a look around.</p>
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
              className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-24 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        <OffersStrip className="mt-8" />

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars === null
            ? [0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-white" />)
            : cars.map((car) => <CarCard key={car._id} car={car} />)}
        </div>
        <div className="mt-8 text-center">
          <Link to="/cars" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
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
  { icon: MapPinIcon, title: 'Easy Pickup & Drop', text: 'Convenient locations and a smooth process.' },
  { icon: HeadsetIcon, title: '24/7 Support', text: "We're always here when you need us." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Hero — same photo and light, sky-toned treatment as the admin portal's login page. */}
      {/* Phone: text on a clear band at the top, car visible underneath. Tablet/desktop: text on the
          left over a sideways fade, car on the right. */}
      <section className="relative overflow-hidden bg-slate-100">
        <div
          className="absolute inset-0 bg-cover bg-[position:62%_100%] md:bg-[position:70%_50%] lg:bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white from-40% via-white/80 via-60% to-white/0 md:bg-gradient-to-r md:from-white/95 md:from-0% md:via-white/60 md:via-45% md:to-white/0" />
        <Navbar overlay />

        <div className="relative mx-auto flex max-w-7xl flex-col px-4 pb-64 pt-24 sm:px-6 sm:pb-80 md:min-h-[600px] md:justify-center md:pb-16 md:pt-28 lg:min-h-[680px] lg:px-8">
          <div className="max-w-md lg:max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">Car rental made easy</p>
            <h1 className="mt-3 text-[2.15rem] font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Next Journey <span className="text-blue-600">Starts Here</span>
            </h1>
            <span className="mt-4 block h-1 w-14 rounded-full bg-blue-600" />
            <p className="mt-4 max-w-sm text-base text-slate-700 lg:text-lg">Reliable cars. Flexible plans. Hassle-free rental experience.</p>

            <div className="mt-7 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
              <WhatsAppButton />
              <Link
                to="/cars"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-ink"
              >
                <CarIcon className="h-5 w-5" /> Browse Cars
              </Link>
              {SUPPORT_PHONE && (
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-400 bg-white/70 px-6 py-3 text-sm font-bold text-slate-800 backdrop-blur transition-colors hover:bg-white"
                >
                  <PhoneIcon className="h-4.5 w-4.5" /> Call Now
                </a>
              )}
            </div>
            <p className="mt-6 hidden text-sm font-semibold text-slate-600 sm:block">
              Better Rides <span className="mx-1.5 text-blue-600">•</span> Greater Journeys
            </p>
          </div>
        </div>
      </section>

      <FeaturedCars />

      {/* Why choose */}
      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Why Choose <span className="text-blue-600">Roam Wheels</span>?
          </h2>
          <p className="mt-2 text-sm text-slate-500">We make car rentals simple, safe and convenient.</p>

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-10">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/60 sm:h-16 sm:w-16">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-sm font-bold text-slate-900">{title}</h3>
                <p className="mt-1 max-w-[13rem] text-xs leading-relaxed text-slate-500 lg:text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get in touch */}
      <section className="relative overflow-hidden bg-navy px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-24">
        <div
          className="absolute inset-0 bg-cover bg-bottom opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 to-ink/90" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">Get in touch</p>
          <h2 className="mt-3 text-[1.75rem] font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">Let&apos;s Get You on the Road</h2>
          <p className="mt-3 text-sm text-blue-100/90">
            Have a question or ready to book? Reach out to us on WhatsApp and we&apos;ll get back to you instantly.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <WhatsAppButton />
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              See Our Cars <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          {(SUPPORT_PHONE || SUPPORT_EMAIL) && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-blue-100 sm:flex-row sm:gap-0">
              {SUPPORT_PHONE && (
                <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-2 hover:text-white sm:px-5">
                  <PhoneIcon className="h-4 w-4" /> {SUPPORT_PHONE}
                </a>
              )}
              {SUPPORT_PHONE && SUPPORT_EMAIL && <span className="hidden h-4 w-px bg-white/25 sm:block" />}
              {SUPPORT_EMAIL && (
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-white sm:px-5">
                  <MailIcon className="h-4 w-4" /> {SUPPORT_EMAIL}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
