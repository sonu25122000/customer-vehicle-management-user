import { Link } from 'react-router-dom';
import { BOOKING_ENABLED } from '../utils/features';

const POINTS = [
  {
    icon: '✓',
    title: 'Guaranteed Trip',
    text: (
      <>
        If we cancel your confirmed trip, get up to <strong className="font-bold text-slate-700">2× refund</strong>*.
      </>
    ),
  },
  { icon: '₹', title: 'Zero Security Deposit', text: 'No large security deposit. Book your car with less upfront cost.' },
  { icon: '↓', title: 'Best Price Guarantee', text: 'Transparent pricing designed to give you great value on every trip.' },
  { icon: '↗', title: 'No Surge Fee', text: 'No surprise surge pricing just because demand is higher.' },
];

const CARD_POINTS = ['Clean & well-maintained cars', 'Flexible rental duration', 'Simple booking process', 'Customer support'];

// "Why book with RoamWheels?" — pricing headline, four promises and a "starting from" card. Sits right
// after the hero's pick-up / return bar.
export default function WhyBookSection() {
  return (
    <section aria-labelledby="why-book-heading" className="relative overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-accent-50" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-16">
        <div>
          <p className="inline-block rounded-full bg-accent-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-accent-700">
            Why book with RoamWheels?
          </p>
          <h2 id="why-book-heading" className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Self-drive cars from <span className="block text-accent-600">₹99/hour</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Simple pricing, reliable cars and no unnecessary surprises. Just book, drive and enjoy your journey.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {POINTS.map((p) => (
              <div key={p.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-lg font-bold text-accent-600"
                >
                  {p.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{p.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/cars"
              className="rounded-xl bg-accent px-7 py-3.5 text-base font-bold text-primary shadow-lg shadow-accent/30 transition-colors hover:bg-accent-600 hover:text-white"
            >
              Explore Cars
            </Link>
            <span className="text-sm text-slate-500">Hourly • Daily • Weekend rentals</span>
          </div>
        </div>

        <div className="rounded-[2rem] bg-primary p-8 text-white shadow-2xl shadow-primary/30 sm:p-10">
          <p className="text-base text-primary-100">Cars starting from</p>
          <p className="mt-3 flex items-baseline font-extrabold leading-none">
            <span className="text-2xl">₹</span>
            <span className="text-7xl tracking-tight">99</span>
            <span className="text-2xl">/hour</span>
          </p>
          <hr className="my-7 border-white/15" />
          <ul className="flex flex-col gap-4 text-base">
            {CARD_POINTS.map((t) => (
              <li key={t}>✓ {t}</li>
            ))}
          </ul>
          <Link
            to={BOOKING_ENABLED ? '/book' : '/cars'}
            className="mt-8 block rounded-xl bg-white px-6 py-3.5 text-center text-base font-bold text-primary transition-colors hover:bg-accent-50"
          >
            Book Your Ride →
          </Link>
        </div>
      </div>
    </section>
  );
}
