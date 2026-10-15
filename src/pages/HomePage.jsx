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
import { CarIcon, ShieldCheckIcon, MapPinIcon, HeadsetIcon, PhoneIcon, MailIcon, ArrowRightIcon, SearchIcon, StarIcon } from '../components/icons';
import { fetchVehicles, fetchSiteStats } from '../api/portal';
import { SUPPORT_PHONE, SUPPORT_EMAIL, phoneLink, formatPhone } from '../utils/contact';
import heroImage from '../assets/login-hero.png';

const FEATURED_COUNT = 6;

// "1234" -> "1,200+" style rounding for headline numbers; small numbers stay exact.
function headline(n) {
  if (n < 50) return String(n);
  const step = n < 1000 ? 50 : 500;
  return `${(Math.floor(n / step) * step).toLocaleString('en-IN')}+`;
}

// The numbers under the headline (Zoomcar-style). Only the ones worth showing appear.
function HeroStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetchSiteStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);
  if (!stats) return <div className="h-6" />;
  const items = [
    stats.cars > 0 && { value: stats.cars, label: stats.cars === 1 ? 'Car' : 'Cars' },
    stats.completedTrips >= 10 && { value: headline(stats.completedTrips), label: 'Trips' },
    stats.ratings > 0 && stats.avgRating && { value: `${stats.avgRating.toFixed(1)}★`, label: 'Average Rating', star: true },
  ].filter(Boolean);
  if (!items.length) return <div className="h-6" />;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
      {items.map((s) => (
        <p key={s.label} className="flex items-baseline gap-1.5 text-slate-600">
          <span className="text-lg font-extrabold text-navy sm:text-xl">{s.value}</span>
          <span className="text-sm">{s.label}</span>
        </p>
      ))}
    </div>
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Our fleet</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Explore <span className="text-blue-600">Our Cars</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">Well-kept cars for every trip — pick one and enquire on WhatsApp.</p>
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
              className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-ink"
            >
              Search
            </button>
          </form>
        </div>

        <OffersStrip className="mt-8" />

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars === null
            ? [0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-white" />)
            : cars.map((car) => <CarCard key={car._id} car={car} />)}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-6 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white"
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
  { icon: MapPinIcon, title: 'Easy Pickup & Drop', text: 'Convenient locations and a smooth process.' },
  { icon: HeadsetIcon, title: '24/7 Support', text: "We're always here when you need us." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Hero: Zoomcar-style centred headline + numbers, with a Mychoize-style pick-up / return bar that
          goes straight to a WhatsApp enquiry. The car photo shows through underneath. */}
      <section className="relative overflow-hidden bg-[#eef3fb]">
        <div className="absolute inset-0 bg-cover bg-[position:65%_100%] md:bg-[position:center_85%]" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#eef3fb] from-45% via-[#eef3fb]/85 via-70% to-[#eef3fb]/10 md:from-35% md:via-60%" />
        <Navbar overlay />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pb-56 pt-24 text-center sm:px-6 sm:pb-72 sm:pt-32 lg:pb-80">
          <p className="rounded-full bg-white/80 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
            Self-drive car rentals
          </p>
          <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] text-navy sm:text-5xl lg:text-6xl">
            Your Next Journey <span className="text-blue-600">Starts Here</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Easy, affordable &amp; flexible — choose your car, choose your dates, and drive without a driver.
          </p>
          <div className="mt-5">
            <HeroStats />
          </div>

          {/* Booking bar */}
          <div className="mt-8 w-full max-w-4xl text-left">
            <div className="inline-flex rounded-t-xl bg-navy px-5 py-2.5 text-sm font-bold text-white">Self-Drive Rentals</div>
            <div className="rounded-b-2xl rounded-tr-2xl bg-white p-4 shadow-xl shadow-navy/10 ring-1 ring-slate-200 sm:p-6">
              <EnquiryBar />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-navy shadow-md ring-1 ring-slate-200 backdrop-blur transition-colors hover:bg-white"
              >
                <CarIcon className="h-4.5 w-4.5" /> Browse Cars
              </Link>
              {SUPPORT_PHONE && (
                <a
                  href={phoneLink()}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-navy shadow-md ring-1 ring-slate-200 backdrop-blur transition-colors hover:bg-white"
                >
                  <PhoneIcon className="h-4.5 w-4.5" /> Call {formatPhone()}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <FeaturedCars />

      <ReviewsCarousel />

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

      <InstagramSection />

      <FaqSection />

      {/* Get in touch */}
      <section id="contact" className="relative scroll-mt-20 overflow-hidden bg-navy px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-cover bg-bottom opacity-25 mix-blend-luminosity" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 to-ink/90" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">Get in touch</p>
          <h2 className="mt-3 text-[1.75rem] font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">Let&apos;s Get You on the Road</h2>
          <p className="mt-3 text-sm text-blue-100/90">
            Have a question or ready to book? Reach out to us on WhatsApp or give us a call — we&apos;ll get back to you instantly.
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
          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-blue-100 sm:flex-row sm:gap-0">
            <Link to="/cars" className="flex items-center gap-2 hover:text-white sm:px-5">
              <CarIcon className="h-4 w-4" /> See Our Cars
            </Link>
            {SUPPORT_EMAIL && <span className="hidden h-4 w-px bg-white/25 sm:block" />}
            {SUPPORT_EMAIL && (
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-white sm:px-5">
                <MailIcon className="h-4 w-4" /> {SUPPORT_EMAIL}
              </a>
            )}
            <span className="hidden h-4 w-px bg-white/25 sm:block" />
            <a href="#reviews" className="flex items-center gap-2 hover:text-white sm:px-5">
              <StarIcon className="h-4 w-4" /> Reviews
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
